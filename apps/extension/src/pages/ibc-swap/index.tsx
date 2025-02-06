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
import {
  IBCSwapAmountConfig,
  useIBCSwapConfig,
} from "@keplr-wallet/hooks-internal";
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
import { FormattedMessage, useIntl } from "react-intl";
import { SwapFeeBps, TermsOfUseUrl } from "../../config.ui";
import { BottomTabsHeightRem } from "../../bottom-tabs";
import { useSearchParams } from "react-router-dom";
import { useTxConfigsQueryString } from "../../hooks/use-tx-config-query-string";
import { MainHeaderLayout } from "../main/layouts/header";
import { XAxis } from "../../components/axis";
import { Caption2, H4 } from "../../components/typography";
import { SlippageModal } from "./components/slippage-modal";
import styled, { useTheme } from "styled-components";
import { GuideBox } from "../../components/guide-box";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { useGlobarSimpleBar } from "../../hooks/global-simplebar";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { MakeTxResponse, WalletStatus } from "@keplr-wallet/stores";
import { autorun } from "mobx";
import {
  LogAnalyticsEventMsg,
  RecordTxWithSkipSwapMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCSwapMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, Message } from "@keplr-wallet/router";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { useEffectOnce } from "../../hooks/use-effect-once";
import { amountToAmbiguousAverage, amountToAmbiguousString } from "../../utils";
import { Button } from "../../components/button";
import { TextButtonProps } from "../../components/button-text";
import {
  UnsignedEVMTransaction,
  UnsignedEVMTransactionWithErc20Approvals,
} from "@keplr-wallet/stores-eth";
import { EthTxStatus } from "@keplr-wallet/types";

const TextButtonStyles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  Button: styled.button<Omit<TextButtonProps, "onClick">>`
    width: 100%;
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
    skipQueriesStore,
    uiConfigStore,
    keyRingStore,
    hugeQueriesStore,
    priceStore,
    analyticsStore,
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

  const [swapFeeBps, setSwapFeeBps] = useState(SwapFeeBps.value);
  const isInChainEVMOnly = chainStore.isEvmOnlyChain(inChainId);
  const inChainAccount = accountStore.getAccount(inChainId);

  const ibcSwapConfigs = useIBCSwapConfig(
    chainStore,
    queriesStore,
    accountStore,
    ethereumAccountStore,
    skipQueriesStore,
    inChainId,
    isInChainEVMOnly
      ? inChainAccount.ethereumHexAddress
      : inChainAccount.bech32Address,
    // TODO: config로 빼기
    200000,
    outChainId,
    outCurrency,
    swapFeeBps
  );
  const querySwapFeeBps = queriesStore.simpleQuery.queryGet<{
    pairs?: {
      [key: string]: number | undefined;
    };
    swapFeeBps?: 50;
  }>(process.env["KEPLR_EXT_CONFIG_SERVER"], "/swap-fee/info.json");
  useEffect(() => {
    const defaultSwapFeeBps = SwapFeeBps.value;
    if (querySwapFeeBps.response) {
      let inOut: [
        {
          chainId: string;
          coinMinimalDenom: string;
        },
        {
          chainId: string;
          coinMinimalDenom: string;
        }
      ] = [
        (() => {
          const currency = ibcSwapConfigs.amountConfig.amount[0].currency;
          if (
            "originChainId" in currency &&
            "originCurrency" in currency &&
            currency.originChainId &&
            currency.originCurrency
          ) {
            return {
              chainId: currency.originChainId,
              coinMinimalDenom: currency.originCurrency.coinMinimalDenom,
            };
          }
          return {
            chainId: ibcSwapConfigs.amountConfig.chainId,
            coinMinimalDenom: currency.coinMinimalDenom,
          };
        })(),
        (() => {
          const currency = ibcSwapConfigs.amountConfig.outCurrency;
          if (
            "originChainId" in currency &&
            "originCurrency" in currency &&
            currency.originChainId &&
            currency.originCurrency
          ) {
            return {
              chainId: currency.originChainId,
              coinMinimalDenom: currency.originCurrency.coinMinimalDenom,
            };
          }
          return {
            chainId: ibcSwapConfigs.amountConfig.outChainId,
            coinMinimalDenom: currency.coinMinimalDenom,
          };
        })(),
      ];

      inOut = inOut.sort((a, b) => {
        const aChainIdentifier = chainStore.getChain(a.chainId).chainIdentifier;
        const bChainIdentifier = chainStore.getChain(b.chainId).chainIdentifier;

        if (aChainIdentifier === bChainIdentifier) {
          return 0;
        }
        return aChainIdentifier < bChainIdentifier ? -1 : 1;
      });

      const key = inOut
        .map(
          (v) =>
            `${chainStore.getChain(v.chainId).chainIdentifier}/${
              v.coinMinimalDenom
            }`
        )
        .join("/");

      if (
        querySwapFeeBps.response.data["pairs"] &&
        querySwapFeeBps.response.data["pairs"][key] != null
      ) {
        const fee = querySwapFeeBps.response.data["pairs"][key];
        if (fee != null) {
          setSwapFeeBps(fee);
        }
      } else {
        if (querySwapFeeBps.response.data["swapFeeBps"] != null) {
          const fee = querySwapFeeBps.response.data["swapFeeBps"];
          if (fee != null) {
            setSwapFeeBps(fee);
          }
        } else {
          setSwapFeeBps(defaultSwapFeeBps);
        }
      }
    } else {
      setSwapFeeBps(defaultSwapFeeBps);
    }
  }, [
    chainStore,
    ibcSwapConfigs.amountConfig.amount,
    ibcSwapConfigs.amountConfig.chainId,
    ibcSwapConfigs.amountConfig.outChainId,
    ibcSwapConfigs.amountConfig.outCurrency,
    querySwapFeeBps.response,
  ]);

  ibcSwapConfigs.amountConfig.setCurrency(inCurrency);

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc-swap.swap"),
    chainStore,
    inChainId,
    ibcSwapConfigs.gasConfig,
    ibcSwapConfigs.feeConfig,
    (() => {
      // simulation 할때 예상되는 gas에 따라서 밑의 값을 설정해야한다.
      // 근데 이걸 엄밀히 정하기는 어렵다
      // 추정을해보면 당연히 destination token에 따라서 값이 다를 수 있다.
      // 또한 트랜잭션이 ibc transfer인지 cosmwasm execute인지에 따라서 다를 수 있다.
      // ibc transfer일 경우는 차이는 memo의 길이일 뿐인데 이건 gas에 그다지 영향을 미치지 않기 때문에 gas adjustment로 충분하다.
      // swap일 경우 (osmosis에서 실행될 경우) swpa이 몇번 필요한지에 따라 영향을 미칠 것이다.
      let type = "default";

      const queryRoute = ibcSwapConfigs.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();
      if (queryRoute && queryRoute.response) {
        // swap일 경우 웬만하면 swap 한번으로 충분할 확률이 높다.
        // 이 가정에 따라서 첫로드시에 gas를 restore하기 위해서 트랜잭션을 보내는 체인에서 swap 할 경우
        // 일단 swap-1로 설정한다.
        if (
          queryRoute.response.data.swap_venues &&
          queryRoute.response.data.swap_venues.length === 1
        ) {
          const swapVenueChainId = (() => {
            const evmLikeChainId = Number(
              queryRoute.response.data.swap_venues[0].chain_id
            );
            const isEVMChainId =
              !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;

            return isEVMChainId
              ? `eip155:${evmLikeChainId}`
              : queryRoute.response.data.swap_venues[0].chain_id;
          })();

          if (
            ibcSwapConfigs.amountConfig.chainInfo.chainIdentifier ===
            chainStore.getChain(swapVenueChainId).chainIdentifier
          ) {
            type = `swap-1`;
          }
        }

        if (queryRoute.response.data.operations.length > 0) {
          const firstOperation = queryRoute.response.data.operations[0];
          if ("swap" in firstOperation) {
            if (firstOperation.swap.swap_in) {
              type = `swap-${firstOperation.swap.swap_in.swap_operations.length}`;
            } else if (firstOperation.swap.smart_swap_in) {
              type = `swap-${firstOperation.swap.smart_swap_in.swap_routes.reduce(
                (acc, cur) => {
                  return (acc += cur.swap_operations.length);
                },
                0
              )}`;
            }
          }

          if ("axelar_transfer" in firstOperation) {
            type = "axelar_transfer";
          }

          if ("cctp_transfer" in firstOperation) {
            type = "cctp_transfer";
          }

          if ("go_fast_transfer" in firstOperation) {
            type = "go_fast_transfer";
          }

          if ("hyperlane_transfer" in firstOperation) {
            type = "hyperlane_transfer";
          }

          if ("evm_swap" in firstOperation) {
            type = "evm_swap";
          }
        }
      }

      return `${ibcSwapConfigs.amountConfig.outChainId}/${ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom}/${type}`;
    })(),
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

      const swapFeeBpsReceiver: string[] = [];
      const queryRoute = ibcSwapConfigs.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();
      if (queryRoute && queryRoute.response) {
        if (queryRoute.response.data.operations.length > 0) {
          for (const operation of queryRoute.response.data.operations) {
            if ("swap" in operation) {
              const swapIn =
                operation.swap.swap_in ?? operation.swap.smart_swap_in;
              if (swapIn) {
                const swapFeeBpsReceiverAddress = SwapFeeBps.receivers.find(
                  (r) => r.chainId === swapIn.swap_venue.chain_id
                );
                if (swapFeeBpsReceiverAddress) {
                  swapFeeBpsReceiver.push(swapFeeBpsReceiverAddress.address);
                }
              }
            }
          }
        }
      }

      const tx = ibcSwapConfigs.amountConfig.getTxIfReady(
        // simulation 자체는 쉽게 통과시키기 위해서 슬리피지를 50으로 설정한다.
        50,
        // 코스모스 스왑은 스왑베뉴가 무조건 하나라고 해서 일단 처음걸 쓰기로 한다.
        swapFeeBpsReceiver[0]
      );

      if (!tx) {
        throw new Error("Not ready to simulate tx");
      }

      if ("send" in tx) {
        return tx;
      } else {
        const ethereumAccount = ethereumAccountStore.getAccount(
          ibcSwapConfigs.amountConfig.chainId
        );
        const sender = ibcSwapConfigs.senderConfig.sender;

        const isErc20InCurrency =
          ("type" in inCurrency && inCurrency.type === "erc20") ||
          inCurrency.coinMinimalDenom.startsWith("erc20:");
        const erc20Approval = tx.requiredErc20Approvals?.[0];
        const erc20ApprovalTx =
          erc20Approval && isErc20InCurrency
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

        // OP Stack L1 Data Fee 계산은 일단 무시하기로 한다.

        return {
          simulate: () =>
            ethereumAccount.simulateGas(sender, erc20ApprovalTx ?? tx),
        };
      }
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

  const tempSwitchAmount = searchParams.get("tempSwitchAmount");
  useEffect(() => {
    if (tempSwitchAmount != null) {
      ibcSwapConfigs.amountConfig.setValue(tempSwitchAmount);
      setSearchParams((prev) => {
        prev.delete("tempSwitchAmount");
        return prev;
      });
    }
  }, [ibcSwapConfigs.amountConfig, setSearchParams, tempSwitchAmount]);

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

  // ------ 기능상 의미는 없고 이 페이지에서 select asset page로의 전환시 UI flash를 막기 위해서 필요한 값들을 prefetch하는 용도
  useEffect(() => {
    const disposal = autorun(() => {
      noop(hugeQueriesStore.getAllBalances(true));
      noop(skipQueriesStore.queryIBCSwap.swapDestinationCurrenciesMap);
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [hugeQueriesStore, skipQueriesStore.queryIBCSwap]);
  useEffect(() => {
    const disposal = autorun(() => {
      noop(
        skipQueriesStore.queryIBCSwap.getSwapDestinationCurrencyAlternativeChains(
          chainStore.getChain(ibcSwapConfigs.amountConfig.outChainId),
          ibcSwapConfigs.amountConfig.outCurrency
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
    ibcSwapConfigs.amountConfig.outChainId,
    ibcSwapConfigs.amountConfig.outCurrency,
    skipQueriesStore.queryIBCSwap,
  ]);
  // ------

  const [isHighPriceImpact, setIsHighPriceImpact] = useState(false);
  useEffectOnce(() => {
    const disposal = autorun(() => {
      if (ibcSwapConfigs.amountConfig.amount.length > 0) {
        const amt = ibcSwapConfigs.amountConfig.amount[0];
        // priceStore.calculatePrice를 여기서 먼저 실행하는건 의도적인 행동임.
        // 유저가 amount를 입력하기 전에 미리 fecth를 해놓기 위해서임.
        const inPrice = priceStore.calculatePrice(amt, "usd");
        let outPrice = priceStore.calculatePrice(
          ibcSwapConfigs.amountConfig.outAmount,
          "usd"
        );
        if (outPrice) {
          // otherFees는 브릿징 수수료를 의미힌다.
          // slippage 경고에서 브릿징 수수료를 포함시키지 않으면 경고가 너무 자주 뜨게 되므로
          // 브릿징 수수료를 out price에 감안한다.
          for (const otherFee of ibcSwapConfigs.amountConfig.otherFees) {
            const price = priceStore.calculatePrice(otherFee, "usd");
            if (price) {
              outPrice = outPrice.add(price);
            }
          }
        }
        if (amt.toDec().gt(new Dec(0))) {
          if (
            inPrice &&
            // in price가 아주 낮으면 오히려 price impact가 높아진다.
            // 근데 이 경우는 전혀 치명적인 자산 상의 문제가 생기지 않으므로 0달러가 아니라 1달러가 넘어야 체크한다.
            inPrice.toDec().gt(new Dec(1)) &&
            outPrice &&
            outPrice.toDec().gt(new Dec(0))
          ) {
            if (ibcSwapConfigs.amountConfig.swapPriceImpact) {
              // price impact가 2.5% 이상이면 경고
              if (
                ibcSwapConfigs.amountConfig.swapPriceImpact
                  .toDec()
                  .mul(new Dec(100))
                  .gt(new Dec(2.5))
              ) {
                setIsHighPriceImpact(true);
                return;
              }
            }

            if (inPrice.toDec().gt(outPrice.toDec())) {
              const priceImpact = inPrice
                .toDec()
                .sub(outPrice.toDec())
                .quo(inPrice.toDec())
                .mul(new Dec(100));
              // price impact가 2.5% 이상이면 경고
              if (priceImpact.gt(new Dec(2.5))) {
                setIsHighPriceImpact(true);
                return;
              }
            }
          }
        }
      }

      setIsHighPriceImpact(false);
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  });
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

  // --------------------------
  // from or to 중에서 coingecko로부터 가격을 알 수 없는 경우 price impact를 알 수 없기 때문에
  // 이런 경우 유저에게 경고를 표시해줌
  // 가끔씩 바보같이 coingecko에 올라가있지도 않은데 지 맘대로 coingecko id를 넣는 얘들도 있어서
  // 실제로 쿼리를 해보고 있는지 아닌지 판단하는 로직도 있음
  // coingecko로부터 가격이 undefined거나 0이면 알 수 없는 것으로 처리함.
  // 근데 쿼리에 걸리는 시간도 있으니 이 경우는 1000초 쉼.
  const [inOrOutChangedDelay, setInOrOutChangedDelay] = useState(true);
  useEffect(() => {
    setInOrOutChangedDelay(true);
    const timeoutId = setTimeout(() => {
      setInOrOutChangedDelay(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom]);
  const unablesToPopulatePrice = (() => {
    const r: string[] = [];
    if (!inCurrency.coinGeckoId) {
      if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
        r.push(inCurrency.originCurrency.coinDenom);
      } else {
        r.push(inCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(inCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in inCurrency && inCurrency.originCurrency) {
          r.push(inCurrency.originCurrency.coinDenom);
        } else {
          r.push(inCurrency.coinDenom);
        }
      }
    }
    if (!outCurrency.coinGeckoId) {
      if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
        r.push(outCurrency.originCurrency.coinDenom);
      } else {
        r.push(outCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(outCurrency.coinGeckoId, "usd");
      if (!price) {
        if ("originCurrency" in outCurrency && outCurrency.originCurrency) {
          r.push(outCurrency.originCurrency.coinDenom);
        } else {
          r.push(outCurrency.coinDenom);
        }
      }
    }

    return r;
  })();
  // --------------------------

  const [isTxLoading, setIsTxLoading] = useState(false);

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

        if (!interactionBlocked) {
          setIsTxLoading(true);

          let tx: MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals;

          const queryRoute = ibcSwapConfigs.amountConfig
            .getQueryIBCSwap()!
            .getQueryRoute();
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
          let routeDurationSeconds: number | undefined;
          let isInterchainSwap: boolean = false;

          // queryRoute는 ibc history를 추적하기 위한 채널 정보 등을 얻기 위해서 사용된다.
          // /msgs_direct로도 얻을 순 있지만 따로 데이터를 해석해야되기 때문에 좀 힘들다...
          // 엄밀히 말하면 각각의 엔드포인트이기 때문에 약간의 시간차 등으로 서로 일치하지 않는 값이 올수도 있다.
          // 근데 현실에서는 그런 일 안 일어날듯 그냥 그런 문제는 무시하고 진행한다.
          // queryRoute.waitFreshResponse(),
          // 인데 사실 ibcSwapConfigs.amountConfig.getTx에서 queryRoute.waitFreshResponse()를 하도록 나중에 바껴서...
          // 굳이 중복할 필요가 없어짐
          try {
            let priorOutAmount: Int | undefined = undefined;
            if (queryRoute.response) {
              priorOutAmount = new Int(queryRoute.response.data.amount_out);
            }

            if (!queryRoute.response) {
              throw new Error("queryRoute.response is undefined");
            }

            // bridge가 필요한 경우와, 아닌 경우를 나눠서 처리
            // swap, transfer 이외의 다른 operation이 있으면 bridge가 사용된다.
            const operations = queryRoute.response.data.operations;
            isInterchainSwap = operations.some(
              (operation) =>
                !("swap" in operation) && !("transfer" in operation)
            );

            // 브릿지를 사용하는 경우, ibc swap channel까지 보여주면 ui가 너무 복잡해질 수 있으므로 (operation이 최소 3개 이상)
            // evm -> osmosis -> destination 식으로 뭉퉁그려서 보여주는 것이 좋다고 판단, 경로를 간소화한다.
            // 문제는 chain_ids에 이미 ibc swap channel이 포함되어 있을 가능성 (아직 확인은 안됨)
            if (isInterchainSwap) {
              routeDurationSeconds =
                queryRoute.response.data.estimated_route_duration_seconds;

              // 일단은 체인 id를 keplr에서 사용하는 형태로 바꿔야 한다.
              for (const chainId of queryRoute.response.data.chain_ids) {
                const isOnlyEvm = parseInt(chainId) > 0;
                const chainIdInKeplr = isOnlyEvm
                  ? `eip155:${chainId}`
                  : chainId;
                if (!chainStore.hasChain(chainIdInKeplr)) {
                  continue;
                }

                const receiverAccount = accountStore.getAccount(chainIdInKeplr);
                if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                  await receiverAccount.init();
                }

                if (isOnlyEvm && !receiverAccount.ethereumHexAddress) {
                  const receiverChainInfo =
                    chainStore.hasChain(chainId) &&
                    chainStore.getChain(chainId);
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

                simpleRoute.push({
                  isOnlyEvm,
                  chainId: chainIdInKeplr,
                  receiver: isOnlyEvm
                    ? receiverAccount.ethereumHexAddress
                    : receiverAccount.bech32Address,
                });
              }
            } else {
              // 브릿지를 사용하지 않는 경우, 자세한 ibc swap channel 정보를 보여준다.
              for (const operation of operations) {
                if ("transfer" in operation) {
                  const queryClientState = queriesStore
                    .get(operation.transfer.chain_id)
                    .cosmos.queryIBCClientState.getClientState(
                      operation.transfer.port,
                      operation.transfer.channel
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
                    portId: operation.transfer.port,
                    channelId: operation.transfer.channel,
                    counterpartyChainId: queryClientState.clientChainId,
                  });
                } else if ("swap" in operation) {
                  const swapIn =
                    operation.swap.swap_in ?? operation.swap.smart_swap_in;
                  if (swapIn) {
                    const swapFeeBpsReceiverAddress = SwapFeeBps.receivers.find(
                      (r) => r.chainId === swapIn.swap_venue.chain_id
                    );
                    if (swapFeeBpsReceiverAddress) {
                      swapFeeBpsReceiver.push(
                        swapFeeBpsReceiverAddress.address
                      );
                    }
                  }
                  swapChannelIndex = channels.length - 1;
                }
              }

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
            }

            const [_tx] = await Promise.all([
              ibcSwapConfigs.amountConfig.getTx(
                uiConfigStore.ibcSwapConfig.slippageNum,
                // 코스모스 스왑은 스왑베뉴가 무조건 하나라고 해서 일단 처음걸 쓰기로 한다.
                swapFeeBpsReceiver[0],
                priorOutAmount
              ),
            ]);

            tx = _tx;
          } catch (e) {
            setCalculatingTxError(e);
            setIsTxLoading(false);
            return;
          }
          setCalculatingTxError(undefined);

          try {
            if ("send" in tx) {
              await tx.send(
                ibcSwapConfigs.feeConfig.toStdFee(),
                ibcSwapConfigs.memoConfig.memo,
                {
                  preferNoSetFee: true,
                  preferNoSetMemo: false,

                  sendTx: async (chainId, tx, mode) => {
                    if (
                      ibcSwapConfigs.amountConfig.type === "transfer" &&
                      !isInterchainSwap
                    ) {
                      const msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                        "ibc-swap/ibc-transfer",
                        chainId,
                        outChainId,
                        tx,
                        mode,
                        false,
                        ibcSwapConfigs.senderConfig.sender,
                        accountStore.getAccount(outChainId).bech32Address,
                        ibcSwapConfigs.amountConfig.amount.map((amount) => {
                          return {
                            amount: DecUtils.getTenExponentN(
                              amount.currency.coinDecimals
                            )
                              .mul(amount.toDec())
                              .toString(),
                            denom: amount.currency.coinMinimalDenom,
                          };
                        }),
                        ibcSwapConfigs.memoConfig.memo,
                        true
                      ).withIBCPacketForwarding(channels, {
                        currencies: chainStore.getChain(chainId).currencies,
                      });
                      return await new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        msg
                      );
                    } else {
                      const msg = new SendTxAndRecordWithIBCSwapMsg(
                        "amount-in",
                        chainId,
                        outChainId,
                        tx,
                        channels,
                        {
                          chainId: outChainId,
                          denom: outCurrency.coinMinimalDenom,
                        },
                        swapChannelIndex,
                        swapReceiver,
                        mode,
                        false,
                        ibcSwapConfigs.senderConfig.sender,
                        ibcSwapConfigs.amountConfig.amount.map((amount) => {
                          return {
                            amount: DecUtils.getTenExponentN(
                              amount.currency.coinDecimals
                            )
                              .mul(amount.toDec())
                              .toString(),
                            denom: amount.currency.coinMinimalDenom,
                          };
                        }),
                        ibcSwapConfigs.memoConfig.memo,
                        {
                          currencies:
                            chainStore.getChain(outChainId).currencies,
                        },
                        !isInterchainSwap // ibc swap이 아닌 interchain swap인 경우, ibc swap history에 추가하는 대신 skip swap history를 추가한다.
                      );

                      return await new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        msg
                      );
                    }
                  },
                },
                {
                  onBroadcasted: (txHash) => {
                    if (isInterchainSwap) {
                      const msg = new RecordTxWithSkipSwapMsg(
                        inChainId,
                        outChainId,
                        {
                          chainId: outChainId,
                          denom: outCurrency.coinMinimalDenom,
                          expectedAmount: ibcSwapConfigs.amountConfig.outAmount
                            .toDec()
                            .toString(),
                        },
                        simpleRoute,
                        ibcSwapConfigs.senderConfig.sender,
                        chainStore.isEvmOnlyChain(outChainId)
                          ? accountStore.getAccount(outChainId)
                              .ethereumHexAddress
                          : accountStore.getAccount(outChainId).bech32Address,
                        [
                          ...ibcSwapConfigs.amountConfig.amount.map(
                            (amount) => {
                              return {
                                amount: DecUtils.getTenExponentN(
                                  amount.currency.coinDecimals
                                )
                                  .mul(amount.toDec())
                                  .toString(),
                                denom: amount.currency.coinMinimalDenom,
                              };
                            }
                          ),
                          {
                            amount: DecUtils.getTenExponentN(
                              ibcSwapConfigs.amountConfig.outAmount.currency
                                .coinDecimals
                            )
                              .mul(
                                ibcSwapConfigs.amountConfig.outAmount.toDec()
                              )
                              .toString(),
                            denom:
                              ibcSwapConfigs.amountConfig.outAmount.currency
                                .coinMinimalDenom,
                          },
                        ],
                        {
                          currencies:
                            chainStore.getChain(outChainId).currencies,
                        },
                        routeDurationSeconds ?? 0,
                        Buffer.from(txHash).toString("hex")
                      );

                      new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        msg
                      );

                      if (
                        !chainStore.isEnabledChain(
                          ibcSwapConfigs.amountConfig.outChainId
                        )
                      ) {
                        chainStore.enableChainInfoInUI(
                          ibcSwapConfigs.amountConfig.outChainId
                        );

                        if (keyRingStore.selectedKeyInfo) {
                          const outChainInfo = chainStore.getChain(
                            ibcSwapConfigs.amountConfig.outChainId
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
                    }

                    const params: Record<
                      string,
                      | number
                      | string
                      | boolean
                      | number[]
                      | string[]
                      | undefined
                    > = {
                      inChainId: inChainId,
                      inChainIdentifier:
                        ChainIdHelper.parse(inChainId).identifier,
                      inCurrencyMinimalDenom: inCurrency.coinMinimalDenom,
                      inCurrencyDenom: inCurrency.coinDenom,
                      inCurrencyCommonMinimalDenom: inCurrency.coinMinimalDenom,
                      inCurrencyCommonDenom: inCurrency.coinDenom,
                      outChainId: outChainId,
                      outChainIdentifier:
                        ChainIdHelper.parse(outChainId).identifier,
                      outCurrencyMinimalDenom: outCurrency.coinMinimalDenom,
                      outCurrencyDenom: outCurrency.coinDenom,
                      outCurrencyCommonMinimalDenom:
                        outCurrency.coinMinimalDenom,
                      outCurrencyCommonDenom: outCurrency.coinDenom,
                      swapType: ibcSwapConfigs.amountConfig.type,
                    };
                    if (
                      "originChainId" in inCurrency &&
                      inCurrency.originChainId
                    ) {
                      const originChainId = inCurrency.originChainId;
                      params["inOriginChainId"] = originChainId;
                      params["inOriginChainIdentifier"] =
                        ChainIdHelper.parse(originChainId).identifier;

                      params["inToDifferentChain"] = true;
                    }
                    if (
                      "originCurrency" in inCurrency &&
                      inCurrency.originCurrency
                    ) {
                      params["inCurrencyCommonMinimalDenom"] =
                        inCurrency.originCurrency.coinMinimalDenom;
                      params["inCurrencyCommonDenom"] =
                        inCurrency.originCurrency.coinDenom;
                    }
                    if (
                      "originChainId" in outCurrency &&
                      outCurrency.originChainId
                    ) {
                      const originChainId = outCurrency.originChainId;
                      params["outOriginChainId"] = originChainId;
                      params["outOriginChainIdentifier"] =
                        ChainIdHelper.parse(originChainId).identifier;

                      params["outToDifferentChain"] = true;
                    }
                    if (
                      "originCurrency" in outCurrency &&
                      outCurrency.originCurrency
                    ) {
                      params["outCurrencyCommonMinimalDenom"] =
                        outCurrency.originCurrency.coinMinimalDenom;
                      params["outCurrencyCommonDenom"] =
                        outCurrency.originCurrency.coinDenom;
                    }
                    params["inRange"] = amountToAmbiguousString(
                      ibcSwapConfigs.amountConfig.amount[0]
                    );
                    params["outRange"] = amountToAmbiguousString(
                      ibcSwapConfigs.amountConfig.outAmount
                    );

                    // UI 상에서 in currency의 가격은 in input에서 표시되고
                    // out currency의 가격은 swap fee에서 표시된다.
                    // price store에서 usd는 무조건 쿼리하므로 in, out currency의 usd는 보장된다.
                    const inCurrencyPrice = priceStore.calculatePrice(
                      ibcSwapConfigs.amountConfig.amount[0],
                      "usd"
                    );
                    if (inCurrencyPrice) {
                      params["inFiatRange"] =
                        amountToAmbiguousString(inCurrencyPrice);
                      params["inFiatAvg"] =
                        amountToAmbiguousAverage(inCurrencyPrice);
                    }
                    const outCurrencyPrice = priceStore.calculatePrice(
                      ibcSwapConfigs.amountConfig.outAmount,
                      "usd"
                    );
                    if (outCurrencyPrice) {
                      params["outFiatRange"] =
                        amountToAmbiguousString(outCurrencyPrice);
                      params["outFiatAvg"] =
                        amountToAmbiguousAverage(outCurrencyPrice);
                    }

                    new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      new LogAnalyticsEventMsg("ibc_swap", params)
                    );

                    analyticsStore.logEvent("swap_occurred", {
                      in_chain_id: inChainId,
                      in_chain_identifier:
                        ChainIdHelper.parse(inChainId).identifier,
                      in_currency_minimal_denom: inCurrency.coinMinimalDenom,
                      in_currency_denom: inCurrency.coinDenom,
                      out_chain_id: outChainId,
                      out_chain_identifier:
                        ChainIdHelper.parse(outChainId).identifier,
                      out_currency_minimal_denom: outCurrency.coinMinimalDenom,
                      out_currency_denom: outCurrency.coinDenom,
                    });

                    navigate("/", {
                      replace: true,
                    });
                  },
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
            } else {
              const ethereumAccount = ethereumAccountStore.getAccount(
                ibcSwapConfigs.amountConfig.chainId
              );

              const sender = ibcSwapConfigs.senderConfig.sender;

              const isErc20InCurrency =
                ("type" in inCurrency && inCurrency.type === "erc20") ||
                inCurrency.coinMinimalDenom.startsWith("erc20:");
              const erc20Approval = tx.requiredErc20Approvals?.[0];
              const erc20ApprovalTx =
                erc20Approval && isErc20InCurrency
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

              const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
                ibcSwapConfigs.feeConfig.getEIP1559TxFees(
                  ibcSwapConfigs.feeConfig.type
                );

              const feeObject =
                maxFeePerGas && maxPriorityFeePerGas
                  ? {
                      type: 2,
                      maxFeePerGas: `0x${BigInt(
                        maxFeePerGas.truncate().toString()
                      ).toString(16)}`,
                      maxPriorityFeePerGas: `0x${BigInt(
                        maxPriorityFeePerGas.truncate().toString()
                      ).toString(16)}`,
                      gasLimit: `0x${ibcSwapConfigs.gasConfig.gas.toString(
                        16
                      )}`,
                    }
                  : {
                      gasPrice: `0x${BigInt(
                        gasPrice.truncate().toString()
                      ).toString(16)}`,
                      gasLimit: `0x${ibcSwapConfigs.gasConfig.gas.toString(
                        16
                      )}`,
                    };

              ethereumAccount.setIsSendingTx(true);

              await ethereumAccount.sendEthereumTx(
                sender,
                {
                  ...(erc20ApprovalTx ?? tx),
                  ...feeObject,
                },
                {
                  onBroadcasted: (txHash) => {
                    if (!erc20ApprovalTx) {
                      ethereumAccount.setIsSendingTx(false);

                      const msg = new RecordTxWithSkipSwapMsg(
                        inChainId,
                        outChainId,
                        {
                          chainId: outChainId,
                          denom: outCurrency.coinMinimalDenom,
                          expectedAmount: ibcSwapConfigs.amountConfig.outAmount
                            .toDec()
                            .toString(),
                        },
                        simpleRoute,
                        sender,
                        chainStore.isEvmOnlyChain(outChainId)
                          ? accountStore.getAccount(outChainId)
                              .ethereumHexAddress
                          : accountStore.getAccount(outChainId).bech32Address,
                        [
                          ...ibcSwapConfigs.amountConfig.amount.map(
                            (amount) => {
                              return {
                                amount: DecUtils.getTenExponentN(
                                  amount.currency.coinDecimals
                                )
                                  .mul(amount.toDec())
                                  .toString(),
                                denom: amount.currency.coinMinimalDenom,
                              };
                            }
                          ),
                          {
                            amount: DecUtils.getTenExponentN(
                              ibcSwapConfigs.amountConfig.outAmount.currency
                                .coinDecimals
                            )
                              .mul(
                                ibcSwapConfigs.amountConfig.outAmount.toDec()
                              )
                              .toString(),
                            denom:
                              ibcSwapConfigs.amountConfig.outAmount.currency
                                .coinMinimalDenom,
                          },
                        ],
                        {
                          currencies:
                            chainStore.getChain(outChainId).currencies,
                        },
                        routeDurationSeconds ?? 0,
                        txHash
                      );

                      new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        msg
                      );

                      navigate("/", {
                        replace: true,
                      });
                    }
                  },
                  onFulfill: (txReceipt) => {
                    const queryBalances = queriesStore.get(
                      ibcSwapConfigs.amountConfig.chainId
                    ).queryBalances;
                    queryBalances
                      .getQueryEthereumHexAddress(sender)
                      .balances.forEach((balance) => {
                        if (
                          balance.currency.coinMinimalDenom ===
                            ibcSwapConfigs.amountConfig.currency
                              .coinMinimalDenom ||
                          ibcSwapConfigs.feeConfig.fees.some(
                            (fee) =>
                              fee.currency.coinMinimalDenom ===
                              balance.currency.coinMinimalDenom
                          )
                        ) {
                          balance.fetch();
                        }
                      });

                    if (txReceipt.status === EthTxStatus.Success) {
                      notification.show(
                        "success",
                        intl.formatMessage({
                          id: "notification.transaction-success",
                        }),
                        ""
                      );

                      if (erc20ApprovalTx) {
                        delete (tx as UnsignedEVMTransactionWithErc20Approvals)
                          .requiredErc20Approvals;
                        ethereumAccount.setIsSendingTx(true);
                        ethereumAccount
                          .simulateGas(sender, tx as UnsignedEVMTransaction)
                          .then(({ gasUsed }) => {
                            const {
                              maxFeePerGas,
                              maxPriorityFeePerGas,
                              gasPrice,
                            } = ibcSwapConfigs.feeConfig.getEIP1559TxFees(
                              ibcSwapConfigs.feeConfig.type
                            );

                            const feeObject =
                              maxFeePerGas && maxPriorityFeePerGas
                                ? {
                                    type: 2,
                                    maxFeePerGas: `0x${BigInt(
                                      maxFeePerGas.truncate().toString()
                                    ).toString(16)}`,
                                    maxPriorityFeePerGas: `0x${BigInt(
                                      maxPriorityFeePerGas.truncate().toString()
                                    ).toString(16)}`,
                                    gasLimit: `0x${gasUsed.toString(16)}`,
                                  }
                                : {
                                    gasPrice: `0x${BigInt(
                                      gasPrice.truncate().toString()
                                    ).toString(16)}`,
                                    gasLimit: `0x${gasUsed.toString(16)}`,
                                  };

                            ethereumAccount.sendEthereumTx(
                              sender,
                              {
                                ...(tx as UnsignedEVMTransactionWithErc20Approvals),
                                ...feeObject,
                              },
                              {
                                onBroadcasted: (txHash) => {
                                  ethereumAccount.setIsSendingTx(false);

                                  const msg = new RecordTxWithSkipSwapMsg(
                                    inChainId,
                                    outChainId,
                                    {
                                      chainId: outChainId,
                                      denom: outCurrency.coinMinimalDenom,
                                      expectedAmount:
                                        ibcSwapConfigs.amountConfig.outAmount
                                          .toDec()
                                          .toString(),
                                    },
                                    simpleRoute,
                                    sender,
                                    chainStore.isEvmOnlyChain(outChainId)
                                      ? accountStore.getAccount(outChainId)
                                          .ethereumHexAddress
                                      : accountStore.getAccount(outChainId)
                                          .bech32Address,
                                    [
                                      ...ibcSwapConfigs.amountConfig.amount.map(
                                        (amount) => {
                                          return {
                                            amount: DecUtils.getTenExponentN(
                                              amount.currency.coinDecimals
                                            )
                                              .mul(amount.toDec())
                                              .toString(),
                                            denom:
                                              amount.currency.coinMinimalDenom,
                                          };
                                        }
                                      ),
                                      {
                                        amount: DecUtils.getTenExponentN(
                                          ibcSwapConfigs.amountConfig.outAmount
                                            .currency.coinDecimals
                                        )
                                          .mul(
                                            ibcSwapConfigs.amountConfig.outAmount.toDec()
                                          )
                                          .toString(),
                                        denom:
                                          ibcSwapConfigs.amountConfig.outAmount
                                            .currency.coinMinimalDenom,
                                      },
                                    ],
                                    {
                                      currencies:
                                        chainStore.getChain(outChainId)
                                          .currencies,
                                    },
                                    routeDurationSeconds ?? 0,
                                    txHash
                                  );

                                  new InExtensionMessageRequester().sendMessage(
                                    BACKGROUND_PORT,
                                    msg
                                  );

                                  navigate("/", {
                                    replace: true,
                                  });
                                },
                                onFulfill: (txReceipt) => {
                                  const queryBalances = queriesStore.get(
                                    ibcSwapConfigs.amountConfig.chainId
                                  ).queryBalances;
                                  queryBalances
                                    .getQueryEthereumHexAddress(sender)
                                    .balances.forEach((balance) => {
                                      if (
                                        balance.currency.coinMinimalDenom ===
                                          ibcSwapConfigs.amountConfig.currency
                                            .coinMinimalDenom ||
                                        ibcSwapConfigs.feeConfig.fees.some(
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
                                    notification.show(
                                      "success",
                                      intl.formatMessage({
                                        id: "notification.transaction-success",
                                      }),
                                      ""
                                    );
                                  } else {
                                    notification.show(
                                      "failed",
                                      intl.formatMessage({
                                        id: "error.transaction-failed",
                                      }),
                                      ""
                                    );
                                  }
                                },
                              }
                            );
                          })
                          .catch((e) => {
                            console.log(e);
                            ethereumAccount.setIsSendingTx(false);
                          });
                      }
                    } else {
                      notification.show(
                        "failed",
                        intl.formatMessage({ id: "error.transaction-failed" }),
                        ""
                      );
                    }
                  },
                }
              );
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
            setIsTxLoading(false);
          }
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

            <Gutter size="0.5rem" />

            <Caption2
              color={ColorPalette["gray-300"]}
              style={{
                fontSize: "0.75rem",
              }}
            >
              Powered by Skip API
            </Caption2>

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

                const chainId = ibcSwapConfigs.amountConfig.chainId;
                const currency = ibcSwapConfigs.amountConfig.currency;
                const outChainId = ibcSwapConfigs.amountConfig.outChainId;
                const outCurrency = ibcSwapConfigs.amountConfig.outCurrency;

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
                      ibcSwapConfigs.amountConfig.outAmount
                        .toDec()
                        .gt(new Dec(0))
                    ) {
                      prev.set(
                        "tempSwitchAmount",
                        ibcSwapConfigs.amountConfig.outAmount
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
          senderConfig={ibcSwapConfigs.senderConfig}
          amountConfig={ibcSwapConfigs.amountConfig}
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
        <SwapFeeInfo
          senderConfig={ibcSwapConfigs.senderConfig}
          amountConfig={ibcSwapConfigs.amountConfig}
          gasConfig={ibcSwapConfigs.gasConfig}
          feeConfig={ibcSwapConfigs.feeConfig}
          gasSimulator={gasSimulator}
          isForEVMTx={isInChainEVMOnly}
        />

        <WarningGuideBox
          amountConfig={ibcSwapConfigs.amountConfig}
          title={
            isHighPriceImpact &&
            !calculatingTxError &&
            !ibcSwapConfigs.amountConfig.uiProperties.error &&
            !ibcSwapConfigs.amountConfig.uiProperties.warning
              ? (() => {
                  const inPrice = priceStore.calculatePrice(
                    ibcSwapConfigs.amountConfig.amount[0],
                    "usd"
                  );
                  const outPrice = priceStore.calculatePrice(
                    ibcSwapConfigs.amountConfig.outAmount,
                    "usd"
                  );
                  return intl.formatMessage(
                    {
                      id: "page.ibc-swap.warning.high-price-impact-title",
                    },
                    {
                      inPrice: inPrice?.toString(),
                      srcChain: ibcSwapConfigs.amountConfig.chainInfo.chainName,
                      outPrice: outPrice?.toString(),
                      dstChain: chainStore.getChain(
                        ibcSwapConfigs.amountConfig.outChainId
                      ).chainName,
                    }
                  );
                })()
              : undefined
          }
          forceError={calculatingTxError}
          forceWarning={(() => {
            if (unablesToPopulatePrice.length > 0) {
              return new Error(
                intl.formatMessage(
                  {
                    id: "page.ibc-swap.warning.unable-to-populate-price",
                  },
                  {
                    assets: unablesToPopulatePrice.join(", "),
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

        <Gutter size="0.75rem" />

        <Button
          type="submit"
          disabled={interactionBlocked}
          text={intl.formatMessage({
            id: "page.ibc-swap.button.next",
          })}
          color="primary"
          size="large"
          isLoading={
            isTxLoading ||
            accountStore.getAccount(inChainId).isSendingMsg === "ibc-swap"
          }
        />

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
  amountConfig: IBCSwapAmountConfig;

  forceError?: Error;
  forceWarning?: Error;
  title?: string;
}> = observer(({ amountConfig, forceError, forceWarning, title }) => {
  const error: string | undefined = (() => {
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

    const queryError = amountConfig.getQueryIBCSwap()?.getQueryRoute()?.error;
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

  const intl = useIntl();

  const errorText = (() => {
    const err = error || lastError;

    if (err && err === "could not find a path to execute the requested swap") {
      return intl.formatMessage({
        id: "page.ibc-swap.error.no-route-found",
      });
    }

    return err;
  })();

  return (
    <React.Fragment>
      {/* 별 차이는 없기는한데 gutter와 실제 컴포넌트의 트랜지션을 분리하는게 아주 약간 더 자연스러움 */}
      <VerticalCollapseTransition collapsed={collapsed}>
        <Gutter size="0.75rem" />
      </VerticalCollapseTransition>
      <VerticalCollapseTransition collapsed={collapsed}>
        <GuideBox
          color="warning"
          title={title || errorText}
          paragraph={title ? errorText : undefined}
          hideInformationIcon={!title}
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
