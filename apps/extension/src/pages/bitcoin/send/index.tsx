import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../stores";
import { useNavigate } from "react-router";
import { TokenItem } from "../../main/components";
import { Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { useNotification } from "../../../hooks/notification";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import {
  usePsbtSimulator,
  useSendTxConfig,
  useTxConfigsValidate,
  EmptyAddressError,
  EmptyAmountError,
  ZeroAmountError,
} from "@keplr-wallet/hooks-bitcoin";
import { FormattedMessage, useIntl } from "react-intl";
import { isRunningInSidePanel } from "../../../utils";
import { useBitcoinTxConfigsQueryString } from "../../../hooks/bitcoin/use-tx-configs-query-string";
import { RecipientInput } from "../components/input/recipient-input";
import { AmountInput } from "../components/input/amount-input";
import styled from "styled-components";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { toXOnly } from "@keplr-wallet/crypto";
import { FeeControl } from "../components/input/fee-control";
import { useGetUTXOs } from "../../../hooks/bitcoin/use-get-utxos";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { Psbt } from "bitcoinjs-lib";
import {
  AddRecentSendHistoryMsg,
  PushBitcoinTransactionMsg,
} from "@keplr-wallet/background";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const BitcoinSendPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    accountStore,
    chainStore,
    bitcoinAccountStore,
    bitcoinQueriesStore,
  } = useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const notification = useNotification();

  const [isLoading, setIsLoading] = useState(false);

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId =
    initialChainId ||
    (() => {
      let r = "";

      for (const modularChainInfo of chainStore.modularChainInfosInUI) {
        if ("bitcoin" in modularChainInfo) {
          r = modularChainInfo.chainId;
          break;
        }
      }

      if (!r) {
        throw new Error("Can't find initial chain id");
      }
      return r;
    })();
  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not bitcoin chain`);
  }
  const bitcoin = modularChainInfo.bitcoin;

  const coinMinimalDenom =
    initialCoinMinimalDenom || bitcoin.currencies[0].coinMinimalDenom;
  const currency = (() => {
    const res = chainStore
      .getModularChainInfoImpl(chainId)
      .getCurrencies("bitcoin")
      .find((cur) => cur.coinMinimalDenom === coinMinimalDenom);
    if (res) {
      return res;
    }
    return {
      coinMinimalDenom,
      coinDenom: coinMinimalDenom,
      coinDecimals: 0,
    };
  })();

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/bitcoin/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);
  const bitcoinAccount = bitcoinAccountStore.getAccount(chainId);
  const bitcoinQueries = bitcoinQueriesStore.get(chainId);

  const sender = account.bitcoinAddress?.bech32Address ?? "";
  const paymentType = account.bitcoinAddress?.paymentType;
  const balance = bitcoinQueries.queryBitcoinBalance.getBalance(
    chainId,
    chainStore,
    sender,
    currency.coinMinimalDenom
  );

  const initialFeeRate =
    bitcoinQueries.queryBitcoinFeeEstimates.fees.halfHourFee;

  // simulate 함수 안에서 불러오지 않고 커스텀 훅으로 대체해서
  // 페이지가 렌더링될 때 한 번만 호출해도 충분할 것으로 예상된다.
  const {
    isFetching: isFetchingAvailableUTXOs,
    error: availableUTXOsError,
    availableUTXOs,
    // availableBalance, // TODO: send page에서 balance, fee check할 때 사용해야 함 - 어떻게 해야 할지 고민중
  } = useGetUTXOs(chainId, sender, paymentType === "taproot", true);

  const sendConfigs = useSendTxConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    sender,
    initialFeeRate
  );
  sendConfigs.amountConfig.setCurrency(currency);

  // bitcoin tx size는 amount, fee rate, recipient address type에 따라 달라진다.
  // 또한 별도의 simulator refresh 로직이 없기 때문에 availableUTXOs의 값이 변경되면
  // 새로운 key를 생성해서 새로운 simulator를 생성하도록 한다.
  const psbtSimulatorKey = useMemo(() => {
    const recipientPrefix = (() => {
      if (!sendConfigs.recipientConfig.uiProperties.error) {
        // return leading 4 string of recipient address if recipient is valid (bc1p, bc1q, tb1p, tb1q)
        return sendConfigs.recipientConfig.recipient.slice(0, 4);
      }

      return "invalid";
    })();

    const amountHex = (() => {
      if (sendConfigs.amountConfig.amount) {
        const totalAmount = sendConfigs.amountConfig.amount.reduce(
          (acc, cur) => acc.add(new Dec(cur.toCoin().amount)),
          new Dec(0)
        );

        return totalAmount.toString(16);
      }

      return "0";
    })();

    return (
      recipientPrefix +
      amountHex +
      sendConfigs.feeRateConfig.feeRate.toString() +
      availableUTXOs.length.toString()
    );
  }, [
    sendConfigs.amountConfig.amount,
    sendConfigs.feeRateConfig.feeRate,
    sendConfigs.recipientConfig.recipient,
    sendConfigs.recipientConfig.uiProperties.error,
    availableUTXOs,
  ]);

  const psbtSimulator = usePsbtSimulator(
    new ExtensionKVStore("psbt-simulator.bitcoin.send"),
    chainStore,
    chainId,
    sendConfigs.txSizeConfig,
    psbtSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        // If the error is not empty amount error or zero amount error or empty address error,
        // simulate fee anyway to show initial fee.
        (sendConfigs.amountConfig.uiProperties.error != null &&
          !(
            sendConfigs.amountConfig.uiProperties.error instanceof
            EmptyAmountError
          ) &&
          !(
            sendConfigs.amountConfig.uiProperties.error instanceof
            ZeroAmountError
          )) ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        (sendConfigs.recipientConfig.uiProperties.error != null &&
          !(
            sendConfigs.recipientConfig.uiProperties.error instanceof
            EmptyAddressError
          ))
      ) {
        throw new Error("Not ready to simulate psbt");
      }

      if (isFetchingAvailableUTXOs) {
        throw new Error("Fetching available utxos");
      }

      if (availableUTXOsError) {
        throw new Error("Can't find available utxos");
      }

      const simulate = async (): Promise<{
        psbtHex: string;
        txSize: {
          txVBytes: number;
          txBytes: number;
          txWeight: number;
        };
      }> => {
        // refresh는 필요없다. -> 블록 생성 시간이 10분
        const senderAddress = sendConfigs.senderConfig.sender;
        const publicKey = account.pubKey;
        const xonlyPubKey = publicKey
          ? toXOnly(Buffer.from(publicKey))
          : undefined;
        const feeRate = sendConfigs.feeRateConfig.feeRate;
        const isSendMax = sendConfigs.amountConfig.fraction === 1;

        const MAX_SAFE_OUTPUT = new Dec(2 ** 53 - 1);
        const ZERO = new Dec(0);
        const amountInSatoshi = new Dec(
          sendConfigs.amountConfig.amount[0].toCoin().amount
        );

        let recipientsForTransaction = [];
        if (amountInSatoshi.gt(MAX_SAFE_OUTPUT)) {
          // 큰 금액을 여러 출력으로 분할
          let remainingValue = amountInSatoshi;
          while (!remainingValue.gt(ZERO)) {
            const chunkValue = remainingValue.gt(MAX_SAFE_OUTPUT)
              ? MAX_SAFE_OUTPUT
              : remainingValue;
            recipientsForTransaction.push({
              address: sendConfigs.recipientConfig.recipient,
              value: chunkValue.truncate().toBigNumber().toJSNumber(),
            });
            remainingValue = remainingValue.sub(chunkValue);
          }
        } else {
          recipientsForTransaction = [
            {
              address: sendConfigs.recipientConfig.recipient,
              value: amountInSatoshi.truncate().toBigNumber().toJSNumber(),
            },
          ];
        }

        const selection = bitcoinAccount.selectUTXOs({
          senderAddress,
          utxos: availableUTXOs,
          recipients: recipientsForTransaction,
          feeRate,
          isSendMax,
        });

        if (!selection) {
          throw new Error("Can't find proper utxos selection");
        }

        const { selectedUtxos, txSize, hasChange } = selection;

        // TODO: hardware wallet 사용 시, bip32 derivation path를 명시해줄 필요가 있다.

        const psbtHex = bitcoinAccount.buildPsbt({
          inputs: selectedUtxos.map((utxo) => ({
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.value,
            address: senderAddress,
            tapInternalKey: xonlyPubKey,
          })),
          changeAddress: senderAddress,
          outputs: recipientsForTransaction,
          feeRate,
          isSendMax,
          hasChange,
        });

        return {
          psbtHex,
          txSize,
        };
      };

      return simulate;
    }
  );

  useBitcoinTxConfigsQueryString({
    ...sendConfigs,
  });

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    psbtSimulator,
  });

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType = "basic-send/bitcoin";

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.send.amount.title" })}
      displayFlex={true}
      fixedMinHeight={true}
      left={<BackButton />}
      right={
        // side panel 모드에서는 detach 모드가 필요가 없다...
        isDetachedMode || isRunningInSidePanel() ? null : (
          <Box
            paddingRight="1rem"
            cursor="pointer"
            onClick={async (e) => {
              e.preventDefault();

              analyticsStore.logEvent("click_popOutButton");
              const url = window.location.href + "&detached=true";

              await openPopupWindow(url, undefined);
              window.close();
            }}
          >
            <DetachIcon size="1.5rem" color={ColorPalette["gray-300"]} />
          </Box>
        )
      }
      bottomButtons={[
        {
          disabled: txConfigsValidate.interactionBlocked,
          text: intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (
          txConfigsValidate.interactionBlocked ||
          !sendConfigs.feeConfig.fee ||
          !psbtSimulator.psbtHex
        ) {
          return;
        }

        setIsLoading(true);

        // CHECK: sign page 넘어갈 때 살짝 딜레이를 줘야할 것 같다.
        // 이미 psbt가 만들어져 있어서 페이지 전환이 너무 빠름.
        // 사용자가 클릭을 여러번 할 경우, detail review 없이 approve 버튼을 누를 수 있다.
        // 이를 방지하기 위해 1초 정도 딜레이를 준다.
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const psbtHex = psbtSimulator.psbtHex;

          const signedPsbtHex = await bitcoinAccount.signPsbt(psbtHex);
          const tx = Psbt.fromHex(signedPsbtHex).extractTransaction();
          const txHex = tx.toHex();

          new InExtensionMessageRequester()
            .sendMessage(
              BACKGROUND_PORT,
              new PushBitcoinTransactionMsg(chainId, txHex)
            )
            .then((txHash) => {
              // balance refresh를 바로 해도 반영이 안될 수 있으므로 딜레이를 주거나
              // 비트코인은 refresh를 하지 않고 넘어간다.

              notification.show(
                "success",
                intl.formatMessage({ id: "notification.transaction-success" }),
                txHash
              );
            })
            .catch((e) => {
              console.log(e);
            });

          new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            new AddRecentSendHistoryMsg(
              chainId,
              historyType,
              sender,
              sendConfigs.recipientConfig.recipient,
              sendConfigs.amountConfig.amount.map((amount) => ({
                amount: amount.toCoin().amount,
                denom: amount.toCoin().denom,
              })),
              "",
              undefined
            )
          );

          if (!isDetachedMode) {
            navigate("/", {
              replace: true,
            });
          } else {
            window.close();
          }
        } catch (e) {
          if (e?.message === "Request rejected") {
            return;
          }
          console.log(e);
          notification.show(
            "failed",
            intl.formatMessage({ id: "error.transaction-failed" }),
            ""
          );
          navigate("/", {
            replace: true,
          });
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <Box
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem" flex={1}>
          <YAxis>
            <Subtitle3>
              <FormattedMessage id="page.send.amount.asset-title" />
            </Subtitle3>
            <Gutter size="0.375rem" />
            <TokenItem
              viewToken={{
                token: balance?.balance ?? new CoinPretty(currency, "0"),
                chainInfo: modularChainInfo,
                isFetching: balance?.isFetching ?? false,
                error: balance?.error,
              }}
              forChange
              onClick={() => {
                navigate(
                  `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            />
          </YAxis>
          <RecipientInput
            ref={addressRef}
            historyType={historyType}
            recipientConfig={sendConfigs.recipientConfig}
          />
          <AmountInput amountConfig={sendConfigs.amountConfig} />

          <Styles.Flex1 />
          <Gutter size="0" />

          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            feeRateConfig={sendConfigs.feeRateConfig}
            psbtSimulator={psbtSimulator}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});

const DetachIcon: FunctionComponent<{
  size: string;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
};

// const noop = (..._args: any[]) => {
//   // noop
// };
