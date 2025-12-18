import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Box } from "../../components/box";
import { useStore } from "../../stores";
import { SwapAmountConfig, useSwapConfig } from "@keplr-wallet/hooks-internal";
import { SwapAssetInfo } from "./components/swap-asset-info";
import { SwapFeeInfo } from "./components/swap-fee-info";
import { Gutter } from "../../components/gutter";
import { ColorPalette } from "../../styles";
import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  EmptyAmountError,
  IFeeConfig,
  IGasConfig,
  ISenderConfig,
  useGasSimulator,
  useTxConfigsValidate,
  ZeroAmountError,
} from "@keplr-wallet/hooks";
import { useNotification } from "../../hooks/notification";
import { FormattedMessage, useIntl } from "react-intl";
import { SwapFeeBps, TermsOfUseUrl } from "../../config.ui";
import { BottomTabsHeightRem } from "../../bottom-tabs";
import { Link, useSearchParams } from "react-router-dom";
import { useTxConfigsQueryString } from "../../hooks/use-tx-config-query-string";
import { MainHeaderLayout } from "../main/layouts/header";
import { XAxis } from "../../components/axis";
import { H4, Subtitle4 } from "../../components/typography";
import { SlippageModal } from "./components/slippage-modal";
import styled, { useTheme } from "styled-components";
import { GuideBox } from "../../components/guide-box";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { useGlobalSimpleBar } from "../../hooks/global-simplebar";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { MakeTxResponse, WalletStatus } from "@keplr-wallet/stores";
import { autorun } from "mobx";
import {
  BackgroundTx,
  BackgroundTxStatus,
  BackgroundTxType,
  IBCTransferHistoryData,
  IBCSwapHistoryData,
  SwapV2HistoryData,
  // LogAnalyticsEventMsg,
  RecordAndExecuteTxsMsg,
  TxExecutionType,
  TxExecutionStatus,
  EVMBackgroundTx,
  CosmosBackgroundTx,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { useEffectOnce } from "../../hooks/use-effect-once";
import { HoldButton } from "../../components/hold-button";
import { TextButtonProps } from "../../components/button-text";
import { UnsignedEVMTransactionWithErc20Approvals } from "@keplr-wallet/stores-eth";
import { InsufficientFeeError } from "@keplr-wallet/hooks";
import { getSwapWarnings } from "./utils/swap-warnings";
import { FeeCoverageDescription } from "../../components/top-up";
import { useTopUp } from "../../hooks/use-topup";
import { useInsufficientFeeAnalytics } from "../../hooks/analytics/use-insufficient-fee-analytics";
import { getShouldTopUpSignOptions } from "../../utils/should-top-up-sign-options";
import { useSwapFeeBps } from "./hooks/use-swap-fee-bps";
import { useSwapPriceImpact } from "./hooks/use-swap-price-impact";
import { RouteStepType, SwapProvider } from "@keplr-wallet/stores-internal";
import { Button } from "../../components/button";
import { EvmGasSimulationOutcome, EthTxStatus } from "@keplr-wallet/types";
// import { useSwapAnalytics } from "./hooks/use-swap-analytics";

const TextButtonStyles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  Button: styled.button<Omit<TextButtonProps, "onClick">>`
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.375rem;
    cursor: pointer;
    overflow: hidden;

    // Default font style.
    // Override these in "buttonStyleFromColorAndMode" if needed.
    font-weight: 500;
    font-size: ${({ size }) => {
      switch (size) {
        case "large":
          return "1rem";
        default:
          return "0.875rem";
      }
    }};
    letter-spacing: 0.2px;

    white-space: nowrap;

    border: 0;
    padding: 0 1rem;

    color: ${({ theme }) =>
      theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};
    :hover {
      color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-300"]
          : ColorPalette["gray-200"]};
    }
    background-color: transparent;

    position: relative;
  `,
};

export const IBCSwapPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    swapQueriesStore,
    uiConfigStore,
    keyRingStore,
    hugeQueriesStore,
    priceStore,
    // analyticsStore,
  } = useStore();
  const theme = useTheme();
  const intl = useIntl();
  const notification = useNotification();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

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

  const isInChainEVMOnly = chainStore.isEvmOnlyChain(inChainId);
  const inChainAccount = accountStore.getAccount(inChainId);
  const isHardwareWallet =
    inChainAccount.isNanoLedger || inChainAccount.isKeystone;

  // nonce method for EVM chain to handle pending tx
  const [nonceMethod, setNonceMethod] = useState<"latest" | "pending">(
    "pending"
  );
  useEffect(() => {
    if (!isInChainEVMOnly) {
      setNonceMethod("pending");
    }
  }, [isInChainEVMOnly]);

  const [
    topUpForDisableSubFeeFromFaction,
    setTopUpForDisableSubFeeFromFaction,
  ] = useState(false);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);

  const swapConfigs = useSwapConfig(
    chainStore,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    swapQueriesStore,
    inChainId,
    isInChainEVMOnly
      ? inChainAccount.ethereumHexAddress
      : inChainAccount.bech32Address,
    // TODO: config로 빼기
    1_500_000,
    outChainId,
    outCurrency,
    topUpForDisableSubFeeFromFaction,
    SwapFeeBps.value, // default swap fee bps for initial state
    () => uiConfigStore.ibcSwapConfig.slippageNum
  );

  const swapFeeBps = useSwapFeeBps(swapConfigs.amountConfig);
  const { isHighPriceImpact, unableToPopulatePrices } = useSwapPriceImpact(
    swapConfigs.amountConfig
  );

  swapConfigs.amountConfig.setCurrency(inCurrency);
  swapConfigs.amountConfig.setSwapFeeBps(swapFeeBps);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.main.swap"),
    chainStore,
    inChainId,
    swapConfigs.gasConfig,
    swapConfigs.feeConfig,
    (() => {
      // simulation 할때 예상되는 gas에 따라서 밑의 값을 설정해야한다.
      // 근데 이걸 엄밀히 정하기는 어렵다
      // 추정을해보면 당연히 destination token에 따라서 값이 다를 수 있다.
      // 또한 트랜잭션이 ibc transfer인지 cosmwasm execute인지에 따라서 다를 수 있다.
      // ibc transfer일 경우는 차이는 memo의 길이일 뿐인데 이건 gas에 그다지 영향을 미치지 않기 때문에 gas adjustment로 충분하다.
      // swap일 경우 (osmosis에서 실행될 경우) swap이 몇번 필요한지에 따라 영향을 미칠 것이다.
      let type = "default";

      const queryRoute = swapConfigs.amountConfig.getQueryRoute();
      if (queryRoute && queryRoute.response) {
        const routeData = queryRoute.response.data;
        const { steps, provider } = routeData;

        if (steps && steps.length > 0) {
          const swapCount = steps.filter(
            (step) => step.type === RouteStepType.SWAP
          ).length;
          const bridgeCount = steps.filter(
            (step) => step.type === RouteStepType.BRIDGE
          ).length;
          const ibcTransferCount = steps.filter(
            (step) => step.type === RouteStepType.IBC_TRANSFER
          ).length;

          const typeParts: string[] = [];
          if (swapCount > 0) {
            typeParts.push(`swap-${swapCount}`);
          }
          if (bridgeCount > 0) {
            typeParts.push(`bridge-${bridgeCount}`);
          }
          if (ibcTransferCount > 0) {
            typeParts.push(`ibc-transfer-${ibcTransferCount}`);
          }

          if (typeParts.length > 0) {
            type = typeParts.join("-");
          }

          type = `${provider}/${type}`;
        } else {
          type = `${provider}/default`;
        }
      }

      if (isInChainEVMOnly) {
        // EVM 트랜잭션의 gas estimated는 보낼 토큰 수량에 따라 차이가 꽤 클 수 있다.
        type = `${type}/${swapConfigs.amountConfig.amount[0].toCoin().amount}`;
      }

      return `${swapConfigs.amountConfig.chainId}/${swapConfigs.amountConfig.outChainId}/${swapConfigs.amountConfig.currency.coinMinimalDenom}/${swapConfigs.amountConfig.outCurrency.coinMinimalDenom}/${type}`;
    })(),
    () => {
      if (!swapConfigs.amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        swapConfigs.amountConfig.uiProperties.loadingState ===
          "loading-block" ||
        swapConfigs.amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      const txs = swapConfigs.amountConfig.getTxsIfReady();

      if (!txs || txs.length === 0) {
        throw new Error("Not ready to simulate tx");
      }

      // only estimate gas for the first tx
      const tx = txs[0];

      if ("send" in tx) {
        return tx;
      } else {
        const ethereumAccount = ethereumAccountStore.getAccount(
          swapConfigs.amountConfig.chainId
        );
        const sender = swapConfigs.senderConfig.sender;

        return {
          simulate: () =>
            ethereumAccount
              .simulateGasWithPendingErc20Approval(sender, tx)
              .then((result) => {
                const { outcome, gasUsed, erc20ApprovalGasUsed } = result;

                const totalGasUsed =
                  (gasUsed ?? 0) + (erc20ApprovalGasUsed ?? 0);
                if (totalGasUsed <= 0) {
                  throw new Error("Gas used is not positive");
                }

                if (
                  chainStore
                    .getChain(inChainId)
                    .features.includes("op-stack-l1-data-fee")
                ) {
                  // L1 data fee는 직렬화된 tx 데이터 크기 기반이므로
                  // approval 상태와 관계없이 계산 가능
                  return ethereumAccount
                    .simulateOpStackL1FeeWithPendingErc20Approval({
                      ...tx,
                      gasLimit: gasUsed,
                    })
                    .then((totalL1DataFee: string) => {
                      // Do not sum the L1 data fee with the gas used,
                      // because it should be treated as a separate fee.
                      swapConfigs.feeConfig.setL1DataFee(
                        new Dec(BigInt(totalL1DataFee))
                      );
                      return {
                        gasUsed: totalGasUsed,
                        evmSimulationOutcome: outcome,
                      };
                    });
                }

                return {
                  gasUsed: totalGasUsed,
                  evmSimulationOutcome: outcome,
                };
              }),
        };
      }
    }
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...swapConfigs,
    gasSimulator,
  });

  useTxConfigsQueryString(inChainId, {
    ...swapConfigs,
    gasSimulator,
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (swapConfigs.amountConfig.outChainId) {
          prev.set("outChainId", swapConfigs.amountConfig.outChainId);
        } else {
          prev.delete("outChainId");
        }
        if (swapConfigs.amountConfig.outCurrency.coinMinimalDenom) {
          prev.set(
            "outCoinMinimalDenom",
            swapConfigs.amountConfig.outCurrency.coinMinimalDenom
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
    swapConfigs.amountConfig.outChainId,
    swapConfigs.amountConfig.outCurrency.coinMinimalDenom,
    setSearchParams,
  ]);

  const tempSwitchAmount = searchParams.get("tempSwitchAmount");
  useEffect(() => {
    if (tempSwitchAmount != null) {
      swapConfigs.amountConfig.setValue(tempSwitchAmount);
      setSearchParams((prev) => {
        prev.delete("tempSwitchAmount");
        return prev;
      });
    }
  }, [swapConfigs.amountConfig, setSearchParams, tempSwitchAmount]);

  const [isButtonHolding, setIsButtonHolding] = useState(false);

  const queryRoute = swapConfigs.amountConfig.getQueryRoute();

  const prevIsSwapLoadingRef = useRef(
    uiConfigStore.ibcSwapConfig.isSwapLoading
  );
  const prevIsButtonHoldingRef = useRef(isButtonHolding);

  // 사용자가 스왑 버튼을 홀딩하다가 중간에 손을 떼었을 때 (isButtonHolding이 true에서 false로 변경되었을 때)
  // 또는 tx 처리 중에 오류가 발생했을 때 (isSwapLoading이 true에서 false로 변경되었을 때)
  // quote expired가 발생할 수 있으므로 3초 후 쿼리 리프레시
  useEffect(() => {
    const prevIsSwapLoading = prevIsSwapLoadingRef.current;
    const prevIsButtonHolding = prevIsButtonHoldingRef.current;
    const currentIsSwapLoading = uiConfigStore.ibcSwapConfig.isSwapLoading;
    const currentIsButtonHolding = isButtonHolding;

    if (
      queryRoute &&
      !queryRoute.isFetching &&
      ((prevIsSwapLoading && !currentIsSwapLoading) ||
        (prevIsButtonHolding && !currentIsButtonHolding))
    ) {
      const timeoutId = setTimeout(() => {
        if (
          queryRoute &&
          !queryRoute.isFetching &&
          !uiConfigStore.ibcSwapConfig.isSwapLoading &&
          !isButtonHolding
        ) {
          queryRoute.fetch();
        }
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    prevIsSwapLoadingRef.current = currentIsSwapLoading;
    prevIsButtonHoldingRef.current = currentIsButtonHolding;
  }, [
    queryRoute,
    queryRoute?.isFetching,
    uiConfigStore.ibcSwapConfig.isSwapLoading,
    isButtonHolding,
  ]);

  // 10초마다 route query 자동 refresh
  useEffect(() => {
    if (
      queryRoute &&
      !queryRoute.isFetching &&
      !uiConfigStore.ibcSwapConfig.isSwapLoading &&
      !isButtonHolding
    ) {
      const timeoutId = setTimeout(() => {
        if (
          !queryRoute.isFetching &&
          !uiConfigStore.ibcSwapConfig.isSwapLoading &&
          !isButtonHolding
        ) {
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
  }, [
    queryRoute,
    queryRoute?.isFetching,
    uiConfigStore.ibcSwapConfig.isSwapLoading,
    isButtonHolding,
  ]);

  // ------ 기능상 의미는 없고 이 페이지에서 select asset page로의 전환시 UI flash를 막기 위해서 필요한 값들을 prefetch하는 용도
  useEffect(() => {
    const disposal = autorun(() => {
      noop(
        hugeQueriesStore.getAllBalances({
          allowIBCToken: true,
        })
      );
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [hugeQueriesStore]);

  useEffect(() => {
    const disposal = autorun(() => {
      noop(
        swapQueriesStore.querySwapHelper.getSwapDestinationCurrencyAlternativeChains(
          chainStore.getChain(swapConfigs.amountConfig.outChainId),
          swapConfigs.amountConfig.outCurrency
        )
      );
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [
    chainStore,
    swapConfigs.amountConfig.outChainId,
    swapConfigs.amountConfig.outCurrency,
    swapQueriesStore.querySwapHelper,
  ]);
  // ------

  useEffectOnce(() => {
    // 10초마다 price 자동 refresh
    const intervalId = setInterval(() => {
      if (priceStore.isInitialized && !priceStore.isFetching) {
        priceStore.fetch();
      }
    }, 1000 * 10);

    return () => {
      clearInterval(intervalId);
    };
  });

  const outCurrencyFetched =
    chainStore
      .getChain(outChainId)
      .findCurrency(outCurrency.coinMinimalDenom) != null;

  const interactionBlocked =
    txConfigsValidate.interactionBlocked ||
    !uiConfigStore.ibcSwapConfig.slippageIsValid ||
    !outCurrencyFetched;

  const [calculatingTxError, setCalculatingTxError] = useState<
    Error | undefined
  >();

  // const { logSwapSignOpened, logEvent, quoteIdRef } = useSwapAnalytics({
  //   inChainId: inChainId,
  //   inCurrency: inCurrency,
  //   outChainId: outChainId,
  //   outCurrency: outCurrency,
  //   swapConfigs: swapConfigs,
  //   swapFeeBps,
  // });

  /**
   * Topup related below
   */
  const { shouldTopUp, isTopUpAvailable, remainingText } = useTopUp({
    feeConfig: swapConfigs.feeConfig,
    senderConfig: swapConfigs.senderConfig,
  });
  useEffect(() => {
    setTopUpForDisableSubFeeFromFaction(shouldTopUp);
  }, [shouldTopUp]);

  const isSwap = swapConfigs.amountConfig.type === "swap";

  /**
   * One-click swap is enabled only when:
   * 1. Single transaction (or erc20 approval + swap bundle with bundle tx simulation)
   * 2. Not a hardware wallet
   * 3. EVM gas simulation is TX_SIMULATED or TX_BUNDLE_SIMULATED
   * 4. Cosmos Top-up is not required
   */
  const evmOutcome = gasSimulator.evmSimulationOutcome;
  const isCosmosOneClickSwapEnabled = !shouldTopUp;
  const isEvmOneClickSwapEnabled =
    evmOutcome === EvmGasSimulationOutcome.TX_SIMULATED ||
    evmOutcome === EvmGasSimulationOutcome.TX_BUNDLE_SIMULATED;

  const oneClickSwapEnabled =
    swapConfigs.amountConfig.isQuoteReady &&
    !swapConfigs.amountConfig.requiresMultipleTxs &&
    !isHardwareWallet &&
    (isInChainEVMOnly ? isEvmOneClickSwapEnabled : isCosmosOneClickSwapEnabled);

  const { showUSDNWarning, showCelestiaWarning } = getSwapWarnings(
    swapConfigs.amountConfig.currency,
    swapConfigs.amountConfig.chainId,
    swapConfigs.amountConfig.outCurrency,
    swapConfigs.amountConfig.outChainId,
    uiConfigStore.ibcSwapConfig.celestiaDisabled
  );

  return (
    <MainHeaderLayout
      additionalPaddingBottom={BottomTabsHeightRem}
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

        if (interactionBlocked) {
          return;
        }
        // logSwapSignOpened();

        const selectedKeyInfo = keyRingStore.selectedKeyInfo;
        if (!selectedKeyInfo) {
          throw new Error("selectedKeyInfo is undefined");
        }

        const evmSimulationOutcome = gasSimulator.evmSimulationOutcome;
        if (isInChainEVMOnly && evmSimulationOutcome == null) {
          // it should be set by the gas simulator
          throw new Error("EVM gas simulation outcome is not set");
        }

        const queryRoute = swapConfigs.amountConfig.getQueryRoute()!;

        let txs: (
          | (MakeTxResponse & {
              chainId: string;
            })
          | UnsignedEVMTransactionWithErc20Approvals
        )[];
        const channels: {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[] = [];
        let swapChannelIndex: number = -1;
        const swapReceiver: string[] = [];
        const swapFeeBpsReceiver: string[] = [];
        const simpleRoute: {
          isOnlyEvm: boolean;
          chainId: string;
          receiver: string;
        }[] = [];
        let provider: SwapProvider | undefined;
        let routeDurationSeconds: number | undefined;
        let isInterChainSwap: boolean = false;
        let isSingleEVMChainOperation: boolean = false;

        uiConfigStore.ibcSwapConfig.setIsSwapLoading(true);

        //================================================================================
        // 1. Get route information and prepare txs
        //================================================================================

        try {
          // queryRoute는 ibc history를 추적하기 위한 채널 정보 등을 얻기 위해서 사용된다.
          // swapConfigs.amountConfig.getTx에서 queryRoute.waitFreshResponse()를 하므로 굳이 여기서 또 하지 않는다.
          if (!queryRoute.response) {
            throw new Error("queryRoute.response is undefined");
          }

          const priorOutAmount = new Int(queryRoute.response.data.amount_out);

          // inter-chain swap인지 여부를 확인 (bridge가 필요한 경우)
          const steps = queryRoute.response.data.steps;
          isInterChainSwap = steps.some(
            (step) => step.type === RouteStepType.BRIDGE
          );
          isSingleEVMChainOperation =
            isInChainEVMOnly && inChainId === outChainId && !isInterChainSwap;
          provider = queryRoute.response.data.provider;

          // 브릿지를 사용하는 경우, ibc swap channel까지 보여주면 ui가 너무 복잡해질 수 있으므로 (operation이 최소 3개 이상)
          // evm -> osmosis -> destination 식으로 뭉퉁그려서 보여주는 것이 좋다고 판단, 경로를 간소화한다.
          // 단일 evm 체인 위에서의 스왑인 경우에는 history data 구성을 위해 여기서 처리한다.
          if (isInterChainSwap || isSingleEVMChainOperation) {
            routeDurationSeconds = queryRoute.response.data.estimated_time;

            for (const chainId of queryRoute.response.data.required_chain_ids) {
              const evmLikeChainId = Number(chainId);
              const isEVMChainId =
                !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

              const chainIdInKeplr = isEVMChainId
                ? `eip155:${evmLikeChainId}`
                : chainId;

              const receiverAccount = accountStore.getAccount(chainIdInKeplr);
              if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                await receiverAccount.init();
              }

              if (isEVMChainId && !receiverAccount.ethereumHexAddress) {
                const receiverChainInfo =
                  chainStore.hasChain(chainId) && chainStore.getChain(chainId);
                if (
                  receiverAccount.isNanoLedger &&
                  receiverChainInfo &&
                  (receiverChainInfo.bip44.coinType === 60 ||
                    receiverChainInfo.features.includes("eth-address-gen") ||
                    receiverChainInfo.features.includes("eth-key-sign") ||
                    receiverChainInfo.evm != null)
                ) {
                  throw new Error(
                    "Please connect Ethereum app on Ledger with Keplr to get the address"
                  );
                }

                throw new Error(
                  "receiverAccount.ethereumHexAddress is undefined"
                );
              }

              // required_chain_ids can contain duplicated chain ids,
              // so avoid adding the chain if it's the same as the last chain in simpleRoute.
              if (
                simpleRoute.length === 0 ||
                simpleRoute[simpleRoute.length - 1].chainId !== chainIdInKeplr
              ) {
                simpleRoute.push({
                  isOnlyEvm: isEVMChainId,
                  chainId: chainIdInKeplr,
                  receiver: isEVMChainId
                    ? receiverAccount.ethereumHexAddress
                    : receiverAccount.bech32Address,
                });
              }
            }
          } else {
            // 브릿지를 사용하지 않는 경우, 자세한 ibc swap channel 정보를 보여준다.
            const skipOperations =
              queryRoute.response.data.provider === "skip"
                ? queryRoute.response.data.skip_operations
                : undefined;

            // skip_operations에서 상세 정보를 추출한다 (SKIP provider인 경우에만 사용 가능)
            if (skipOperations) {
              // skip_operations를 순회하면서 transfer와 swap 정보를 추출
              for (const operation of skipOperations) {
                if ("transfer" in operation) {
                  const transfer = operation.transfer;
                  if (
                    !transfer.port ||
                    !transfer.channel ||
                    !transfer.from_chain_id
                  ) {
                    throw new Error(
                      "unable to construct channel info by missing fields"
                    );
                  }

                  const queryClientState = queriesStore
                    .get(transfer.from_chain_id)
                    .cosmos.queryIBCClientState.getClientState(
                      transfer.port,
                      transfer.channel
                    );

                  await queryClientState.waitResponse();
                  if (!queryClientState.response) {
                    throw new Error("queryClientState.response is undefined");
                  }
                  if (!queryClientState.clientChainId) {
                    throw new Error(
                      "queryClientState.clientChainId is undefined"
                    );
                  }

                  channels.push({
                    portId: transfer.port,
                    channelId: transfer.channel,
                    counterpartyChainId: queryClientState.clientChainId,
                  });
                } else if ("swap" in operation) {
                  const swapIn =
                    operation.swap.swap_in ?? operation.swap.smart_swap_in;
                  if (swapIn && swapIn.swap_venue) {
                    const swapVenueChainId = swapIn.swap_venue.chain_id;
                    const swapFeeBpsReceiverAddress = SwapFeeBps.receivers.find(
                      (r) => r.chainId === swapVenueChainId
                    );
                    if (swapFeeBpsReceiverAddress) {
                      swapFeeBpsReceiver.push(
                        swapFeeBpsReceiverAddress.address
                      );
                    }
                  }
                  // swap이 발생하는 channel index는 마지막 channel 다음이므로
                  // 현재 channels.length가 swap channel index가 된다
                  swapChannelIndex = channels.length - 1;
                }
              }

              // receiver chain IDs를 구성하고 각 chain의 receiver address를 가져온다
              const receiverChainIds = [inChainId];
              for (const channel of channels) {
                receiverChainIds.push(channel.counterpartyChainId);
              }
              for (const receiverChainId of receiverChainIds) {
                const receiverAccount =
                  accountStore.getAccount(receiverChainId);
                if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                  await receiverAccount.init();
                }

                if (!receiverAccount.bech32Address) {
                  const receiverChainInfo =
                    chainStore.hasChain(receiverChainId) &&
                    chainStore.getChain(receiverChainId);
                  if (
                    receiverAccount.isNanoLedger &&
                    receiverChainInfo &&
                    (receiverChainInfo.bip44.coinType === 60 ||
                      receiverChainInfo.features.includes("eth-address-gen") ||
                      receiverChainInfo.features.includes("eth-key-sign") ||
                      receiverChainInfo.evm != null)
                  ) {
                    throw new Error(
                      "Please connect Ethereum app on Ledger with Keplr to get the address"
                    );
                  }

                  throw new Error("receiverAccount.bech32Address is undefined");
                }
                swapReceiver.push(receiverAccount.bech32Address);
              }
            } else {
              // skip_operations가 없는 경우 (예: SQUID provider)
              // steps에서 정보를 추출하고, swapQueriesStore를 사용하여 IBC 채널 정보를 찾는다
              for (const step of steps) {
                if (step.type === RouteStepType.IBC_TRANSFER) {
                  // IBC transfer step의 경우, from_chain과 from_token을 사용하여 채널을 찾는다
                  const ibcChannels =
                    swapQueriesStore.queryTransferPaths.getIBCChannels(
                      step.from_chain,
                      step.from_token
                    );

                  // to_chain과 매칭되는 채널을 찾는다
                  const matchingChannel = ibcChannels.find(
                    (channel) => channel.destinationChainId === step.to_chain
                  );

                  if (matchingChannel && matchingChannel.channels.length > 0) {
                    // 매칭되는 채널이 있으면 channels 배열에 추가
                    // IBCChannelV2의 channels에는 이미 counterpartyChainId가 포함되어 있음
                    for (const channel of matchingChannel.channels) {
                      channels.push({
                        portId: channel.portId,
                        channelId: channel.channelId,
                        counterpartyChainId: channel.counterpartyChainId,
                      });
                    }
                  }
                } else if (step.type === RouteStepType.SWAP) {
                  // swap venue chain ID는 step의 to_chain을 사용할 수 있다
                  // 하지만 정확한 swap_venue 정보는 없으므로 단순히 to_chain을 사용
                  const evmLikeChainId = Number(step.to_chain);
                  const isEVMChainId =
                    !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

                  const swapVenueChainId = isEVMChainId
                    ? `eip155:${evmLikeChainId}`
                    : step.to_chain;
                  const swapFeeBpsReceiverAddress = SwapFeeBps.receivers.find(
                    (r) => r.chainId === swapVenueChainId
                  );
                  if (swapFeeBpsReceiverAddress) {
                    swapFeeBpsReceiver.push(swapFeeBpsReceiverAddress.address);
                  }
                  // swap이 발생하는 channel index는 마지막 channel 다음이므로
                  // 현재 channels.length가 swap channel index가 된다
                  swapChannelIndex = channels.length - 1;
                }
              }

              // receiver chain IDs를 steps에서 추출
              const receiverChainIds = [inChainId];
              for (const step of steps) {
                if (step.type === RouteStepType.IBC_TRANSFER) {
                  receiverChainIds.push(step.to_chain);
                }
              }
              // 마지막 step의 to_chain이 최종 destination이 될 수 있다
              if (steps.length > 0) {
                const lastStep = steps[steps.length - 1];
                if (!receiverChainIds.includes(lastStep.to_chain)) {
                  receiverChainIds.push(lastStep.to_chain);
                }
              }

              for (const receiverChainId of receiverChainIds) {
                const evmLikeChainId = Number(receiverChainId);
                const isEVMChainId =
                  !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

                const receiverChainIdInKeplr = isEVMChainId
                  ? `eip155:${evmLikeChainId}`
                  : receiverChainId;

                const receiverAccount = accountStore.getAccount(
                  receiverChainIdInKeplr
                );
                if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                  await receiverAccount.init();
                }

                if (!receiverAccount.bech32Address) {
                  const receiverChainInfo =
                    chainStore.hasChain(receiverChainIdInKeplr) &&
                    chainStore.getChain(receiverChainIdInKeplr);
                  if (
                    receiverAccount.isNanoLedger &&
                    receiverChainInfo &&
                    (receiverChainInfo.bip44.coinType === 60 ||
                      receiverChainInfo.features.includes("eth-address-gen") ||
                      receiverChainInfo.features.includes("eth-key-sign") ||
                      receiverChainInfo.evm != null)
                  ) {
                    throw new Error(
                      "Please connect Ethereum app on Ledger with Keplr to get the address"
                    );
                  }

                  throw new Error("receiverAccount.bech32Address is undefined");
                }
                swapReceiver.push(receiverAccount.bech32Address);
              }
            }
          }

          const [_txs] = await Promise.all([
            swapConfigs.amountConfig.getTxs(undefined, priorOutAmount),
          ]);

          if (_txs.length === 0) {
            throw new Error("Txs are not ready");
          }

          txs = _txs;
        } catch (e) {
          setCalculatingTxError(e);
          uiConfigStore.ibcSwapConfig.setIsSwapLoading(false);
          return;
        }

        setCalculatingTxError(undefined);

        //================================================================================
        // 2. Prepare history data
        //================================================================================

        let executionType: TxExecutionType;
        let historyData:
          | IBCTransferHistoryData
          | IBCSwapHistoryData
          | SwapV2HistoryData
          | undefined;
        if (isInterChainSwap || isSingleEVMChainOperation) {
          executionType = TxExecutionType.SWAP_V2;
          historyData = {
            fromChainId: inChainId,
            toChainId: outChainId,
            provider: provider,
            destinationAsset: {
              chainId: outChainId,
              denom: outCurrency.coinMinimalDenom,
              expectedAmount:
                swapConfigs.amountConfig.outAmount.toCoin().amount,
            },
            simpleRoute,
            sender: swapConfigs.senderConfig.sender,
            recipient: chainStore.isEvmOnlyChain(outChainId)
              ? accountStore.getAccount(outChainId).ethereumHexAddress
              : accountStore.getAccount(outChainId).bech32Address,
            amount: [
              ...swapConfigs.amountConfig.amount.map((amount) => {
                return {
                  amount: DecUtils.getTenExponentN(amount.currency.coinDecimals)
                    .mul(amount.toDec())
                    .toString(),
                  denom: amount.currency.coinMinimalDenom,
                };
              }),
              {
                amount: DecUtils.getTenExponentN(
                  swapConfigs.amountConfig.outAmount.currency.coinDecimals
                )
                  .mul(swapConfigs.amountConfig.outAmount.toDec())
                  .toString(),
                denom:
                  swapConfigs.amountConfig.outAmount.currency.coinMinimalDenom,
              },
            ], // [inChain asset, outChain asset] format
            notificationInfo: {
              currencies: chainStore.getChain(outChainId).currencies,
            },
            routeDurationSeconds: routeDurationSeconds ?? 0,
          };
        } else if (
          swapConfigs.amountConfig.type === "transfer" &&
          !isInterChainSwap
        ) {
          executionType = TxExecutionType.IBC_TRANSFER;
          historyData = {
            historyType: "ibc-swap/ibc-transfer",
            sourceChainId: inChainId,
            destinationChainId: outChainId,
            channels,
            sender: swapConfigs.senderConfig.sender,
            recipient: accountStore.getAccount(outChainId).bech32Address,
            amount: swapConfigs.amountConfig.amount.map((amount) => {
              return {
                amount: DecUtils.getTenExponentN(amount.currency.coinDecimals)
                  .mul(amount.toDec())
                  .toString(),
                denom: amount.currency.coinMinimalDenom,
              };
            }),
            memo: swapConfigs.memoConfig.memo,
            notificationInfo: {
              currencies: chainStore.getChain(outChainId).currencies,
            },
          };
        } else {
          executionType = TxExecutionType.IBC_SWAP;
          historyData = {
            historyType: "ibc-swap/ibc-swap",
            swapType: "amount-in",
            chainId: inChainId,
            destinationChainId: outChainId,
            sender: swapConfigs.senderConfig.sender,
            amount: swapConfigs.amountConfig.amount.map((amount) => {
              return {
                amount: DecUtils.getTenExponentN(amount.currency.coinDecimals)
                  .mul(amount.toDec())
                  .toString(),
                denom: amount.currency.coinMinimalDenom,
              };
            }),
            memo: swapConfigs.memoConfig.memo,
            ibcChannels: channels,
            destinationAsset: {
              chainId: outChainId,
              denom: outCurrency.coinMinimalDenom,
            },
            swapChannelIndex,
            swapReceiver,
            notificationInfo: {
              currencies: chainStore.getChain(outChainId).currencies,
            },
          };
        }

        //================================================================================
        // 3. Process txs and prepare background txs
        //================================================================================

        const vaultId = selectedKeyInfo.id;
        const isHardwareWallet =
          selectedKeyInfo.type === "ledger" ||
          selectedKeyInfo.type === "keystone";

        // only the first tx is executable with inChainId
        const executableChainIds = [inChainId];
        const backgroundTxs: (BackgroundTx & {
          status: BackgroundTxStatus.PENDING | BackgroundTxStatus.CONFIRMED;
        })[] = [];

        const requiresMultipleTxs = txs.length > 1;
        const totalSignatureCount = txs.reduce((acc, curr) => {
          if ("send" in curr) {
            return acc + 1;
          } else {
            return acc + 1 + (curr.requiredErc20Approvals?.length ?? 0);
          }
        }, 0);

        // find the index of the tx to be recorded as history
        // and set the balance update callback based on the first tx type
        let historyTxIndex: number;
        let updateBalanceCallback: (() => Promise<void>) | undefined =
          undefined;
        if ("send" in txs[0]) {
          historyTxIndex = 0;
          updateBalanceCallback = async () => {
            const queryBalances = queriesStore.get(
              swapConfigs.amountConfig.chainId
            ).queryBalances;
            queryBalances
              .getQueryBech32Address(swapConfigs.senderConfig.sender)
              .balances.forEach((balance) => {
                if (
                  balance.currency.coinMinimalDenom ===
                    swapConfigs.amountConfig.currency.coinMinimalDenom ||
                  swapConfigs.feeConfig.fees.some(
                    (fee) =>
                      fee.currency.coinMinimalDenom ===
                      balance.currency.coinMinimalDenom
                  )
                ) {
                  balance.fetch();
                }
              });
          };
        } else {
          historyTxIndex = txs[0].requiredErc20Approvals?.length ?? 0;
          updateBalanceCallback = async () => {
            const queryBalances = queriesStore.get(
              swapConfigs.amountConfig.chainId
            ).queryBalances;
            queryBalances
              .getQueryEthereumHexAddress(swapConfigs.senderConfig.sender)
              .balances.forEach((balance) => {
                if (
                  balance.currency.coinMinimalDenom ===
                    swapConfigs.amountConfig.currency.coinMinimalDenom ||
                  swapConfigs.feeConfig.fees.some(
                    (fee) =>
                      fee.currency.coinMinimalDenom ===
                      balance.currency.coinMinimalDenom
                  )
                ) {
                  balance.fetch();
                }
              });
          };
        }

        uiConfigStore.ibcSwapConfig.setSignatureProgress(
          totalSignatureCount,
          0,
          totalSignatureCount > 1
        );

        // Count how many signing prompts we trigger so we can navigate back once
        let signatureNavigationCount = 0;

        try {
          for (const tx of txs) {
            if ("send" in tx) {
              const msgs = await tx.msgs();

              const backgroundTx: CosmosBackgroundTx & {
                status:
                  | BackgroundTxStatus.PENDING
                  | BackgroundTxStatus.CONFIRMED;
              } = {
                chainId: tx.chainId,
                type: BackgroundTxType.COSMOS,
                status: BackgroundTxStatus.PENDING,
                txData: {
                  aminoMsgs: msgs.aminoMsgs,
                  protoMsgs: msgs.protoMsgs,
                  rlpTypes: msgs.rlpTypes,
                  memo: swapConfigs.memoConfig.memo,
                },
              };

              // Check if the tx requires pre-handling like fee setting or signing
              const requiresPreHandling = executableChainIds.includes(
                backgroundTx.chainId
              );

              if (requiresPreHandling) {
                const fee =
                  swapConfigs.feeConfig.topUpStatus.topUpOverrideStdFee ??
                  swapConfigs.feeConfig.toStdFee();
                const feeType =
                  swapConfigs.feeConfig.type === "manual"
                    ? undefined
                    : swapConfigs.feeConfig.type;
                const feeCurrencyDenom =
                  swapConfigs.feeConfig.fees[0].currency.coinMinimalDenom;

                backgroundTx.txData.fee = fee;
                backgroundTx.feeType = feeType;
                backgroundTx.feeCurrencyDenom = feeCurrencyDenom;

                // if multiple txs are required or the wallet is hardware wallet or topup is required,
                // sign the tx here
                if (requiresMultipleTxs || isHardwareWallet || shouldTopUp) {
                  signatureNavigationCount += 1;
                  const result = await tx.sign(
                    swapConfigs.feeConfig.topUpStatus.topUpOverrideStdFee ??
                      swapConfigs.feeConfig.toStdFee(),
                    swapConfigs.memoConfig.memo,
                    {
                      preferNoSetFee: true,
                      preferNoSetMemo: false,
                      ...(shouldTopUp ? getShouldTopUpSignOptions() : {}),
                    }
                  );

                  backgroundTx.signedTx = Buffer.from(result.tx).toString(
                    "base64"
                  );

                  uiConfigStore.ibcSwapConfig.incrementCompletedSignature();
                }
              }

              backgroundTxs.push(backgroundTx);
            } else {
              const chainId = `eip155:${tx.chainId!}`;
              const ethereumAccount = ethereumAccountStore.getAccount(chainId);
              const sender = swapConfigs.senderConfig.sender;
              const isInCurrencyErc20 =
                ("type" in inCurrency && inCurrency.type === "erc20") ||
                inCurrency.coinMinimalDenom.startsWith("erc20:");
              const erc20Approval = tx.requiredErc20Approvals?.[0];
              const erc20ApprovalTx =
                erc20Approval && isInCurrencyErc20
                  ? ethereumAccount.makeErc20ApprovalTx(
                      {
                        ...inCurrency,
                        type: "erc20",
                        contractAddress: inCurrency.coinMinimalDenom.replace(
                          "erc20:",
                          ""
                        ),
                      },
                      erc20Approval.spender,
                      erc20Approval.amount
                    )
                  : undefined;

              delete tx.requiredErc20Approvals;

              const evmTxs = erc20ApprovalTx ? [erc20ApprovalTx, tx] : [tx];

              const evmBackgroundTxs: (EVMBackgroundTx & {
                status:
                  | BackgroundTxStatus.PENDING
                  | BackgroundTxStatus.CONFIRMED;
              })[] = [];

              for (const [evmTxIndex, evmTx] of evmTxs.entries()) {
                const backgroundTx: BackgroundTx & {
                  status:
                    | BackgroundTxStatus.PENDING
                    | BackgroundTxStatus.CONFIRMED;
                } = {
                  chainId: chainId,
                  type: BackgroundTxType.EVM,
                  txData: evmTx,
                  feeType:
                    swapConfigs.feeConfig.type === "manual"
                      ? undefined
                      : swapConfigs.feeConfig.type,
                  status: BackgroundTxStatus.PENDING,
                };

                const requiresPreHandling = executableChainIds.includes(
                  backgroundTx.chainId
                );

                if (requiresPreHandling) {
                  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
                    swapConfigs.feeConfig.getEIP1559TxFees(
                      swapConfigs.feeConfig.type
                    );

                  const buildEvmFeeObject = (gasLimit: number) =>
                    maxFeePerGas && maxPriorityFeePerGas
                      ? {
                          type: 2 as const,
                          maxFeePerGas: `0x${BigInt(
                            maxFeePerGas.truncate().toString()
                          ).toString(16)}`,
                          maxPriorityFeePerGas: `0x${BigInt(
                            maxPriorityFeePerGas.truncate().toString()
                          ).toString(16)}`,
                          gasLimit: `0x${gasLimit.toString(16)}`,
                        }
                      : {
                          gasPrice: `0x${BigInt(
                            gasPrice.truncate().toString()
                          ).toString(16)}`,
                          gasLimit: `0x${swapConfigs.gasConfig.gas.toString(
                            16
                          )}`,
                        };

                  if (
                    requiresMultipleTxs ||
                    isHardwareWallet ||
                    gasSimulator.evmSimulationOutcome ===
                      EvmGasSimulationOutcome.APPROVAL_ONLY_SIMULATED
                  ) {
                    let gasLimit: number;
                    if (
                      evmSimulationOutcome ===
                      EvmGasSimulationOutcome.TX_SIMULATED
                    ) {
                      const result = await ethereumAccount.simulateGas(
                        sender,
                        evmTx
                      );

                      gasLimit = Math.ceil(
                        result.gasUsed * gasSimulator.gasAdjustment
                      );
                    } else if (
                      evmSimulationOutcome ===
                        EvmGasSimulationOutcome.TX_BUNDLE_SIMULATED ||
                      evmSimulationOutcome ===
                        EvmGasSimulationOutcome.APPROVAL_ONLY_SIMULATED
                    ) {
                      // if bundle evm tx, calculate the gas limit for each tx
                      if (
                        evmTxIndex === 0 ||
                        evmSimulationOutcome ===
                          EvmGasSimulationOutcome.APPROVAL_ONLY_SIMULATED
                      ) {
                        // 번들 시뮬레이션이 불가 또는 불필요하다
                        const result = await ethereumAccount.simulateGas(
                          sender,
                          evmTx
                        );

                        gasLimit = Math.ceil(
                          result.gasUsed * gasSimulator.gasAdjustment
                        );
                      } else {
                        const result =
                          await ethereumAccount.simulateGasWithPendingErc20Approval(
                            sender,
                            {
                              ...evmTx,
                              requiredErc20Approvals: [erc20Approval!],
                            }
                          );
                        gasLimit = Math.ceil(
                          (result.gasUsed ?? 0) * gasSimulator.gasAdjustment
                        );
                      }
                    } else {
                      // evmSimulationOutcome is undefined, this should not happen
                      // Fallback: use total gas limit from simulator.
                      gasLimit = swapConfigs.gasConfig.gas;
                    }

                    if (gasLimit <= 0) {
                      throw new Error("Gas limit is not positive");
                    }

                    const feeObject = buildEvmFeeObject(gasLimit);

                    // if evmSimulationOutcome이 bundle인데 callback으로 erc20 approval만 계산되었다면,
                    // 이 시점에서 erc20 approval을 먼저 실행을해서 완전히 상태가 업데이트된 다음 swap 트랜잭션의 서명을 처리해줘야만 한다.
                    // 먼저 처리된 erc20 approval 트랜잭션의 status는 CONFIRMED로 설정하여 백그라운드에서 실행을 스킵한다.
                    if (
                      evmSimulationOutcome ===
                        EvmGasSimulationOutcome.APPROVAL_ONLY_SIMULATED &&
                      evmTxIndex === 0 &&
                      erc20Approval != null
                    ) {
                      ethereumAccount.setIsSendingTx(true);

                      // wait for the erc20 approval tx to be executed and confirmed
                      // before signing the swap tx
                      const erc20ApprovalTxHash = await new Promise<string>(
                        (resolve, reject) => {
                          signatureNavigationCount += 1;

                          ethereumAccount
                            .sendEthereumTx(
                              sender,
                              {
                                ...evmTx,
                                ...feeObject,
                              },
                              {
                                onBroadcastFailed: (e) => {
                                  if (
                                    erc20ApprovalTx &&
                                    e?.message === "Request rejected"
                                  ) {
                                    // logEvent("erc20_approve_sign_canceled", {
                                    //   quote_id: quoteIdRef.current,
                                    // });
                                  }

                                  reject(e ?? new Error("Broadcast failed"));
                                },
                                onBroadcasted: () => {
                                  // logEvent("erc20_approve_tx_submitted", {
                                  //   quote_id: quoteIdRef.current,
                                  // });
                                },
                                onFulfill: (txReceipt) => {
                                  const queryBalances = queriesStore.get(
                                    swapConfigs.amountConfig.chainId
                                  ).queryBalances;
                                  queryBalances
                                    .getQueryEthereumHexAddress(sender)
                                    .balances.forEach((balance) => {
                                      if (
                                        balance.currency.coinMinimalDenom ===
                                          swapConfigs.amountConfig.currency
                                            .coinMinimalDenom ||
                                        swapConfigs.feeConfig.fees.some(
                                          (fee) =>
                                            fee.currency.coinMinimalDenom ===
                                            balance.currency.coinMinimalDenom
                                        )
                                      ) {
                                        balance.fetch();
                                      }
                                    });

                                  if (
                                    txReceipt.status === EthTxStatus.Success
                                  ) {
                                    resolve(txReceipt.transactionHash);
                                  } else {
                                    reject(new Error("Transaction failed"));
                                  }
                                },
                              }
                            )
                            .catch(reject)
                            .finally(() => {
                              ethereumAccount.setIsSendingTx(false);
                            });
                        }
                      );

                      // update the backgroundTx with the erc20 approval tx hash
                      backgroundTx.status = BackgroundTxStatus.CONFIRMED;
                      backgroundTx.txData = {
                        ...backgroundTx.txData,
                        ...feeObject,
                      };
                      backgroundTx.txHash = erc20ApprovalTxHash;

                      uiConfigStore.ibcSwapConfig.incrementCompletedSignature();
                    } else {
                      signatureNavigationCount += 1;

                      const signedTx = await ethereumAccount.signEthereumTx(
                        swapConfigs.senderConfig.sender,
                        {
                          ...evmTx,
                          ...feeObject,
                          ...(evmTxIndex !== 0 &&
                          erc20Approval != null &&
                          evmSimulationOutcome !==
                            EvmGasSimulationOutcome.APPROVAL_ONLY_SIMULATED
                            ? { requiredErc20Approvals: [erc20Approval] }
                            : {}),
                        },
                        {
                          nonceMethod: "pending",
                          considerRequiredErc20ApprovalsForNonce:
                            evmTxIndex !== 0 && erc20Approval != null,
                        }
                      );

                      backgroundTx.txData = {
                        ...backgroundTx.txData,
                        ...feeObject,
                      };
                      backgroundTx.signedTx = signedTx;

                      uiConfigStore.ibcSwapConfig.incrementCompletedSignature();
                    }
                  }
                }

                evmBackgroundTxs.push(backgroundTx);
              }

              backgroundTxs.push(...evmBackgroundTxs);
            }
          }

          // Navigate back once for all sign pages to avoid multiple remounts
          // Sign pages use replace after the first one, so only 1 history entry is added
          if (signatureNavigationCount > 0) {
            // reset the signature navigation count
            // to prevent multiple navigation in catch block if error occurs below
            signatureNavigationCount = 0;
            navigate(-1);
          }

          //================================================================================
          // 4. Record and execute background txs
          //================================================================================

          const executeTxMsg = new RecordAndExecuteTxsMsg(
            vaultId,
            executionType,
            backgroundTxs,
            executableChainIds,
            historyData,
            historyTxIndex
          );

          const result = await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            executeTxMsg
          );
          if (result.status === TxExecutionStatus.FAILED) {
            throw new Error(result.error ?? "Transaction execution failed");
          }

          if (!chainStore.isEnabledChain(swapConfigs.amountConfig.outChainId)) {
            chainStore.enableChainInfoInUI(swapConfigs.amountConfig.outChainId);

            if (keyRingStore.selectedKeyInfo) {
              const outChainInfo = chainStore.getChain(
                swapConfigs.amountConfig.outChainId
              );
              if (
                keyRingStore.needKeyCoinTypeFinalize(
                  keyRingStore.selectedKeyInfo.id,
                  outChainInfo
                )
              ) {
                keyRingStore.finalizeKeyCoinType(
                  keyRingStore.selectedKeyInfo.id,
                  outChainInfo.chainId,
                  outChainInfo.bip44.coinType
                );
              }
            }
          }

          // Treat blocked state as successful for now (since this is a multi-tx case),
          // and guide the user to resume the transaction later through history tracking ui.
          notification.show(
            "success",
            intl.formatMessage({ id: "notification.transaction-success" }),
            ""
          );

          // update balance for inChainId
          updateBalanceCallback?.();

          //   if (isSwap) {
          //     // logEvent("swap_tx_submitted", {
          //     //   quote_id: quoteIdRef.current,
          //     // });
          //   }

          //   const params: Record<
          //     string,
          //     | number
          //     | string
          //     | boolean
          //     | number[]
          //     | string[]
          //     | undefined
          //   > = {
          //     inChainId: inChainId,
          //     inChainIdentifier:
          //       ChainIdHelper.parse(inChainId).identifier,
          //     inCurrencyMinimalDenom: inCurrency.coinMinimalDenom,
          //     inCurrencyDenom: inCurrency.coinDenom,
          //     inCurrencyCommonMinimalDenom: inCurrency.coinMinimalDenom,
          //     inCurrencyCommonDenom: inCurrency.coinDenom,
          //     outChainId: outChainId,
          //     outChainIdentifier:
          //       ChainIdHelper.parse(outChainId).identifier,
          //     outCurrencyMinimalDenom: outCurrency.coinMinimalDenom,
          //     outCurrencyDenom: outCurrency.coinDenom,
          //     outCurrencyCommonMinimalDenom:
          //       outCurrency.coinMinimalDenom,
          //     outCurrencyCommonDenom: outCurrency.coinDenom,
          //     swapType: swapConfigs.amountConfig.type,
          //   };
          //   if (
          //     "originChainId" in inCurrency &&
          //     inCurrency.originChainId
          //   ) {
          //     const originChainId = inCurrency.originChainId;
          //     params["inOriginChainId"] = originChainId;
          //     params["inOriginChainIdentifier"] =
          //       ChainIdHelper.parse(originChainId).identifier;

          //     params["inToDifferentChain"] = true;
          //   }
          //   if (
          //     "originCurrency" in inCurrency &&
          //     inCurrency.originCurrency
          //   ) {
          //     params["inCurrencyCommonMinimalDenom"] =
          //       inCurrency.originCurrency.coinMinimalDenom;
          //     params["inCurrencyCommonDenom"] =
          //       inCurrency.originCurrency.coinDenom;
          //   }
          //   if (
          //     "originChainId" in outCurrency &&
          //     outCurrency.originChainId
          //   ) {
          //     const originChainId = outCurrency.originChainId;
          //     params["outOriginChainId"] = originChainId;
          //     params["outOriginChainIdentifier"] =
          //       ChainIdHelper.parse(originChainId).identifier;

          //     params["outToDifferentChain"] = true;
          //   }
          //   if (
          //     "originCurrency" in outCurrency &&
          //     outCurrency.originCurrency
          //   ) {
          //     params["outCurrencyCommonMinimalDenom"] =
          //       outCurrency.originCurrency.coinMinimalDenom;
          //     params["outCurrencyCommonDenom"] =
          //       outCurrency.originCurrency.coinDenom;
          //   }
          //   params["inRange"] = amountToAmbiguousString(
          //     swapConfigs.amountConfig.amount[0]
          //   );
          //   params["outRange"] = amountToAmbiguousString(
          //     swapConfigs.amountConfig.outAmount
          //   );

          //   // UI 상에서 in currency의 가격은 in input에서 표시되고
          //   // out currency의 가격은 swap fee에서 표시된다.
          //   // price store에서 usd는 무조건 쿼리하므로 in, out currency의 usd는 보장된다.
          //   const inCurrencyPrice = priceStore.calculatePrice(
          //     swapConfigs.amountConfig.amount[0],
          //     "usd"
          //   );
          //   if (inCurrencyPrice) {
          //     params["inFiatRange"] =
          //       amountToAmbiguousString(inCurrencyPrice);
          //     params["inFiatAvg"] =
          //       amountToAmbiguousAverage(inCurrencyPrice);
          //   }
          //   const outCurrencyPrice = priceStore.calculatePrice(
          //     swapConfigs.amountConfig.outAmount,
          //     "usd"
          //   );
          //   if (outCurrencyPrice) {
          //     params["outFiatRange"] =
          //       amountToAmbiguousString(outCurrencyPrice);
          //     params["outFiatAvg"] =
          //       amountToAmbiguousAverage(outCurrencyPrice);
          //   }

          //   new InExtensionMessageRequester().sendMessage(
          //     BACKGROUND_PORT,
          //     new LogAnalyticsEventMsg("ibc_swap", params)
          //   );

          //   analyticsStore.logEvent("swap_occurred", {
          //     in_chain_id: inChainId,
          //     in_chain_identifier:
          //       ChainIdHelper.parse(inChainId).identifier,
          //     in_currency_minimal_denom: inCurrency.coinMinimalDenom,
          //     in_currency_denom: inCurrency.coinDenom,
          //     out_chain_id: outChainId,
          //     out_chain_identifier:
          //       ChainIdHelper.parse(outChainId).identifier,
          //     out_currency_minimal_denom: outCurrency.coinMinimalDenom,
          //     out_currency_denom: outCurrency.coinDenom,
          //   });
          // },
        } catch (e) {
          if (e?.message === "Request rejected") {
            if (isSwap) {
              // logEvent("swap_sign_canceled", {
              //   quote_id: quoteIdRef.current,
              // });
            }

            return;
          }

          if (isSwap) {
            // logEvent("swap_tx_failed", {
            //   quote_id: quoteIdRef.current,
            //   error_message: e?.message,
            // });
          }

          // in case of error, navigate back to the previous page if any signing was attempted
          if (signatureNavigationCount > 0) {
            navigate(-1);
          }

          console.log(e);
          notification.show(
            "failed",
            intl.formatMessage({ id: "error.transaction-failed" }),
            ""
          );
        } finally {
          uiConfigStore.ibcSwapConfig.setIsSwapLoading(false);
          uiConfigStore.ibcSwapConfig.resetSignatureProgress();
        }
      }}
    >
      <Box padding="0.75rem" paddingBottom="0">
        <Box paddingX="0.5rem">
          <XAxis alignY="center">
            <H4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              <FormattedMessage id="page.ibc-swap.title.swap" />
            </H4>
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
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-10"]
                }
              />
            </Box>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        <SwapAssetInfo
          type="from"
          senderConfig={swapConfigs.senderConfig}
          amountConfig={swapConfigs.amountConfig}
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
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette.white
                  : ColorPalette["gray-500"]
              }
              hover={{
                backgroundColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-10"]
                    : ColorPalette["gray-550"],
              }}
              borderRadius="999999px"
              borderWidth="1px"
              borderColor={
                theme.mode === "light" ? ColorPalette["gray-50"] : "transparent"
              }
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();

                const chainId = swapConfigs.amountConfig.chainId;
                const currency = swapConfigs.amountConfig.currency;
                const outChainId = swapConfigs.amountConfig.outChainId;
                const outCurrency = swapConfigs.amountConfig.outCurrency;

                setSearchParams(
                  (prev) => {
                    // state 처리가 난해해서 그냥 query string으로 해결한다.
                    prev.set("chainId", outChainId);
                    prev.set("coinMinimalDenom", outCurrency.coinMinimalDenom);
                    prev.set("outChainId", chainId);
                    prev.set("outCoinMinimalDenom", currency.coinMinimalDenom);

                    // 같은 페이지 내에서의 변경이기 때문에 "initialAmount"는 사용할 수 없음.
                    // 하지만 여기서 amountConfig의 value를 바로 바꾼다고 해도
                    // query string에 의한 변화는 다음 렌더링에 적용되고
                    // currency가 변할때 value가 초기화되기 때문에 여기서 바꿀 순 없음...
                    // 일단 다음 rendering에서 setValue가 처리되어야하는데
                    // 다음 rendering에 로직을 넣는게 react에서는 힘들기 때문에
                    // 임시 query string field로 처리함
                    // 이 field는 다음 rendering에서 사용되고 바로 삭제됨.
                    if (
                      swapConfigs.amountConfig.outAmount.toDec().gt(new Dec(0))
                    ) {
                      prev.set(
                        "tempSwitchAmount",
                        swapConfigs.amountConfig.outAmount
                          .hideDenom(true)
                          .locale(false)
                          .inequalitySymbol(false)
                          .toString()
                      );
                    } else {
                      prev.set("tempSwitchAmount", "");
                    }

                    return prev;
                  },
                  {
                    replace: true,
                  }
                );
              }}
            >
              <ArrowsUpDownIcon
                width="1.5rem"
                height="1.5rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-10"]
                }
              />
            </Box>
          </div>
        </Box>

        <SwapAssetInfo
          type="to"
          senderConfig={swapConfigs.senderConfig}
          amountConfig={swapConfigs.amountConfig}
          onDestinationChainSelect={(chainId, coinMinimalDenom) => {
            setSearchParams(
              (prev) => {
                // state 처리가 난해해서 그냥 query string으로 해결한다.
                prev.set("outChainId", chainId);
                prev.set("outCoinMinimalDenom", coinMinimalDenom);

                return prev;
              },
              {
                replace: true,
              }
            );
          }}
        />
        <Gutter size="0.75rem" />
        <VerticalCollapseTransition collapsed={shouldTopUp}>
          <SwapFeeInfo
            senderConfig={swapConfigs.senderConfig}
            amountConfig={swapConfigs.amountConfig}
            gasConfig={swapConfigs.gasConfig}
            feeConfig={swapConfigs.feeConfig}
            gasSimulator={gasSimulator}
            disableAutomaticFeeSet={shouldTopUp}
            isForEVMTx={isInChainEVMOnly}
            nonceMethod={nonceMethod}
            setNonceMethod={setNonceMethod}
            shouldTopUp={shouldTopUp}
          />
        </VerticalCollapseTransition>
        <VerticalCollapseTransition collapsed={!shouldTopUp}>
          <FeeCoverageDescription isTopUpAvailable={isTopUpAvailable} />
        </VerticalCollapseTransition>

        <VerticalCollapseTransition collapsed={shouldTopUp}>
          <WarningGuideBox
            showUSDNWarning={showUSDNWarning}
            showCelestiaWarning={showCelestiaWarning}
            amountConfig={swapConfigs.amountConfig}
            feeConfig={swapConfigs.feeConfig}
            gasConfig={swapConfigs.gasConfig}
            senderConfig={swapConfigs.senderConfig}
            title={
              isHighPriceImpact &&
              !calculatingTxError &&
              !swapConfigs.amountConfig.uiProperties.error &&
              !swapConfigs.amountConfig.uiProperties.warning
                ? (() => {
                    const inPrice = priceStore.calculatePrice(
                      swapConfigs.amountConfig.amount[0],
                      "usd"
                    );
                    const outPrice = priceStore.calculatePrice(
                      swapConfigs.amountConfig.outAmount,
                      "usd"
                    );
                    return intl.formatMessage(
                      {
                        id: "page.ibc-swap.warning.high-price-impact-title",
                      },
                      {
                        inPrice: inPrice?.toString(),
                        srcChain: swapConfigs.amountConfig.chainInfo.chainName,
                        outPrice: outPrice?.toString(),
                        dstChain: chainStore.getChain(
                          swapConfigs.amountConfig.outChainId
                        ).chainName,
                      }
                    );
                  })()
                : undefined
            }
            forceError={calculatingTxError}
            forceWarning={(() => {
              if (unableToPopulatePrices.length > 0) {
                return new Error(
                  intl.formatMessage(
                    {
                      id: "page.ibc-swap.warning.unable-to-populate-price",
                    },
                    {
                      assets: unableToPopulatePrices.join(", "),
                    }
                  )
                );
              }

              if (isHighPriceImpact) {
                return new Error(
                  intl.formatMessage({
                    id: "page.ibc-swap.warning.high-price-impact",
                  })
                );
              }
            })()}
          />
        </VerticalCollapseTransition>

        <Gutter size="0.75rem" />

        {oneClickSwapEnabled ? (
          <HoldButton
            type="submit"
            holdDurationMs={1500}
            disabled={
              interactionBlocked ||
              showUSDNWarning ||
              showCelestiaWarning ||
              (shouldTopUp && !isTopUpAvailable)
            }
            text={
              shouldTopUp && remainingText
                ? remainingText
                : intl.formatMessage({
                    id: "page.ibc-swap.button.hold-to-approve",
                  })
            }
            holdingText={intl.formatMessage({
              id: "page.ibc-swap.button.keep-holding",
            })}
            color="primary"
            size="large"
            isLoading={
              uiConfigStore.ibcSwapConfig.isSwapLoading ||
              accountStore.getAccount(inChainId).isSendingMsg === "ibc-swap"
            }
            onHoldStart={() => setIsButtonHolding(true)}
            onHoldEnd={() => setIsButtonHolding(false)}
          />
        ) : (
          <Button
            type="submit"
            disabled={
              interactionBlocked ||
              showUSDNWarning ||
              showCelestiaWarning ||
              (shouldTopUp && !isTopUpAvailable)
            }
            text={
              shouldTopUp && remainingText
                ? remainingText
                : intl.formatMessage({
                    id: "page.ibc-swap.title.swap",
                  })
            }
            color="primary"
            size="large"
            isLoading={
              uiConfigStore.ibcSwapConfig.isSwapLoading ||
              accountStore.getAccount(inChainId).isSendingMsg === "ibc-swap"
            }
          />
        )}

        <Gutter size="0.75rem" />

        <TextButtonStyles.Container>
          <TextButtonStyles.Button
            onClick={(e) => {
              e.preventDefault();

              browser.tabs.create({
                url: TermsOfUseUrl,
              });
            }}
          >
            <FormattedMessage id="page.ibc-swap.button.terms-of-use.title" />
          </TextButtonStyles.Button>
        </TextButtonStyles.Container>

        <Gutter size="0.75rem" />
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
  amountConfig: SwapAmountConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  senderConfig: ISenderConfig;

  forceError?: Error;
  forceWarning?: Error;
  title?: string;

  showUSDNWarning?: boolean;
  showCelestiaWarning?: boolean;
}> = observer(
  ({
    amountConfig,
    feeConfig,
    gasConfig,
    senderConfig,
    forceError,
    forceWarning,
    title,
    showUSDNWarning,
    showCelestiaWarning,
  }) => {
    useInsufficientFeeAnalytics(feeConfig, senderConfig);

    const intl = useIntl();
    const theme = useTheme();

    const error: string | undefined = (() => {
      if (feeConfig.uiProperties.error) {
        if (feeConfig.uiProperties.error instanceof InsufficientFeeError) {
          return intl.formatMessage({
            id: "components.input.fee-control.error.insufficient-fee",
          });
        }

        return (
          feeConfig.uiProperties.error.message ||
          feeConfig.uiProperties.error.toString()
        );
      }

      if (feeConfig.uiProperties.warning) {
        return (
          feeConfig.uiProperties.warning.message ||
          feeConfig.uiProperties.warning.toString()
        );
      }

      if (gasConfig.uiProperties.error) {
        return (
          gasConfig.uiProperties.error.message ||
          gasConfig.uiProperties.error.toString()
        );
      }

      if (gasConfig.uiProperties.warning) {
        return (
          gasConfig.uiProperties.warning.message ||
          gasConfig.uiProperties.warning.toString()
        );
      }

      if (forceError) {
        return forceError.message || forceError.toString();
      }

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

      const queryError = amountConfig.getQueryRoute()?.error;
      if (queryError) {
        return queryError.message || queryError.toString();
      }

      if (forceWarning) {
        return forceWarning.message || forceWarning.toString();
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

    let collapsed = error == null;

    const globalSimpleBar = useGlobalSimpleBar();
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
    }, [collapsed]);

    let errorText = (() => {
      const err = error || lastError;

      if (
        err &&
        err === "could not find a path to execute the requested swap"
      ) {
        return intl.formatMessage({
          id: "page.ibc-swap.error.no-route-found",
        });
      }

      return err;
    })();

    if (showUSDNWarning) {
      title = "Swap Smarter";
      errorText =
        "To avoid high slippage, use Deposit or Withdraw on the Earn page.";
      collapsed = false;
    }

    if (showCelestiaWarning) {
      title = "Temporarily Unavailable";
      errorText =
        "IBC transfers to and from Celestia are temporarily unavailable due to network issues.";
      collapsed = false;
    }

    return (
      <React.Fragment>
        {/* 별 차이는 없기는한데 gutter와 실제 컴포넌트의 트랜지션을 분리하는게 아주 약간 더 자연스러움 */}
        <VerticalCollapseTransition collapsed={collapsed}>
          <Gutter size="0.75rem" />
        </VerticalCollapseTransition>
        <VerticalCollapseTransition collapsed={collapsed}>
          <GuideBox
            color={showUSDNWarning ? "default" : "warning"}
            title={title || errorText}
            paragraph={title ? errorText : undefined}
            hideInformationIcon={!title}
            backgroundColor={(() => {
              if (showUSDNWarning && theme.mode === "light") {
                return ColorPalette["gray-10"];
              }
            })()}
            bottom={(() => {
              if (showUSDNWarning) {
                return (
                  <Link to="/earn/overview">
                    <Subtitle4
                      style={{
                        textDecorationLine: "underline",
                      }}
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-600"]
                          : ColorPalette["gray-100"]
                      }
                    >
                      Go to Earn page
                    </Subtitle4>
                  </Link>
                );
              }
            })()}
          />
        </VerticalCollapseTransition>
      </React.Fragment>
    );
  }
);

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

const ArrowsUpDownIcon: FunctionComponent<{
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
      viewBox="0 0 24 24"
    >
      <path
        fill={color || "currentColor"}
        fillRule="evenodd"
        d="M2.688 8.16a.9.9 0 001.272-.048l2.34-2.52V15.9a.9.9 0 101.8 0V5.592l2.34 2.52a.9.9 0 001.32-1.224l-3.9-4.2a.9.9 0 00-1.32 0l-3.9 4.2a.9.9 0 00.048 1.272zm9.6 7.68a.9.9 0 00-.047 1.272l3.9 4.2a.9.9 0 001.319 0l3.9-4.2a.9.9 0 00-1.32-1.224l-2.34 2.52V8.1a.9.9 0 10-1.8 0v10.308l-2.34-2.52a.9.9 0 00-1.272-.047z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const noop = (..._args: any[]) => {
  // noop
};
