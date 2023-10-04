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
import { FormattedMessage, useIntl } from "react-intl";
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
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { MakeTxResponse, WalletStatus } from "@keplr-wallet/stores";
import { autorun } from "mobx";
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordWithIBCSwapMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const IBCSwapPage: FunctionComponent = observer(() => {
  const {
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    uiConfigStore,
    keyRingStore,
    hugeQueriesStore,
    priceStore,
  } = useStore();

  useLayoutEffect(() => {
    // 더 이상 new feature 소개가 안뜨도록 만든다.
    uiConfigStore.setNeedShowIBCSwapFeatureAdded(false);
  }, [uiConfigStore]);

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
    200000,
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
    (() => {
      // simulation 할때 예상되는 gas에 따라서 밑의 값을 설정해야한다.
      // 근데 이걸 엄밀히 정하기는 어렵다
      // 추정을해보면 당연히 destination token에 따라서 값이 다를 수 있다.
      // 또한 트랜잭션이 ibc transfer인지 cosmwasm execute인지에 따라서 다를 수 있다.
      // ibc transfer일 경우는 차이는 memo의 길이일 뿐인데 이건 gas에 그다지 영향을 미치지 않기 때문에 gas adjustment로 충분하다.
      // swap일 경우 (osmosis에서 실행될 경우) swpa이 몇번 필요한지에 따라 영향을 미칠 것이다.
      let type = "default";

      // swap일 경우 웬만하면 swap 한번으로 충분할 확률이 높다.
      // 이 가정에 따라서 첫로드시에 gas를 restore하기 위해서 오스모시스 위에서 발생할 경우
      // 일단 swap-1로 설정한다.
      if (
        ibcSwapConfigs.amountConfig.chainInfo.chainIdentifier ===
        chainStore.getChain(skipQueriesStore.queryIBCSwap.swapVenue.chainId)
          .chainIdentifier
      ) {
        type = `swap-1`;
      }

      const queryRoute = ibcSwapConfigs.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();
      if (queryRoute && queryRoute.response) {
        if (queryRoute.response.data.operations.length > 0) {
          const firstOperation = queryRoute.response.data.operations[0];
          if ("swap" in firstOperation) {
            if ("swap_in" in firstOperation.swap) {
              type = `swap-${firstOperation.swap.swap_in.swap_operations.length}`;
            }
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
      noop(skipQueriesStore.queryIBCSwap.swapCurrenciesMap);
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

  const [isTxLoading, setIsTxLoading] = useState(false);

  return (
    <MainHeaderLayout
      additionalPaddingBottom={BottomTabsHeightRem}
      bottomButton={{
        disabled: interactionBlocked,
        text: intl.formatMessage({
          id: "page.ibc-swap.button.next",
        }),
        color: "primary",
        size: "large",
        isLoading:
          isTxLoading ||
          accountStore.getAccount(inChainId).isSendingMsg === "ibc-swap",
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
          setIsTxLoading(true);

          let tx: MakeTxResponse;

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

          try {
            const [_tx] = await Promise.all([
              ibcSwapConfigs.amountConfig.getTx(
                uiConfigStore.ibcSwapConfig.slippageNum,
                SwapFeeBps.receiver
              ),
              // queryRoute는 ibc history를 추적하기 위한 채널 정보 등을 얻기 위해서 사용된다.
              // /msgs_direct로도 얻을 순 있지만 따로 데이터를 해석해야되기 때문에 좀 힘들다...
              // 엄밀히 말하면 각각의 엔드포인트이기 때문에 약간의 시간차 등으로 서로 일치하지 않는 값이 올수도 있다.
              // 근데 현실에서는 그런 일 안 일어날듯 그냥 그런 문제는 무시하고 진행한다.
              queryRoute.waitFreshResponse(),
            ]);

            if (!queryRoute.response) {
              throw new Error("queryRoute.response is undefined");
            }
            for (const operation of queryRoute.response.data.operations) {
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
                swapChannelIndex = channels.length - 1;
              }
            }

            const receiverChainIds = [inChainId];
            for (const channel of channels) {
              receiverChainIds.push(channel.counterpartyChainId);
            }
            for (const receiverChainId of receiverChainIds) {
              const receiverAccount = accountStore.getAccount(receiverChainId);
              if (receiverAccount.walletStatus !== WalletStatus.Loaded) {
                await receiverAccount.init();
              }
              if (!receiverAccount.bech32Address) {
                throw new Error("receiverAccount.bech32Address is undefined");
              }
              swapReceiver.push(receiverAccount.bech32Address);
            }

            tx = _tx;
          } catch (e) {
            setCalculatingTxError(e);
            setIsTxLoading(false);
            return;
          }
          setCalculatingTxError(undefined);

          try {
            await tx.send(
              ibcSwapConfigs.feeConfig.toStdFee(),
              ibcSwapConfigs.memoConfig.memo,
              {
                preferNoSetFee: true,
                preferNoSetMemo: false,

                sendTx: async (chainId, tx, mode) => {
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
                    ibcSwapConfigs.memoConfig.memo
                  );

                  return await new InExtensionMessageRequester().sendMessage(
                    BACKGROUND_PORT,
                    msg
                  );
                },
              },
              {
                onBroadcasted: () => {
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

                  const params: Record<
                    string,
                    number | string | boolean | number[] | string[] | undefined
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
                    outCurrencyCommonMinimalDenom: outCurrency.coinMinimalDenom,
                    outCurrencyCommonDenom: outCurrency.coinDenom,
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
                  const getSwapRangeStr = (amount: { toDec: () => Dec }) => {
                    const swapRanges = [
                      1, 10, 100, 1000, 10000, 100000, 1000000, 10000000,
                      100000000, 1000000000,
                    ];
                    let res = "unknown";
                    for (let i = 0; i < swapRanges.length; i++) {
                      const range = swapRanges[i];
                      const beforeRange = i > 0 ? swapRanges[i - 1] : 0;
                      if (
                        amount.toDec().lte(new Dec(range)) &&
                        amount.toDec().gt(new Dec(beforeRange))
                      ) {
                        res = `${beforeRange}~${range}`;
                        break;
                      }

                      if (i === swapRanges.length - 1) {
                        res = `${range}~`;
                      }
                    }
                    return res;
                  };
                  params["inRange"] = getSwapRangeStr(
                    ibcSwapConfigs.amountConfig.amount[0]
                  );
                  params["outRange"] = getSwapRangeStr(
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
                    params["inFiatRange"] = getSwapRangeStr(inCurrencyPrice);
                  }
                  const outCurrencyPrice = priceStore.calculatePrice(
                    ibcSwapConfigs.amountConfig.outAmount,
                    "usd"
                  );
                  if (outCurrencyPrice) {
                    params["outFiatRange"] = getSwapRangeStr(outCurrencyPrice);
                  }

                  new InExtensionMessageRequester().sendMessage(
                    BACKGROUND_PORT,
                    new LogAnalyticsEventMsg("ibc_swap", params)
                  );
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
        />

        <WarningGuideBox
          amountConfig={ibcSwapConfigs.amountConfig}
          forceError={calculatingTxError}
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

const WarningGuideBox: FunctionComponent<{
  amountConfig: IBCSwapAmountConfig;

  forceError?: Error;
}> = observer(({ amountConfig, forceError }) => {
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

  return (
    <React.Fragment>
      {/* 별 차이는 없기는한데 gutter와 실제 컴포넌트의 트랜지션을 분리하는게 아주 약간 더 자연스러움 */}
      <VerticalCollapseTransition collapsed={collapsed}>
        <Gutter size="0.75rem" />
      </VerticalCollapseTransition>
      <VerticalCollapseTransition collapsed={collapsed}>
        <GuideBox
          color="warning"
          title={(() => {
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
          })()}
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
