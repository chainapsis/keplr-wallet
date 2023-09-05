import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../components/box";
import { useStore } from "../../stores";
import { useNavigate } from "react-router";
import { IBCSwapAmountConfig, useIBCSwapConfig } from "../../hooks/ibc-swap";
import { SwapAssetInfo } from "./components/swap-asset-info";
import { SwapFeeInfo } from "./components/swap-fee-info";
import { Gutter } from "../../components/gutter";
import { ColorPalette } from "../../styles";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  EmptyAmountError,
  useGasSimulator,
  useTxConfigsValidate,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
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
import { useTheme } from "styled-components";
import { GuideBox } from "../../components/guide-box";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";

export const IBCSwapPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    uiConfigStore,
  } = useStore();

  const theme = useTheme();

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
        // simulation 자체는 쉽게 통과시키기 위해서 슬리피지를 50으로 설정한다.
        50,
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
    setSearchParams(
      (prev) => {
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
      },
      {
        replace: true,
      }
    );
  }, [
    ibcSwapConfigs.amountConfig.outChainId,
    ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom,
    setSearchParams,
  ]);

  // 10초마다 자동 refresh
  const queryIBCSwap = ibcSwapConfigs.amountConfig.getQueryIBCSwap();
  const queryRoute = queryIBCSwap?.getQueryRoute();
  useEffect(() => {
    if (queryRoute && !queryRoute.isFetching) {
      const timeoutId = setTimeout(() => {
        if (!queryRoute.isFetching) {
          queryRoute.fetch();
        }
      }, 10000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint가 자동으로 추천해주는 deps를 쓰면 안된다.
    // queryRoute는 amountConfig에서 필요할때마다 reference가 바뀌므로 deps에 넣는다.
    // queryRoute.isFetching는 현재 fetch중인지 아닌지를 알려주는 값이므로 deps에 꼭 넣어야한다.
    // queryRoute는 input이 같으면 reference가 같으므로 eslint에서 추천하는대로 queryRoute만 deps에 넣으면
    // queryRoute.isFetching이 무시되기 때문에 수동으로 넣어줌
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRoute, queryRoute?.isFetching]);

  const interactionBlocked =
    txConfigsValidate.interactionBlocked ||
    !uiConfigStore.ibcSwapConfig.slippageIsValid;

  return (
    <MainHeaderLayout
      additionalPaddingBottom={BottomTabsHeightRem}
      bottomButton={{
        disabled: interactionBlocked,
        text: "Next",
        color: "primary",
        size: "large",
        isLoading: accountStore.getAccount(inChainId).isSendingMsg === "TODO",
      }}
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
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
      <Box padding="0.75rem" paddingBottom="0">
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

        <WarningGuideBox amountConfig={ibcSwapConfigs.amountConfig} />
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

const WarningGuideBox: FunctionComponent<{
  amountConfig: IBCSwapAmountConfig;
}> = observer(({ amountConfig }) => {
  const error: string | undefined = (() => {
    const uiProperties = amountConfig.uiProperties;

    const err = uiProperties.error || uiProperties.warning;

    if (err instanceof EmptyAmountError) {
      return;
    }

    if (err instanceof ZeroAmountError) {
      return;
    }

    if (err) {
      return err.message || err.toString();
    }

    const queryError = amountConfig.getQueryIBCSwap()?.getQueryRoute()?.error;
    if (queryError) {
      return queryError.message || queryError.toString();
    }
  })();

  // Collapse됐을때는 이미 error가 없어졌기 때문이다.
  // 그러면 트랜지션 중에 이미 내용은 사라져있기 때문에
  // 이 문제를 해결하기 위해서 마지막 오류를 기억해야 한다.
  const [lastError, setLastError] = useState("");
  useLayoutEffect(() => {
    if (error != null) {
      setLastError(error);
    }
  }, [error]);

  const collapsed = error == null;

  const globalSimpleBar = useGlobarSimpleBar();
  useEffect(() => {
    if (!collapsed) {
      const timeoutId = setTimeout(() => {
        const el = globalSimpleBar.ref.current?.getScrollElement();
        if (el) {
          // 오류 메세지가 가장 밑에 있는 관계로 유저가 잘 못볼수도 있기 때문에
          // 트랜지션 종료 이후에 스크롤을 맨 밑으로 내린다.
          // 어차피 높이는 대충 정해져있기 때문에 대충 큰 값을 넣으면 가장 밑으로 스크롤 된다.
          el.scrollTo({
            top: 1000,
            behavior: "smooth",
          });
        }
      }, 300);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [collapsed, globalSimpleBar.ref]);

  return (
    <React.Fragment>
      {/* 별 차이는 없기는한데 gutter와 실제 컴포넌트의 트랜지션을 분리하는게 아주 약간 더 자연스러움 */}
      <VerticalCollapseTransition collapsed={collapsed}>
        <Gutter size="0.75rem" />
      </VerticalCollapseTransition>
      <VerticalCollapseTransition collapsed={collapsed}>
        <GuideBox
          color="warning"
          title={error || lastError}
          hideInformationIcon={true}
        />
      </VerticalCollapseTransition>
    </React.Fragment>
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
