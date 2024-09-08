import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  useGasSimulator,
  useSendTxConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks-starknet";
import { useNavigate } from "react-router";
import { AmountInput } from "../components/input/amount-input";
import { RecipientInput } from "../components/input/reciepient-input";
import { FeeControl } from "../components/input/fee-control";
import { TokenItem } from "../../main/components";
import { Subtitle3 } from "../../../components/typography";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { useNotification } from "../../../hooks/notification";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import { FormattedMessage, useIntl } from "react-intl";
import { isRunningInSidePanel } from "../../../utils";

const Styles = {
  Flex1: styled.div`
    flex: 1;
  `,
};

export const StarknetSendPage: FunctionComponent = observer(() => {
  const {
    analyticsStore,
    accountStore,
    chainStore,
    starknetQueriesStore,
    starknetAccountStore,
  } = useStore();
  const addressRef = useRef<HTMLInputElement | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId =
    initialChainId ||
    (() => {
      let r = "";

      for (const modularChainInfo of chainStore.modularChainInfosInUI) {
        if ("starknet" in modularChainInfo) {
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
  if (!("starknet" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not starknet chain`);
  }
  const starknet = modularChainInfo.starknet;

  const coinMinimalDenom =
    initialCoinMinimalDenom || starknet.currencies[0].coinMinimalDenom;
  const currency = (() => {
    // TODO: 대충 여기에다가 force currency 로직을 박아놓는다...
    //       나중에 이런 기능을 chain store 자체에다가 만들어야한다.
    const res = starknet.currencies.find(
      (cur) => cur.coinMinimalDenom === coinMinimalDenom
    );
    if (res) {
      return res;
    }
    return {
      coinMinimalDenom,
      coinDenom: coinMinimalDenom,
      coinDecimals: 0,
    };
  })();
  if (!("type" in currency) || currency.type !== "erc20") {
    throw new Error(`Invalid currency: ${coinMinimalDenom}`);
  }

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  // TODO
  // useEffect(() => {
  //   if (!initialChainId || !initialCoinMinimalDenom) {
  //     navigate(
  //       `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
  //         "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
  //       )}`
  //     );
  //   }
  // }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);

  const sender = account.starknetHexAddress;
  const balance = starknetQueriesStore
    .get(chainId)
    .queryStarknetERC20Balance.getBalance(
      chainId,
      chainStore,
      sender,
      currency.coinMinimalDenom
    );

  const sendConfigs = useSendTxConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    sender,
    // TODO: 이 값을 어케 처리할지 다시 생각...
    300000
  );
  sendConfigs.amountConfig.setCurrency(currency);

  const gasSimulatorKey = useMemo(() => {
    const res = (() => {
      if (sendConfigs.amountConfig.currency) {
        const amountHexDigits = BigInt(
          sendConfigs.amountConfig.amount[0].toCoin().amount
        ).toString(16).length;
        return amountHexDigits.toString();
      }

      return "0";
    })();

    // fee config의 type마다 다시 시뮬레이션하기 위한 임시조치...
    return res + sendConfigs.feeConfig.type;
  }, [
    sendConfigs.amountConfig.amount,
    sendConfigs.amountConfig.currency,
    sendConfigs.feeConfig.type,
  ]);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.starknet.send"),
    chainStore,
    chainId,
    sendConfigs.gasConfig,
    sendConfigs.feeConfig,
    gasSimulatorKey,
    () => {
      if (!sendConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      const currency = sendConfigs.amountConfig.amount[0].currency;
      if (!("type" in currency) || currency.type !== "erc20") {
        throw new Error(`Invalid currency: ${coinMinimalDenom}`);
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        sendConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.amountConfig.uiProperties.error != null ||
        sendConfigs.recipientConfig.uiProperties.loadingState ===
          "loading-block" ||
        sendConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      // observed되어야 하므로 꼭 여기서 참조 해야함.
      const type = sendConfigs.feeConfig.type;
      const feeContractAddress =
        type === "ETH"
          ? starknet.ethContractAddress
          : starknet.strkContractAddress;
      const feeCurrency = starknet.currencies.find(
        (cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`
      );
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      return {
        simulate: async (): Promise<{
          gasUsed: number;
        }> => {
          const res = await starknetAccountStore
            .getAccount(chainId)
            .estimateInvokeFeeForSendTokenTx(
              {
                currency: currency,
                amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
                sender: sendConfigs.senderConfig.sender,
                recipient: sendConfigs.recipientConfig.recipient,
              },
              type === "ETH" ? "0x2" : "0x3"
            );

          const fee = new CoinPretty(feeCurrency, res.overall_fee);
          const maxFee = new CoinPretty(feeCurrency, res.suggestedMaxFee);
          sendConfigs.feeConfig.setFee({
            fee,
            maxFee,
          });

          return {
            gasUsed: parseInt(res.gas_consumed.toString()),
          };
        },
      };
    }
  );

  // TODO
  // useEffect(() => {
  //   if (isEvmTx) {
  //     // Refresh EIP-1559 fee every 12 seconds.
  //     const intervalId = setInterval(() => {
  //       sendConfigs.feeConfig.refreshEIP1559TxFees();
  //     }, 12000);
  //
  //     return () => clearInterval(intervalId);
  //   }
  // }, [isEvmTx, sendConfigs.feeConfig]);

  // TODO
  // useTxConfigsQueryString(chainId, {
  //   ...sendConfigs,
  //   gasSimulator,
  // });

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType = "basic-send/starknet";

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
      bottomButton={{
        disabled: txConfigsValidate.interactionBlocked,
        text: intl.formatMessage({ id: "button.next" }),
        color: "primary",
        size: "large",
        // TODO
        isLoading: false,
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (sendConfigs.feeConfig.maxFee) {
          starknetAccountStore
            .getAccount(chainId)
            .executeForSendTokenTx(
              account.starknetHexAddress,
              sendConfigs.amountConfig.amount[0].toDec().toString(),
              sendConfigs.amountConfig.currency,
              sendConfigs.recipientConfig.recipient,
              {
                maxFee: new Int(sendConfigs.feeConfig.maxFee.toCoin().amount),
              },
              "0x3"
            )
            .then(console.log)
            .catch(console.log);
          // TODO
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
            currency={sendConfigs.amountConfig.currency}
          />

          <AmountInput amountConfig={sendConfigs.amountConfig} />

          <Styles.Flex1 />
          <Gutter size="0" />

          <FeeControl
            senderConfig={sendConfigs.senderConfig}
            feeConfig={sendConfigs.feeConfig}
            gasConfig={sendConfigs.gasConfig}
            gasSimulator={gasSimulator}
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
