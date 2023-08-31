import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { Box } from "../../components/box";
import { useStore } from "../../stores";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useIBCSwapConfig } from "../../hooks/ibc-swap";
import { SwapAssetInfo } from "./components/swap-asset-info";
import { SwapFeeInfo } from "./components/swap-fee-info";
import { Gutter } from "../../components/gutter";
import { ColorPalette } from "../../styles";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { useGasSimulator, useTxConfigsValidate } from "@keplr-wallet/hooks";
import { useNotification } from "../../hooks/notification";
import { useIntl } from "react-intl";
import { SwapFeeBps } from "../../config.ui";
import { BottomTabsHeightRem } from "../../bottom-tabs";

export const IBCSwapPage: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore, skipQueriesStore } =
    useStore();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialChainId = searchParams.get("chainId");
  const initialCoinMinimalDenom = searchParams.get("coinMinimalDenom");

  const chainId = initialChainId || chainStore.chainInfosInUI[0].chainId;
  const coinMinimalDenom =
    initialCoinMinimalDenom ||
    chainStore.getChain(chainId).currencies[0].coinMinimalDenom;

  const currency = chainStore
    .getChain(chainId)
    .forceFindCurrency(coinMinimalDenom);

  const ibcSwapConfigs = useIBCSwapConfig(
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    chainId,
    accountStore.getAccount(chainId).bech32Address,
    300000,
    "osmosis-1",
    chainStore.getChain("osmosis").forceFindCurrency("uosmo"),
    SwapFeeBps.value
  );

  ibcSwapConfigs.amountConfig.setCurrency(currency);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc-swap.swap"),
    chainStore,
    chainId,
    ibcSwapConfigs.gasConfig,
    ibcSwapConfigs.feeConfig,
    "native",
    () => {
      if (!ibcSwapConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        ibcSwapConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        ibcSwapConfigs.amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const tx = ibcSwapConfigs.amountConfig.getTxIfReady(
        // simulation 자체는 쉽게 통과시키기 위해서 슬리피지를 100으로 설정한다.
        100,
        SwapFeeBps.receiver
      );
      if (!tx) {
        throw new Error("Not ready to simulate tx");
      }

      return tx;
    }
  );

  const intl = useIntl();
  const notification = useNotification();

  const txConfigsValidate = useTxConfigsValidate({
    ...ibcSwapConfigs,
    gasSimulator,
  });

  return (
    <HeaderLayout
      additionalPaddingBottom={BottomTabsHeightRem}
      title="IBC Swap"
      bottomButton={{
        disabled: txConfigsValidate.interactionBlocked,
        text: "Next",
        color: "primary",
        size: "large",
        isLoading: accountStore.getAccount(chainId).isSendingMsg === "TODO",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!txConfigsValidate.interactionBlocked) {
          const tx = await ibcSwapConfigs.amountConfig.getTx(
            5,
            SwapFeeBps.receiver
          );

          try {
            await tx.send(
              ibcSwapConfigs.feeConfig.toStdFee(),
              ibcSwapConfigs.memoConfig.memo,
              {
                preferNoSetFee: true,
                preferNoSetMemo: true,
              },
              {
                onFulfill: (tx: any) => {
                  if (tx.code != null && tx.code !== 0) {
                    console.log(tx.log ?? tx.raw_log);
                    notification.show(
                      "failed",
                      intl.formatMessage({ id: "error.transaction-failed" }),
                      ""
                    );
                    return;
                  }
                  notification.show(
                    "success",
                    intl.formatMessage({
                      id: "notification.transaction-success",
                    }),
                    ""
                  );
                },
              }
            );

            navigate("/", {
              replace: true,
            });
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
          }
        }
      }}
    >
      <Box paddingX="0.75rem" paddingBottom="1.5rem">
        <SwapAssetInfo
          type="from"
          senderConfig={ibcSwapConfigs.senderConfig}
          amountConfig={ibcSwapConfigs.amountConfig}
        />

        <Box position="relative">
          <Gutter size="0.75rem" />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <Box
              width="2.25rem"
              height="2.25rem"
              alignX="center"
              alignY="center"
              backgroundColor={ColorPalette["gray-500"]}
              borderRadius="999999px"
              cursor="pointer"
            >
              test
            </Box>
          </div>
        </Box>

        <SwapAssetInfo
          type="to"
          senderConfig={ibcSwapConfigs.senderConfig}
          amountConfig={ibcSwapConfigs.amountConfig}
        />
        <Gutter size="0.75rem" />
        <SwapFeeInfo
          senderConfig={ibcSwapConfigs.senderConfig}
          amountConfig={ibcSwapConfigs.amountConfig}
          gasConfig={ibcSwapConfigs.gasConfig}
          feeConfig={ibcSwapConfigs.feeConfig}
          gasSimulator={gasSimulator}
        />
      </Box>
    </HeaderLayout>
  );
});
