import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { Stack } from "../../../components/stack";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

import { useStore } from "../../../stores";
import {
  AccountNotDeployed,
  EmptyAddressError,
  EmptyAmountError,
  useGasSimulator,
  useSendTxConfig,
  useTxConfigsValidate,
  ZeroAmountError,
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
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ColorPalette } from "../../../styles";
import { openPopupWindow } from "@keplr-wallet/popup";
import { FormattedMessage, useIntl } from "react-intl";
import { isRunningInSidePanel } from "../../../utils";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  AddRecentSendHistoryMsg,
  LogAnalyticsEventMsg,
  SubmitStarknetTxHashMsg,
} from "@keplr-wallet/background";
import { useStarknetTxConfigsQueryString } from "../../../hooks/starknet/use-tx-configs-query-string";
import { Modal } from "../../../components/modal";
import { AccountActivationModal } from "../components/account-activation-modal";
import { LoadingIcon } from "../../../components/icon";

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
    const res = chainStore
      .getModularChainInfoImpl(chainId)
      .getCurrenciesByModule("starknet")
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
  if (!("type" in currency) || currency.type !== "erc20") {
    throw new Error(`Invalid currency: ${coinMinimalDenom}`);
  }

  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!initialChainId || !initialCoinMinimalDenom) {
      navigate(
        `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
          "/starknet/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
        )}`
      );
    }
  }, [navigate, initialChainId, initialCoinMinimalDenom]);

  const account = accountStore.getAccount(chainId);
  const starknetAccount = starknetAccountStore.getAccount(chainId);
  const starknetQueries = starknetQueriesStore.get(chainId);

  const sender = account.starknetHexAddress;
  const balance = starknetQueries.queryStarknetERC20Balance.getBalance(
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

  const gasSimulationRefresher = useLocalObservable(() => ({
    count: 0,
    increaseCount() {
      this.count++;
    },
  }));

  useEffect(() => {
    // Refresh gas simulation every 12 seconds.
    const interval = setInterval(
      () => gasSimulationRefresher.increaseCount(),
      12000
    );

    return () => clearInterval(interval);
  }, [gasSimulationRefresher]);

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
        throw new Error("Not ready to simulate tx");
      }

      // observed되어야 하므로 꼭 여기서 참조 해야함.
      // const type = sendConfigs.feeConfig.type;
      const feeContractAddress = starknet.strkContractAddress;
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrenciesByModule("starknet")
        .find((cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`);
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      return async () => {
        noop(gasSimulationRefresher.count);

        const estimateResult =
          await starknetAccount.estimateInvokeFeeForSendTokenTx({
            currency: currency,
            amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
            sender: sendConfigs.senderConfig.sender,
            recipient: sendConfigs.recipientConfig.recipient,
          });

        const {
          l1_gas_consumed,
          l1_gas_price,
          l2_gas_consumed,
          l2_gas_price,
          l1_data_gas_consumed,
          l1_data_gas_price,
        } = estimateResult;

        const extraL2GasForOnchainVerification = account.isNanoLedger
          ? new Dec(90240)
          : new Dec(22039040);

        const adjustedL2GasConsumed = new Dec(l2_gas_consumed ?? 0).add(
          extraL2GasForOnchainVerification
        );

        const l1Fee = new Dec(l1_gas_consumed).mul(new Dec(l1_gas_price));
        const l2Fee = adjustedL2GasConsumed.mul(new Dec(l2_gas_price ?? 0));
        const l1DataFee = new Dec(l1_data_gas_consumed).mul(
          new Dec(l1_data_gas_price)
        );

        const calculatedOverallFee = l1Fee.add(l2Fee).add(l1DataFee);

        const totalGasConsumed = new Dec(l1_gas_consumed)
          .add(adjustedL2GasConsumed)
          .add(new Dec(l1_data_gas_consumed));

        const adjustedGasPrice = calculatedOverallFee.quo(totalGasConsumed);

        const gasPriceMargin = new Dec(1.5);

        const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);
        const maxGasPrice = gasPrice.mul(gasPriceMargin);

        sendConfigs.feeConfig.setGasPrice({
          gasPrice: gasPrice,
          maxGasPrice: maxGasPrice,
        });

        return {
          l1Gas: {
            consumed: l1_gas_consumed.toString(),
            price: l1_gas_price.toString(),
          },
          l2Gas: {
            consumed: adjustedL2GasConsumed.toString(),
            price: l2_gas_price?.toString() ?? "0",
          },
          l1DataGas: {
            consumed: l1_data_gas_consumed.toString(),
            price: l1_data_gas_price.toString(),
          },
        };
      };
    }
  );

  useStarknetTxConfigsQueryString({
    ...sendConfigs,
    gasSimulator,
  });

  const txConfigsValidate = useTxConfigsValidate({
    ...sendConfigs,
    gasSimulator,
  });

  const isDetachedMode = searchParams.get("detached") === "true";

  const historyType = "basic-send/starknet";

  const isAccountNotDeployed =
    sendConfigs.senderConfig.uiProperties.error instanceof AccountNotDeployed;
  const [isAccountActivationModalOpen, setIsAccountActivationModalOpen] =
    useState(false);
  useEffect(() => {
    setIsAccountActivationModalOpen(isAccountNotDeployed);
  }, [isAccountNotDeployed]);

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
          disabled:
            starknetAccount.isDeployingAccount ||
            (!isAccountNotDeployed && txConfigsValidate.interactionBlocked),
          left: starknetAccount.isDeployingAccount ? (
            <Box marginRight="0.25rem">
              <LoadingIcon width="1rem" height="1rem" />
            </Box>
          ) : undefined,
          text: starknetAccount.isDeployingAccount
            ? `${intl.formatMessage({ id: "button.activating" })}...`
            : isAccountNotDeployed
            ? intl.formatMessage({ id: "button.activate-account" })
            : intl.formatMessage({ id: "button.next" }),
          color: "primary",
          size: "large",
          type: "submit",
          isLoading,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (isAccountNotDeployed) {
          setIsAccountActivationModalOpen(true);
          return;
        }

        if (!txConfigsValidate.interactionBlocked && gasSimulator.gasEstimate) {
          setIsLoading(true);
          try {
            const feeContractAddress = starknet.strkContractAddress;
            const feeCurrency = chainStore
              .getModularChainInfoImpl(chainId)
              .getCurrenciesByModule("starknet")
              .find(
                (cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`
              );
            if (!feeCurrency) {
              throw new Error("Can't find fee currency");
            }

            const sender = account.starknetHexAddress;
            const recipient = sendConfigs.recipientConfig.recipient;
            const currency = sendConfigs.amountConfig.currency;
            const amount = {
              amount: sendConfigs.amountConfig.amount[0].toDec().toString(),
              denom: currency.coinMinimalDenom,
            };

            const { l1Gas, l2Gas, l1DataGas } = gasSimulator.gasEstimate;

            const margin = new Dec(1.5);

            const maxL1DataGas = new Dec(l1DataGas.consumed).mul(margin);
            const maxL1Gas = new Dec(l1Gas.consumed).mul(margin);
            const maxL2Gas = new Dec(l2Gas.consumed).mul(margin);

            const maxL1DataGasPrice = new Dec(l1DataGas.price).mul(margin);
            const maxL1GasPrice = new Dec(l1Gas.price).mul(margin);
            const maxL2GasPrice = new Dec(l2Gas.price).mul(margin);

            const { transaction_hash: txHash } = await starknetAccountStore
              .getAccount(chainId)
              .executeForSendTokenTx(
                sender,
                amount.amount,
                currency,
                recipient,
                {
                  l1MaxGas: maxL1Gas.truncate().toString(),
                  l1MaxGasPrice: maxL1GasPrice.truncate().toString(),
                  l1MaxDataGas: maxL1DataGas.truncate().toString(),
                  l1MaxDataGasPrice: maxL1DataGasPrice.truncate().toString(),
                  l2MaxGas: maxL2Gas.truncate().toString(),
                  l2MaxGasPrice: maxL2GasPrice.truncate().toString(),
                }
              );

            if (sendConfigs.recipientConfig.nameServiceResult.length > 0) {
              new InExtensionMessageRequester().sendMessage(
                BACKGROUND_PORT,
                new LogAnalyticsEventMsg("send_with_name_service", {
                  chainId: sendConfigs.recipientConfig.chainId,
                  nameService:
                    sendConfigs.recipientConfig.nameServiceResult[0].type,
                })
              );
            }

            new InExtensionMessageRequester()
              .sendMessage(
                BACKGROUND_PORT,
                new SubmitStarknetTxHashMsg(chainId, txHash)
              )
              .then(() => {
                starknetQueries.queryStarknetERC20Balance
                  .getBalance(
                    chainId,
                    chainStore,
                    account.starknetHexAddress,
                    sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom
                  )
                  ?.fetch();
                if (
                  sendConfigs.feeConfig.fee &&
                  sendConfigs.feeConfig.fee.currency.coinMinimalDenom !==
                    sendConfigs.amountConfig.amount[0].currency.coinMinimalDenom
                ) {
                  starknetQueries.queryStarknetERC20Balance
                    .getBalance(
                      chainId,
                      chainStore,
                      account.starknetHexAddress,
                      sendConfigs.feeConfig.fee.currency.coinMinimalDenom
                    )
                    ?.fetch();
                }
                notification.show(
                  "success",
                  intl.formatMessage({
                    id: "notification.transaction-success",
                  }),
                  ""
                );
              })
              .catch((e) => {
                // 이 경우에는 tx가 커밋된 이후의 오류이기 때문에 이미 페이지는 sign 페이지에서부터 전환된 상태다.
                // 따로 멀 처리해줄 필요가 없다
                console.log(e);
              });

            new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              new AddRecentSendHistoryMsg(
                chainId,
                historyType,
                sender,
                recipient,
                [amount],
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
                  )}`,
                  {
                    replace: true,
                  }
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
            gasConfig={sendConfigs.gasConfig}
            gasSimulator={gasSimulator}
          />

          <Gutter size="0" />

          <Modal
            isOpen={isAccountActivationModalOpen}
            align="bottom"
            maxHeight="95vh"
            close={() => navigate(-1)}
          >
            <AccountActivationModal
              close={() => setIsAccountActivationModalOpen(false)}
              goBack={() => navigate(-1)}
              chainId={chainId}
            />
          </Modal>
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

const noop = (..._args: any[]) => {
  // noop
};
