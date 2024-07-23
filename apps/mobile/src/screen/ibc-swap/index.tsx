import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {PageWithScrollView} from '../../components/page';
import {useStyle} from '../../styles';
import {XAxis, YAxis} from '../../components/axis';
import {Linking, Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {SettingIcon} from '../../components/icon';
import {IconButton} from '../../components/icon-button';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {SwapAssetInfo} from './components/swap-asset-info';
import {IconProps} from '../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';
import {SwapFeeInfo} from './components/swap-fee-info';
import {WarningGuideBox} from './components/warning-guide-box';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../navigation.tsx';
import {SlippageModal} from './components/slippage-modal';
import {useIBCSwapConfig} from '@keplr-wallet/hooks-internal';
import {useStore} from '../../stores';
import {SwapFeeBps, TermsOfUseUrl} from '../../config.ui.ts';
import {useGasSimulator, useTxConfigsValidate} from '@keplr-wallet/hooks';
import {AsyncKVStore} from '../../common';
import {autorun} from 'mobx';
import {useEffectOnce} from '../../hooks';
import {useTxConfigsQueryString} from '../../hooks/use-tx-config-query-string.ts';
import {Dec, DecUtils, Int} from '@keplr-wallet/unit';
import {MakeTxResponse, WalletStatus} from '@keplr-wallet/stores';
import {BACKGROUND_PORT, Message} from '@keplr-wallet/router';
import {
  LogAnalyticsEventMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCSwapMsg,
} from '@keplr-wallet/background';
import {RNMessageRequesterInternal} from '../../router';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {amountToAmbiguousAverage, amountToAmbiguousString} from '../../utils';
import {useNotification} from '../../hooks/notification';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const IBCSwapScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const notification = useNotification();

  const {
    chainStore,
    queriesStore,
    accountStore,
    skipQueriesStore,
    uiConfigStore,
    priceStore,
    hugeQueriesStore,
    keyRingStore,
  } = useStore();

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false);

  const navigation = useNavigation<StackNavProp>();

  const route = useRoute<RouteProp<RootStackParamList, 'Swap'>>();
  const searchParamsChainId = route.params?.chainId;
  const searchParamsCoinMinimalDenom = route.params?.coinMinimalDenom;
  const searchParamsOutChainId = route.params?.outChainId;
  const searchParamsOutCoinMinimalDenom = route.params?.outCoinMinimalDenom;

  const inChainId = (() => {
    if (searchParamsChainId) {
      uiConfigStore.ibcSwapConfig.setAmountInChainId(searchParamsChainId);
    }
    return uiConfigStore.ibcSwapConfig.getAmountInChainInfo().chainId;
  })();
  const inCurrency = (() => {
    if (searchParamsCoinMinimalDenom) {
      uiConfigStore.ibcSwapConfig.setAmountInMinimalDenom(
        searchParamsCoinMinimalDenom,
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
        searchParamsOutCoinMinimalDenom,
      );
    }
    return uiConfigStore.ibcSwapConfig.getAmountOutCurrency();
  })();

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
    SwapFeeBps.value,
  );

  ibcSwapConfigs.amountConfig.setCurrency(inCurrency);

  const gasSimulator = useGasSimulator(
    new AsyncKVStore('gas-simulator.screen.ibc-swap/swap'),
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
      let type = 'default';

      // swap일 경우 웬만하면 swap 한번으로 충분할 확률이 높다.
      // 이 가정에 따라서 첫로드시에 gas를 restore하기 위해서 오스모시스 위에서 발생할 경우
      // 일단 swap-1로 설정한다.
      if (
        ibcSwapConfigs.amountConfig.chainInfo.chainIdentifier ===
        chainStore.getChain(skipQueriesStore.queryIBCSwap.swapVenue.chainId)
          .chainIdentifier
      ) {
        type = 'swap-1';
      }

      const queryRoute = ibcSwapConfigs.amountConfig
        .getQueryIBCSwap()
        ?.getQueryRoute();
      if (queryRoute && queryRoute.response) {
        if (queryRoute.response.data.operations.length > 0) {
          const firstOperation = queryRoute.response.data.operations[0];
          if ('swap' in firstOperation) {
            if ('swap_in' in firstOperation.swap) {
              type = `swap-${firstOperation.swap.swap_in.swap_operations.length}`;
            }
          }
        }
      }

      return `${ibcSwapConfigs.amountConfig.outChainId}/${ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom}/${type}`;
    })(),
    () => {
      if (!ibcSwapConfigs.amountConfig.currency) {
        throw new Error('Send currency not set');
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        ibcSwapConfigs.amountConfig.uiProperties.loadingState ===
          'loading-block' ||
        ibcSwapConfigs.amountConfig.uiProperties.error != null
      ) {
        throw new Error('Not ready to simulate tx');
      }

      const tx = ibcSwapConfigs.amountConfig.getTxIfReady(
        // simulation 자체는 쉽게 통과시키기 위해서 슬리피지를 50으로 설정한다.
        50,
        SwapFeeBps.receiver,
      );
      if (!tx) {
        throw new Error('Not ready to simulate tx');
      }

      return tx;
    },
  );

  const txConfigsValidate = useTxConfigsValidate({
    ...ibcSwapConfigs,
    gasSimulator,
  });

  useTxConfigsQueryString(inChainId, {
    ...ibcSwapConfigs,
    gasSimulator,
  });

  useEffect(() => {
    navigation.setParams({
      outChainId: ibcSwapConfigs.amountConfig.outChainId
        ? ibcSwapConfigs.amountConfig.outChainId
        : undefined,
      outCoinMinimalDenom: ibcSwapConfigs.amountConfig.outCurrency
        .coinMinimalDenom
        ? ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom
        : undefined,
    });
  }, [
    navigation,
    ibcSwapConfigs.amountConfig.outChainId,
    ibcSwapConfigs.amountConfig.outCurrency.coinMinimalDenom,
  ]);

  const tempSwitchAmount = route.params?.tempSwitchAmount;
  useEffect(() => {
    if (tempSwitchAmount) {
      ibcSwapConfigs.amountConfig.setValue(tempSwitchAmount);
      navigation.setParams({
        tempSwitchAmount: undefined,
      });
    }
  }, [navigation, ibcSwapConfigs.amountConfig, tempSwitchAmount]);

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
          ibcSwapConfigs.amountConfig.outCurrency,
        ),
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
        const inPrice = priceStore.calculatePrice(amt, 'usd');
        const outPrice = priceStore.calculatePrice(
          ibcSwapConfigs.amountConfig.outAmount,
          'usd',
        );
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
  }, [inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom]);
  const unablesToPopulatePrice = (() => {
    const r: string[] = [];
    if (!inCurrency.coinGeckoId) {
      if ('originCurrency' in inCurrency && inCurrency.originCurrency) {
        r.push(inCurrency.originCurrency.coinDenom);
      } else {
        r.push(inCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(inCurrency.coinGeckoId, 'usd');
      if (!price) {
        if ('originCurrency' in inCurrency && inCurrency.originCurrency) {
          r.push(inCurrency.originCurrency.coinDenom);
        } else {
          r.push(inCurrency.coinDenom);
        }
      }
    }
    if (!outCurrency.coinGeckoId) {
      if ('originCurrency' in outCurrency && outCurrency.originCurrency) {
        r.push(outCurrency.originCurrency.coinDenom);
      } else {
        r.push(outCurrency.coinDenom);
      }
    } else if (!inOrOutChangedDelay) {
      const price = priceStore.getPrice(outCurrency.coinGeckoId, 'usd');
      if (!price) {
        if ('originCurrency' in outCurrency && outCurrency.originCurrency) {
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
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['padding-x-12', 'padding-y-8'])}>
      <Box paddingX={6} paddingY={7}>
        <XAxis alignY="center">
          <Text style={style.flatten(['h4', 'color-text-high'])}>
            <FormattedMessage id="page.ibc-swap.title.swap" />
          </Text>

          <Gutter size={8} />

          <Text style={style.flatten(['text-caption2', 'color-text-low'])}>
            Powered by Skip API
          </Text>

          <Box style={{flex: 1}} />

          <IconButton
            onPress={() => setIsSlippageModalOpen(true)}
            icon={
              <SettingIcon size={24} color={style.get('color-gray-10').color} />
            }
          />
        </XAxis>
      </Box>

      <Gutter size={12} />

      <SwapAssetInfo
        type="from"
        senderConfig={ibcSwapConfigs.senderConfig}
        amountConfig={ibcSwapConfigs.amountConfig}
      />

      <Box paddingY={6} alignX="center" alignY="center" zIndex={10}>
        <Box
          position="absolute"
          padding={6}
          borderRadius={999}
          backgroundColor={style.get('color-gray-500').color}
          style={{top: -12}}>
          <TouchableWithoutFeedback
            onPress={() => {
              const chainId = ibcSwapConfigs.amountConfig.chainId;
              const currency = ibcSwapConfigs.amountConfig.currency;
              const outChainId = ibcSwapConfigs.amountConfig.outChainId;
              const outCurrency = ibcSwapConfigs.amountConfig.outCurrency;

              navigation.setParams({
                chainId: outChainId,
                coinMinimalDenom: outCurrency.coinMinimalDenom,
                outChainId: chainId,
                outCoinMinimalDenom: currency.coinMinimalDenom,
                tempSwitchAmount: ibcSwapConfigs.amountConfig.outAmount
                  .toDec()
                  .gt(new Dec(0))
                  ? ibcSwapConfigs.amountConfig.outAmount
                      .hideDenom(true)
                      .locale(false)
                      .inequalitySymbol(false)
                      .toString()
                  : '',
              });
            }}>
            <ArrowsUpDownIcon
              size={24}
              color={style.get('color-gray-10').color}
            />
          </TouchableWithoutFeedback>
        </Box>
      </Box>

      <SwapAssetInfo
        type="to"
        senderConfig={ibcSwapConfigs.senderConfig}
        amountConfig={ibcSwapConfigs.amountConfig}
        onDestinationChainSelect={(chainId, coinMinimalDenom) => {
          navigation.setParams({
            outChainId: chainId,
            outCoinMinimalDenom: coinMinimalDenom,
          });
        }}
      />

      <Gutter size={12} />

      <SwapFeeInfo
        senderConfig={ibcSwapConfigs.senderConfig}
        amountConfig={ibcSwapConfigs.amountConfig}
        gasConfig={ibcSwapConfigs.gasConfig}
        feeConfig={ibcSwapConfigs.feeConfig}
        gasSimulator={gasSimulator}
      />

      <Gutter size={12} />

      <WarningGuideBox
        amountConfig={ibcSwapConfigs.amountConfig}
        forceError={calculatingTxError}
        forceWarning={(() => {
          if (unablesToPopulatePrice.length > 0) {
            return new Error(
              intl.formatMessage(
                {
                  id: 'page.ibc-swap.warning.unable-to-populate-price',
                },
                {
                  assets: unablesToPopulatePrice.join(', '),
                },
              ),
            );
          }

          if (isHighPriceImpact) {
            return new Error(
              intl.formatMessage({
                id: 'page.ibc-swap.warning.high-price-impact',
              }),
            );
          }
        })()}
      />

      <Gutter size={12} />

      <Button
        size="large"
        text={intl.formatMessage({id: 'page.ibc-swap.button.next'})}
        disabled={interactionBlocked}
        loading={
          isTxLoading ||
          accountStore.getAccount(inChainId).isSendingMsg === 'ibc-swap'
        }
        onPress={async () => {
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
              let priorOutAmount: Int | undefined;
              if (queryRoute.response) {
                priorOutAmount = new Int(queryRoute.response.data.amount_out);
              }

              const [_tx] = await Promise.all([
                ibcSwapConfigs.amountConfig.getTx(
                  uiConfigStore.ibcSwapConfig.slippageNum,
                  SwapFeeBps.receiver,
                  priorOutAmount,
                ),
                // queryRoute는 ibc history를 추적하기 위한 채널 정보 등을 얻기 위해서 사용된다.
                // /msgs_direct로도 얻을 순 있지만 따로 데이터를 해석해야되기 때문에 좀 힘들다...
                // 엄밀히 말하면 각각의 엔드포인트이기 때문에 약간의 시간차 등으로 서로 일치하지 않는 값이 올수도 있다.
                // 근데 현실에서는 그런 일 안 일어날듯 그냥 그런 문제는 무시하고 진행한다.
                // queryRoute.waitFreshResponse(),
                // 인데 사실 ibcSwapConfigs.amountConfig.getTx에서 queryRoute.waitFreshResponse()를 하도록 나중에 바껴서...
                // 굳이 중복할 필요가 없어짐
              ]);

              if (!queryRoute.response) {
                throw new Error('queryRoute.response is undefined');
              }
              for (const operation of queryRoute.response.data.operations) {
                if ('transfer' in operation) {
                  const queryClientState = queriesStore
                    .get(operation.transfer.chain_id)
                    .cosmos.queryIBCClientState.getClientState(
                      operation.transfer.port,
                      operation.transfer.channel,
                    );

                  await queryClientState.waitResponse();
                  if (!queryClientState.response) {
                    throw new Error('queryClientState.response is undefined');
                  }
                  if (!queryClientState.clientChainId) {
                    throw new Error(
                      'queryClientState.clientChainId is undefined',
                    );
                  }

                  channels.push({
                    portId: operation.transfer.port,
                    channelId: operation.transfer.channel,
                    counterpartyChainId: queryClientState.clientChainId,
                  });
                } else if ('swap' in operation) {
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
                  throw new Error('receiverAccount.bech32Address is undefined');
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
                    if (ibcSwapConfigs.amountConfig.type === 'transfer') {
                      const msg: Message<Uint8Array> = new SendTxAndRecordMsg(
                        'ibc-swap/ibc-transfer',
                        chainId,
                        outChainId,
                        tx,
                        mode,
                        false,
                        ibcSwapConfigs.senderConfig.sender,
                        accountStore.getAccount(outChainId).bech32Address,
                        ibcSwapConfigs.amountConfig.amount.map(amount => {
                          return {
                            amount: DecUtils.getTenExponentN(
                              amount.currency.coinDecimals,
                            )
                              .mul(amount.toDec())
                              .toString(),
                            denom: amount.currency.coinMinimalDenom,
                          };
                        }),
                        ibcSwapConfigs.memoConfig.memo,
                      ).withIBCPacketForwarding(channels, {
                        currencies: chainStore.getChain(chainId).currencies,
                      });
                      return await new RNMessageRequesterInternal().sendMessage(
                        BACKGROUND_PORT,
                        msg,
                      );
                    } else {
                      const msg = new SendTxAndRecordWithIBCSwapMsg(
                        'amount-in',
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
                        ibcSwapConfigs.amountConfig.amount.map(amount => {
                          return {
                            amount: DecUtils.getTenExponentN(
                              amount.currency.coinDecimals,
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
                      );

                      return await new RNMessageRequesterInternal().sendMessage(
                        BACKGROUND_PORT,
                        msg,
                      );
                    }
                  },
                },
                {
                  onBroadcasted: () => {
                    if (
                      !chainStore.isEnabledChain(
                        ibcSwapConfigs.amountConfig.outChainId,
                      )
                    ) {
                      chainStore.enableChainInfoInUI(
                        ibcSwapConfigs.amountConfig.outChainId,
                      );

                      if (keyRingStore.selectedKeyInfo) {
                        const outChainInfo = chainStore.getChain(
                          ibcSwapConfigs.amountConfig.outChainId,
                        );
                        if (
                          keyRingStore.needKeyCoinTypeFinalize(
                            keyRingStore.selectedKeyInfo.id,
                            outChainInfo,
                          )
                        ) {
                          keyRingStore.finalizeKeyCoinType(
                            keyRingStore.selectedKeyInfo.id,
                            outChainInfo.chainId,
                            outChainInfo.bip44.coinType,
                          );
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
                      'originChainId' in inCurrency &&
                      inCurrency.originChainId
                    ) {
                      const originChainId = inCurrency.originChainId;
                      params['inOriginChainId'] = originChainId;
                      params['inOriginChainIdentifier'] =
                        ChainIdHelper.parse(originChainId).identifier;

                      params['inToDifferentChain'] = true;
                    }
                    if (
                      'originCurrency' in inCurrency &&
                      inCurrency.originCurrency
                    ) {
                      params['inCurrencyCommonMinimalDenom'] =
                        inCurrency.originCurrency.coinMinimalDenom;
                      params['inCurrencyCommonDenom'] =
                        inCurrency.originCurrency.coinDenom;
                    }
                    if (
                      'originChainId' in outCurrency &&
                      outCurrency.originChainId
                    ) {
                      const originChainId = outCurrency.originChainId;
                      params['outOriginChainId'] = originChainId;
                      params['outOriginChainIdentifier'] =
                        ChainIdHelper.parse(originChainId).identifier;

                      params['outToDifferentChain'] = true;
                    }
                    if (
                      'originCurrency' in outCurrency &&
                      outCurrency.originCurrency
                    ) {
                      params['outCurrencyCommonMinimalDenom'] =
                        outCurrency.originCurrency.coinMinimalDenom;
                      params['outCurrencyCommonDenom'] =
                        outCurrency.originCurrency.coinDenom;
                    }
                    params['inRange'] = amountToAmbiguousString(
                      ibcSwapConfigs.amountConfig.amount[0],
                    );
                    params['outRange'] = amountToAmbiguousString(
                      ibcSwapConfigs.amountConfig.outAmount,
                    );

                    // UI 상에서 in currency의 가격은 in input에서 표시되고
                    // out currency의 가격은 swap fee에서 표시된다.
                    // price store에서 usd는 무조건 쿼리하므로 in, out currency의 usd는 보장된다.
                    const inCurrencyPrice = priceStore.calculatePrice(
                      ibcSwapConfigs.amountConfig.amount[0],
                      'usd',
                    );
                    if (inCurrencyPrice) {
                      params['inFiatRange'] =
                        amountToAmbiguousString(inCurrencyPrice);
                      params['inFiatAvg'] =
                        amountToAmbiguousAverage(inCurrencyPrice);
                    }
                    const outCurrencyPrice = priceStore.calculatePrice(
                      ibcSwapConfigs.amountConfig.outAmount,
                      'usd',
                    );
                    if (outCurrencyPrice) {
                      params['outFiatRange'] =
                        amountToAmbiguousString(outCurrencyPrice);
                      params['outFiatAvg'] =
                        amountToAmbiguousAverage(outCurrencyPrice);
                    }

                    new RNMessageRequesterInternal().sendMessage(
                      BACKGROUND_PORT,
                      new LogAnalyticsEventMsg('ibc_swap', params),
                    );
                  },
                  onFulfill: (tx: any) => {
                    if (tx.code != null && tx.code !== 0) {
                      console.log(tx.log ?? tx.raw_log);
                      notification.show(
                        'failed',
                        intl.formatMessage({id: 'error.transaction-failed'}),
                        '',
                      );
                      return;
                    }
                    notification.show(
                      'success',
                      intl.formatMessage({
                        id: 'notification.transaction-success',
                      }),
                      '',
                    );
                  },
                },
              );

              navigation.replace('Home');
            } catch (e) {
              if (e?.message === 'Request rejected') {
                return;
              }

              console.log(e);
              notification.show(
                'failed',
                intl.formatMessage({id: 'error.transaction-failed'}),
                '',
              );
              navigation.replace('Home');
            } finally {
              setIsTxLoading(false);
            }
          }
        }}
      />

      <Gutter size={12} />

      <YAxis alignX="center">
        <TouchableWithoutFeedback
          style={{paddingVertical: 8, paddingHorizontal: 16}}
          onPress={() => {
            Linking.openURL(TermsOfUseUrl);
          }}>
          <Text style={style.flatten(['text-button1', 'color-gray-300'])}>
            <FormattedMessage id="page.ibc-swap.button.terms-of-use.title" />
          </Text>
        </TouchableWithoutFeedback>
      </YAxis>

      <SlippageModal
        // uiConfigStore.ibcSwapConfig.slippageIsValid에 대해서도 확인한다.
        // 왜냐하면 uiConfigStore.ibcSwapConfig.slippageIsValid의 값은 autorun으로 저장되는데
        // 모달에서 마지막으로 잘못된 값을 입력하고 팝업을 닫으면 잘못된 값이 저장된 채로 다시 시작되기 때문에
        // 이 경우 유저에게 바로 모달을 띄워서 적잘한1 슬리피지를 입력하도록 만든다.
        isOpen={
          isSlippageModalOpen || !uiConfigStore.ibcSwapConfig.slippageIsValid
        }
        setIsOpen={setIsSlippageModalOpen}
      />
    </PageWithScrollView>
  );
});

const ArrowsUpDownIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.68756 8.15966C3.0518 8.49788 3.62126 8.47679 3.95948 8.11255L6.29997 5.59203L6.29997 15.9001C6.29997 16.3972 6.70291 16.8001 7.19997 16.8001C7.69702 16.8001 8.09997 16.3972 8.09997 15.9001V5.59203L10.4405 8.11255C10.7787 8.47679 11.3481 8.49788 11.7124 8.15966C12.0766 7.82144 12.0977 7.25198 11.7595 6.88774L7.85948 2.68774C7.68919 2.50435 7.45023 2.40015 7.19997 2.40015C6.9497 2.40015 6.71074 2.50435 6.54045 2.68774L2.64045 6.88774C2.30223 7.25198 2.32332 7.82144 2.68756 8.15966ZM12.2876 15.8406C11.9233 16.1789 11.9022 16.7483 12.2405 17.1126L16.1405 21.3126C16.3107 21.4959 16.5497 21.6001 16.8 21.6001C17.0502 21.6001 17.2892 21.4959 17.4595 21.3126L21.3595 17.1126C21.6977 16.7483 21.6766 16.1789 21.3124 15.8406C20.9481 15.5024 20.3787 15.5235 20.0405 15.8877L17.7 18.4083V8.10015C17.7 7.60309 17.297 7.20015 16.8 7.20015C16.3029 7.20015 15.9 7.60309 15.9 8.10015V18.4083L13.5595 15.8877C13.2213 15.5235 12.6518 15.5024 12.2876 15.8406Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};

const noop = (..._args: any[]) => {
  // noop
};
