import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../components/box";
import { useStore } from "../../stores";
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
import { useSearchParams } from "react-router-dom";
import { useTxConfigsQueryString } from "../../hooks/use-tx-config-query-string";
import { MainHeaderLayout } from "../main/layouts/header";
import { XAxis } from "../../components/axis";
import { H4 } from "../../components/typography";
import { SlippageModal } from "./components/slippage-modal";

export const IBCSwapPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    uiConfigStore,
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ---- search params로부터 받더라도 store 자체에서 현재 없는 체인은 기본 체인으로 설정하는 등의 로직이 있으므로
  //      좀 복잡하더라도 아래처럼 처리해야한다.
  const searchParamsChainId = searchParams.get("chainId");
  const searchParamsCoinMinimalDenom = searchParams.get("coinMinimalDenom");
  const searchParamsOutChainId = searchParams.get("outChainId");
  const searchParamsOutCoinMinimalDenom = searchParams.get(
    "outCoinMinimalDenom"
  );
  const inChainId = (() => {
    if (searchParamsChainId) {
      uiConfigStore.ibcSwapConfig.setAmountInChainId(searchParamsChainId);
    }
    return uiConfigStore.ibcSwapConfig.getAmountInChainInfo().chainId;
  })();
  const inCurrency = (() => {
    if (searchParamsCoinMinimalDenom) {
      uiConfigStore.ibcSwapConfig.setAmountInMinimalDenom(
        searchParamsCoinMinimalDenom
      );
    }
    return uiConfigStore.ibcSwapConfig.getAmountInCurrency();
  })();
  const outChainId = (() => {
    if (searchParamsOutChainId) {
      uiConfigStore.ibcSwapConfig.setAmountOutChainId(searchParamsOutChainId);
    }
    return uiConfigStore.ibcSwapConfig.getAmountOutChainInfo().chainId;
  })();
  const outCurrency = (() => {
    if (searchParamsOutCoinMinimalDenom) {
      uiConfigStore.ibcSwapConfig.setAmountOutMinimalDenom(
        searchParamsOutCoinMinimalDenom
      );
    }
    return uiConfigStore.ibcSwapConfig.getAmountOutCurrency();
  })();
  // ----

  const ibcSwapConfigs = useIBCSwapConfig(
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    inChainId,
    accountStore.getAccount(inChainId).bech32Address,
    // TODO: config로 빼기
    300000,
    outChainId,
    outCurrency,
    SwapFeeBps.value
  );

  ibcSwapConfigs.amountConfig.setCurrency(inCurrency);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc-swap.swap"),
    chainStore,
    inChainId,
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

  useTxConfigsQueryString(inChainId, {
    ...ibcSwapConfigs,
    gasSimulator,
  });

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);

  useEffect(() => {
    setSearchParams((prev) => {
      if (ibcSwapConfigs.amountConfig.outChainId) {
        prev.set("outChainId", ibcSwapConfigs.amountConfig.outChainId);
      } else {
        prev.delete("outChainId");
      }
      if (ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom) {
        prev.set(
          "outCoinMinimalDenom",
          ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom
        );
      } else {
        prev.delete("outCoinMinimalDenom");
      }

      return prev;
    });
  }, [
    ibcSwapConfigs.amountConfig.outChainId,
    ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom,
    setSearchParams,
  ]);

  const interactionBlocked =
    txConfigsValidate.interactionBlocked ||
    !uiConfigStore.ibcSwapConfig.slippageIsValid;

  return (
    <MainHeaderLayout
      additionalPaddingBottom={BottomTabsHeightRem}
      fixedHeight={true}
      bottomButton={{
        disabled: interactionBlocked,
        text: "Next",
        color: "primary",
        size: "large",
        isLoading: accountStore.getAccount(inChainId).isSendingMsg === "TODO",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (!interactionBlocked) {
          const tx = await ibcSwapConfigs.amountConfig.getTx(
            uiConfigStore.ibcSwapConfig.slippageNum,
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
      <Box padding="0.75rem">
        <Box paddingX="0.5rem">
          <XAxis alignY="center">
            <H4 color={ColorPalette["white"]}>Swap</H4>
            <div style={{ flex: 1 }} />
            <Box
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();

                setIsSlippageModalOpen(true);
              }}
            >
              <SettingIcon
                width="2rem"
                height="2rem"
                color={ColorPalette["white"]}
              />
            </Box>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

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

      <SlippageModal
        isOpen={
          // uiConfigStore.ibcSwapConfig.slippageIsValid에 대해서도 확인한다.
          // 왜냐하면 uiConfigStore.ibcSwapConfig.slippageIsValid의 값은 autorun으로 저장되는데
          // 모달에서 마지막으로 잘못된 값을 입력하고 팝업을 닫으면 잘못된 값이 저장된 채로 다시 시작되기 때문에
          // 이 경우 유저에게 바로 모달을 띄워서 적잘한 슬리피지를 입력하도록 만든다.
          isSlippageModalOpen || !uiConfigStore.ibcSwapConfig.slippageIsValid
        }
        setIsOpen={setIsSlippageModalOpen}
      />
    </MainHeaderLayout>
  );
});

const SettingIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 36 36"
    >
      <path
        fill={color || "currentColor"}
        fillRule="evenodd"
        d="M15.84 9.804A1 1 0 0116.82 9h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.114a7.046 7.046 0 010 2.226l1.267 1.114a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H16.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.046 7.046 0 010-2.226l-1.267-1.114a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54a6.993 6.993 0 011.929-1.115l.33-1.652zM18 21a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
};
