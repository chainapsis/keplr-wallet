import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {Column, Columns} from '../../../../components/column';
import {Button} from '../../../../components/button';
import {Stack} from '../../../../components/stack';
import {Box} from '../../../../components/box';
import {VerticalCollapseTransition} from '../../../../components/transition';
import {ColorPalette, useStyle} from '../../../../styles';
import {ViewToken} from '../../index';

import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {CoinPretty, Dec, Int, PricePretty} from '@keplr-wallet/unit';
import {
  AminoSignResponse,
  BroadcastMode,
  FeeCurrency,
  StdSignDoc,
} from '@keplr-wallet/types';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  SendTxMsg,
} from '@keplr-wallet/background';
import {action, makeObservable, observable} from 'mobx';
import {isSimpleFetchError} from '@keplr-wallet/simple-fetch';
import {Skeleton} from '../../../../components/skeleton';
import {YAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';
import {ChainImageFallback} from '../../../../components/image';
import {Text} from 'react-native';
import {ArrowDownIcon} from '../../../../components/icon/arrow-down';
import {ArrowUpIcon} from '../../../../components/icon/arrow-up';
import {WarningIcon} from '../../../../components/icon/warning';
import {useNavigation} from '@react-navigation/native';
import {SpecialButton} from '../../../../components/special-button';
import {useNotification} from '../../../../hooks/notification';
import {StackNavProp} from '../../../../navigation';
import {FormattedMessage, useIntl} from 'react-intl';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {RNMessageRequesterInternal} from '../../../../router';
import {DefaultGasPriceStep} from '@keplr-wallet/hooks';

// XXX: 좀 이상하긴 한데 상위/하위 컴포넌트가 state를 공유하기 쉽게하려고 이렇게 한다...
class ClaimAllEachState {
  @observable
  isLoading: boolean = false;

  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  @action
  setFailedReason(value: Error | undefined): void {
    this.isLoading = false;
    this.failedReason = value;
  }
}

const zeroDec = new Dec(0);

export const ClaimAll: FunctionComponent<{isNotReady?: boolean}> = observer(
  ({isNotReady}) => {
    const {chainStore, accountStore, queriesStore, priceStore, keyRingStore} =
      useStore();
    const style = useStyle();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPressingExpandButton, setIsPressingExpandButton] = useState(false);
    const intl = useIntl();

    const statesRef = useRef(new Map<string, ClaimAllEachState>());
    const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
      const chainIdentifier = chainStore.getChain(chainId).chainIdentifier;
      let state = statesRef.current.get(chainIdentifier);
      if (!state) {
        state = new ClaimAllEachState();
        statesRef.current.set(chainIdentifier, state);
      }

      return state;
    };

    const viewTokens: ViewToken[] = (() => {
      const res: ViewToken[] = [];
      for (const chainInfo of chainStore.chainInfosInUI) {
        const chainId = chainInfo.chainId;
        const accountAddress = accountStore.getAccount(chainId).bech32Address;
        const queries = queriesStore.get(chainId);
        const queryRewards =
          queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

        const targetDenom = (() => {
          if (chainInfo.chainIdentifier === 'dydx-mainnet') {
            return 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5';
          }

          return chainInfo.stakeCurrency?.coinMinimalDenom;
        })();

        if (targetDenom) {
          const currency = chainInfo.findCurrency(targetDenom);
          if (currency) {
            const reward = queryRewards.rewards.find(
              r => r.currency.coinMinimalDenom === targetDenom,
            );
            if (reward) {
              res.push({
                token: reward,
                chainInfo,
                isFetching: queryRewards.isFetching,
                error: queryRewards.error,
              });
            }
          }
        }
      }

      return res
        .filter(viewToken => viewToken.token.toDec().gt(zeroDec))
        .sort((a, b) => {
          const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
          const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

          if (aPrice.equals(bPrice)) {
            return 0;
          }
          return aPrice.gt(bPrice) ? -1 : 1;
        })
        .sort((a, b) => {
          const aHasError =
            getClaimAllEachState(a.chainInfo.chainId).failedReason != null;
          const bHasError =
            getClaimAllEachState(b.chainInfo.chainId).failedReason != null;

          if (aHasError || bHasError) {
            if (aHasError && bHasError) {
              return 0;
            } else if (aHasError) {
              return 1;
            } else {
              return -1;
            }
          }

          return 0;
        });
    })();

    const totalPrice = (() => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency,
      );
      if (!fiatCurrency) {
        return undefined;
      }

      let res = new PricePretty(fiatCurrency, 0);

      for (const viewToken of viewTokens) {
        const price = priceStore.calculatePrice(viewToken.token);
        if (price) {
          res = res.add(price);
        }
      }

      return res;
    })();

    const isLedger =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === 'ledger';

    const isKeystone =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === 'keystone';

    const claimAll = () => {
      // analyticsStore.logEvent('click_claimAll');

      if (viewTokens.length > 0) {
        setIsExpanded(true);
      }

      if (isLedger || isKeystone) {
        // Ledger에서 현실적으로 이 기능을 처리해주기 난감하다.
        // disable하기보다는 일단 눌렀을때 expand를 시켜주고 아무것도 하지 않는다.
        return;
      }

      for (const viewToken of viewTokens) {
        const chainId = viewToken.chainInfo.chainId;
        const account = accountStore.getAccount(chainId);

        if (!account.bech32Address) {
          continue;
        }

        const chainInfo = chainStore.getChain(chainId);
        const queries = queriesStore.get(chainId);
        const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
          account.bech32Address,
        );

        const validatorAddresses =
          queryRewards.getDescendingPendingRewardValidatorAddresses(8);

        if (validatorAddresses.length === 0) {
          continue;
        }

        const state = getClaimAllEachState(chainId);

        state.setIsLoading(true);

        const tx =
          account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

        (async () => {
          // feemarket feature가 있는 경우 이후의 로직에서 사용할 수 있는 fee currency를 찾아야하기 때문에 undefined로 시작시킨다.
          let feeCurrency = chainInfo.hasFeature('feemarket')
            ? undefined
            : chainInfo.feeCurrencies.find(
                cur =>
                  cur.coinMinimalDenom ===
                  chainInfo.stakeCurrency?.coinMinimalDenom,
              );

          if (chainInfo.hasFeature('osmosis-base-fee-beta') && feeCurrency) {
            const queryBaseFee = queriesStore.get(chainInfo.chainId).osmosis
              .queryBaseFee;
            const queryRemoteBaseFeeStep = queriesStore.simpleQuery.queryGet<{
              low?: number;
              average?: number;
              high?: number;
            }>(
              'https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws/osmosis/osmosis-base-fee-beta.json',
            );

            await queryBaseFee.waitFreshResponse();
            await queryRemoteBaseFeeStep.waitFreshResponse();

            const baseFee = queryBaseFee.baseFee;
            const remoteBaseFeeStep = queryRemoteBaseFeeStep.response;
            if (baseFee) {
              const low = remoteBaseFeeStep?.data.low
                ? parseFloat(
                    baseFee
                      .mul(new Dec(remoteBaseFeeStep.data.low))
                      .toString(8),
                  )
                : feeCurrency.gasPriceStep?.low ?? DefaultGasPriceStep.low;
              const average = Math.max(
                low,
                remoteBaseFeeStep?.data.average
                  ? parseFloat(
                      baseFee
                        .mul(new Dec(remoteBaseFeeStep.data.average))
                        .toString(8),
                    )
                  : feeCurrency.gasPriceStep?.average ??
                      DefaultGasPriceStep.average,
              );
              const high = Math.max(
                average,
                remoteBaseFeeStep?.data.high
                  ? parseFloat(
                      baseFee
                        .mul(new Dec(remoteBaseFeeStep.data.high))
                        .toString(8),
                    )
                  : feeCurrency.gasPriceStep?.high ?? DefaultGasPriceStep.high,
              );

              feeCurrency = {
                ...feeCurrency,
                gasPriceStep: {
                  low,
                  average,
                  high,
                },
              };
            }
          }

          if (!feeCurrency) {
            let prev:
              | {
                  balance: CoinPretty;
                  price: PricePretty | undefined;
                }
              | undefined;

            const feeCurrencies = await (async () => {
              if (chainInfo.hasFeature('feemarket')) {
                const queryFeeMarketGasPrices =
                  queriesStore.get(chainId).cosmos.queryFeeMarketGasPrices;
                await queryFeeMarketGasPrices.waitFreshResponse();

                const result: FeeCurrency[] = [];

                for (const gasPrice of queryFeeMarketGasPrices.gasPrices) {
                  const currency = await chainInfo.findCurrencyAsync(
                    gasPrice.denom,
                  );
                  if (currency) {
                    let multiplication = {
                      low: 1.1,
                      average: 1.2,
                      high: 1.3,
                    };

                    const multificationConfig =
                      queriesStore.simpleQuery.queryGet<{
                        [str: string]:
                          | {
                              low: number;
                              average: number;
                              high: number;
                            }
                          | undefined;
                      }>(
                        'https://gjsttg7mkgtqhjpt3mv5aeuszi0zblbb.lambda-url.us-west-2.on.aws',
                        '/feemarket/info.json',
                      );

                    if (multificationConfig.response) {
                      const _default =
                        multificationConfig.response.data['__default__'];
                      if (
                        _default &&
                        _default.low != null &&
                        typeof _default.low === 'number' &&
                        _default.average != null &&
                        typeof _default.average === 'number' &&
                        _default.high != null &&
                        typeof _default.high === 'number'
                      ) {
                        multiplication = {
                          low: _default.low,
                          average: _default.average,
                          high: _default.high,
                        };
                      }
                      const specific =
                        multificationConfig.response.data[
                          chainInfo.chainIdentifier
                        ];
                      if (
                        specific &&
                        specific.low != null &&
                        typeof specific.low === 'number' &&
                        specific.average != null &&
                        typeof specific.average === 'number' &&
                        specific.high != null &&
                        typeof specific.high === 'number'
                      ) {
                        multiplication = {
                          low: specific.low,
                          average: specific.average,
                          high: specific.high,
                        };
                      }
                    }

                    result.push({
                      ...currency,
                      gasPriceStep: {
                        low: parseFloat(
                          new Dec(multiplication.low)
                            .mul(gasPrice.amount)
                            .toString(),
                        ),
                        average: parseFloat(
                          new Dec(multiplication.average)
                            .mul(gasPrice.amount)
                            .toString(),
                        ),
                        high: parseFloat(
                          new Dec(multiplication.high)
                            .mul(gasPrice.amount)
                            .toString(),
                        ),
                      },
                    });
                  }
                }

                return result;
              } else {
                return chainInfo.feeCurrencies;
              }
            })();

            for (const chainFeeCurrency of feeCurrencies) {
              const currency = await chainInfo.findCurrencyAsync(
                chainFeeCurrency.coinMinimalDenom,
              );
              if (currency) {
                const balance = queries.queryBalances
                  .getQueryBech32Address(account.bech32Address)
                  .getBalance(currency);
                if (balance && balance.balance.toDec().gt(new Dec(0))) {
                  const price = await priceStore.waitCalculatePrice(
                    balance.balance,
                    'usd',
                  );

                  if (!prev) {
                    feeCurrency = {
                      ...chainFeeCurrency,
                      ...currency,
                    };
                    prev = {
                      balance: balance.balance,
                      price,
                    };
                  } else {
                    if (!prev.price) {
                      if (prev.balance.toDec().lt(balance.balance.toDec())) {
                        feeCurrency = {
                          ...chainFeeCurrency,
                          ...currency,
                        };
                        prev = {
                          balance: balance.balance,
                          price,
                        };
                      }
                    } else if (price) {
                      if (prev.price.toDec().lt(price.toDec())) {
                        feeCurrency = {
                          ...chainFeeCurrency,
                          ...currency,
                        };
                        prev = {
                          balance: balance.balance,
                          price,
                        };
                      }
                    }
                  }
                }
              }
            }
          }

          if (feeCurrency) {
            try {
              const simulated = await tx.simulate();

              // Gas adjustment is 1.5
              // Since there is currently no convenient way to adjust the gas adjustment on the UI,
              // Use high gas adjustment to prevent failure.
              const gasEstimated = new Dec(simulated.gasUsed * 1.5).truncate();
              let fee = {
                denom: feeCurrency.coinMinimalDenom,
                amount: new Dec(feeCurrency.gasPriceStep?.average ?? 0.025)
                  .mul(new Dec(gasEstimated))
                  .roundUp()
                  .toString(),
              };

              // coingecko로부터 캐시가 있거나 response를 최소한 한번은 받았다는 걸 보장한다.
              await priceStore.waitResponse();
              // USD 기준으로 average fee가 0.2달러를 넘으면 low로 설정해서 보낸다.
              const averageFeePrice = priceStore.calculatePrice(
                new CoinPretty(feeCurrency, fee.amount),
                'usd',
              );
              if (
                averageFeePrice &&
                averageFeePrice.toDec().gte(new Dec(0.2))
              ) {
                fee = {
                  denom: feeCurrency.coinMinimalDenom,
                  amount: new Dec(feeCurrency.gasPriceStep?.low ?? 0.025)
                    .mul(new Dec(gasEstimated))
                    .roundUp()
                    .toString(),
                };
                console.log(
                  `(${chainId}) Choose low gas price because average fee price is greater or equal than 0.2 USD`,
                );
              }

              // Ensure fee currency fetched before querying balance
              const feeCurrencyFetched = await chainInfo.findCurrencyAsync(
                feeCurrency.coinMinimalDenom,
              );
              if (!feeCurrencyFetched) {
                state.setFailedReason(
                  new Error(
                    intl.formatMessage({
                      id: 'error.can-not-find-balance-for-fee-currency',
                    }),
                  ),
                );
                return;
              }
              const balance = queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .getBalance(feeCurrencyFetched);

              if (!balance) {
                state.setFailedReason(
                  new Error(
                    intl.formatMessage({
                      id: 'error.can-not-find-balance-for-fee-currency',
                    }),
                  ),
                );
                return;
              }

              await balance.waitResponse();

              if (
                new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))
              ) {
                state.setFailedReason(
                  new Error(
                    intl.formatMessage({
                      id: 'error.not-enough-balance-to-pay-fee',
                    }),
                  ),
                );
                return;
              }

              if (
                (viewToken.token.toCoin().denom === fee.denom &&
                  new Dec(viewToken.token.toCoin().amount).lte(
                    new Dec(fee.amount),
                  )) ||
                (await (async () => {
                  if (viewToken.token.toCoin().denom !== fee.denom) {
                    if (
                      viewToken.token.currency.coinGeckoId &&
                      feeCurrencyFetched.coinGeckoId
                    ) {
                      const rewardPrice = await priceStore.waitCalculatePrice(
                        viewToken.token,
                        'usd',
                      );
                      const feePrice = await priceStore.waitCalculatePrice(
                        new CoinPretty(feeCurrencyFetched, fee.amount),
                        'usd',
                      );
                      if (
                        rewardPrice &&
                        rewardPrice.toDec().gt(new Dec(0)) &&
                        feePrice &&
                        feePrice.toDec().gt(new Dec(0))
                      ) {
                        if (
                          rewardPrice
                            .toDec()
                            .mul(new Dec(1.2))
                            .lte(feePrice.toDec())
                        ) {
                          return true;
                        }
                      }
                    }
                  }

                  return false;
                })())
              ) {
                console.log(
                  `(${chainId}) Skip claim rewards. Fee: ${fee.amount}${
                    fee.denom
                  } is greater than stakable reward: ${
                    viewToken.token.toCoin().amount
                  }${viewToken.token.toCoin().denom}`,
                );
                state.setFailedReason(
                  new Error(
                    intl.formatMessage({
                      id: 'error.claimable-reward-is-smaller-than-the-required-fee',
                    }),
                  ),
                );
                return;
              }

              await tx.send(
                {
                  gas: gasEstimated.toString(),
                  amount: [fee],
                },
                '',
                {
                  signAmino: async (
                    chainId: string,
                    signer: string,
                    signDoc: StdSignDoc,
                  ): Promise<AminoSignResponse> => {
                    const requester = new RNMessageRequesterInternal();

                    return await requester.sendMessage(
                      BACKGROUND_PORT,
                      new PrivilegeCosmosSignAminoWithdrawRewardsMsg(
                        chainId,
                        signer,
                        signDoc,
                      ),
                    );
                  },
                  sendTx: async (
                    chainId: string,
                    tx: Uint8Array,
                    mode: BroadcastMode,
                  ): Promise<Uint8Array> => {
                    const requester = new RNMessageRequesterInternal();

                    return await requester.sendMessage(
                      BACKGROUND_PORT,
                      new SendTxMsg(chainId, tx, mode, true),
                    );
                  },
                },
                {
                  onBroadcasted: () => {
                    // analyticsStore.logEvent('complete_claim', {
                    //   chainId: viewToken.chainInfo.chainId,
                    //   chainName: viewToken.chainInfo.chainName,
                    //   isClaimAll: true,
                    // });
                  },
                  onFulfill: (tx: any) => {
                    // Tx가 성공한 이후에 rewards가 다시 쿼리되면서 여기서 빠지는게 의도인데...
                    // 쿼리하는 동안 시간차가 있기 때문에 훼이크로 그냥 1초 더 기다린다.
                    setTimeout(() => {
                      state.setIsLoading(false);
                    }, 1000);

                    if (tx.code) {
                      state.setFailedReason(new Error(tx['raw_log']));
                    }
                  },
                },
              );
            } catch (e) {
              if (isSimpleFetchError(e) && e.response) {
                const response = e.response;
                if (
                  response.status === 400 &&
                  response.data?.message &&
                  typeof response.data.message === 'string' &&
                  response.data.message.includes('invalid empty tx')
                ) {
                  state.setFailedReason(
                    new Error(
                      intl.formatMessage({
                        id: 'error.outdated-cosmos-sdk',
                      }),
                    ),
                  );
                  return;
                }
              }

              state.setFailedReason(e);
              console.log(e);
              return;
            }
          } else {
            state.setFailedReason(
              new Error(
                intl.formatMessage({
                  id: 'error.can-not-pay-for-fee-by-stake-currency',
                }),
              ),
            );
            return;
          }
        })();
      }
    };

    const claimAllDisabled = (() => {
      if (viewTokens.length === 0) {
        return true;
      }

      for (const viewToken of viewTokens) {
        if (viewToken.token.toDec().gt(new Dec(0))) {
          return false;
        }
      }

      return true;
    })();

    const claimAllIsLoading = (() => {
      for (const chainInfo of chainStore.chainInfosInUI) {
        const state = getClaimAllEachState(chainInfo.chainId);
        if (state.isLoading) {
          return true;
        }
      }
      return false;
    })();

    useEffect(() => {
      if (isExpanded) {
        if (!claimAllIsLoading) {
          // Clear errors when collapsed.
          for (const state of statesRef.current.values()) {
            state.setFailedReason(undefined);
          }
        }
      }
      // 펼쳐지면서 그 때 loading 중이 아닐 경우에 에러를 지워준다.
      // 펼쳐지는 순간에만 발생해야하기 때문에 claimAllIsLoading는 deps에서 없어야한다.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    // `,
    return (
      <Box
        borderRadius={6}
        paddingTop={12}
        style={style.flatten(['background-color-card-default'])}>
        <Box paddingX={16} paddingBottom={4}>
          <Columns sum={1} alignY="center">
            <Stack gutter={8}>
              <YAxis alignX="left">
                <Skeleton layer={1} isNotReady={isNotReady}>
                  <Text style={style.flatten(['body2', 'color-gray-300'])}>
                    <FormattedMessage id="page.main.components.claim-all.title" />
                  </Text>
                </Skeleton>
              </YAxis>

              <YAxis alignX="left">
                <Skeleton layer={1} isNotReady={isNotReady} dummyMinWidth={82}>
                  <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
                    {totalPrice ? totalPrice.separator(' ').toString() : '?'}
                  </Text>
                </Skeleton>
              </YAxis>
            </Stack>

            <Column weight={1} />

            <Skeleton type="button" layer={1} isNotReady={isNotReady}>
              {/*
                 ledger일 경우 특수한 행동을 하진 못하고 그냥 collapse를 펼치기만 한다.
                 특수한 기능이 없다는 것을 암시하기 위해서 ledger일때는 일반 버튼으로 처리한다.
               */}
              {isLedger || isKeystone ? (
                <Button
                  text={intl.formatMessage({
                    id: 'page.main.components.claim-all.button',
                  })}
                  size="medium"
                  loading={claimAllIsLoading}
                  disabled={claimAllDisabled}
                  onPress={claimAll}
                />
              ) : (
                <SpecialButton
                  size="medium"
                  text={intl.formatMessage({
                    id: 'page.main.components.claim-all.button',
                  })}
                  disabled={claimAllDisabled}
                  isLoading={claimAllIsLoading}
                  onPress={claimAll}
                />
              )}
            </Skeleton>
          </Columns>
        </Box>

        <TouchableWithoutFeedback
          disabled={claimAllDisabled}
          onPressIn={() => setIsPressingExpandButton(true)}
          onPressOut={() => setIsPressingExpandButton(false)}
          onPress={() => {
            // analyticsStore.logEvent('click_claimExpandButton');
            if (viewTokens.length > 0) {
              setIsExpanded(!isExpanded);
            }
          }}>
          <Box
            alignX="center"
            style={style.flatten(
              ['padding-10'],
              [isPressingExpandButton && 'background-color-gray-500@50%'],
            )}>
            <Box
              style={{
                opacity: isNotReady ? 0 : 1,
              }}>
              {!isExpanded ? (
                <ArrowDownIcon size={20} color={ColorPalette['gray-300']} />
              ) : (
                <ArrowUpIcon size={20} color={ColorPalette['gray-300']} />
              )}
            </Box>
          </Box>
        </TouchableWithoutFeedback>

        <VerticalCollapseTransition
          collapsed={!isExpanded}
          onTransitionEnd={() => {
            if (!isExpanded) {
              if (!claimAllIsLoading) {
                // Clear errors when collapsed.
                for (const state of statesRef.current.values()) {
                  state.setFailedReason(undefined);
                }
              }
            }
          }}>
          {viewTokens.map(viewToken => {
            return (
              <ClaimTokenItem
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                viewToken={viewToken}
                state={getClaimAllEachState(viewToken.chainInfo.chainId)}
                itemsLength={viewTokens.length}
              />
            );
          })}
        </VerticalCollapseTransition>
      </Box>
    );
  },
);

const ClaimTokenItem: FunctionComponent<{
  viewToken: ViewToken;
  state: ClaimAllEachState;

  itemsLength: number;
}> = observer(({viewToken, state}) => {
  const {accountStore, queriesStore} = useStore();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const notification = useNotification();
  const intl = useIntl();

  const [isSimulating, setIsSimulating] = useState(false);

  // TODO: Add below property to config.ui.ts
  const defaultGasPerDelegation = 140000;

  const claim = async () => {
    // analyticsStore.logEvent('click_claim', {
    //   chainId: viewToken.chainInfo.chainId,
    //   chainName: viewToken.chainInfo.chainName,
    // });

    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }
    const chainId = viewToken.chainInfo.chainId;
    const account = accountStore.getAccount(chainId);

    const queries = queriesStore.get(chainId);
    const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address,
    );

    const validatorAddresses =
      queryRewards.getDescendingPendingRewardValidatorAddresses(8);

    if (validatorAddresses.length === 0) {
      return;
    }

    const tx =
      account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

    let gas = new Int(validatorAddresses.length * defaultGasPerDelegation);

    try {
      setIsSimulating(true);

      const simulated = await tx.simulate();

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      gas = new Dec(simulated.gasUsed * 1.5).truncate();
    } catch (e) {
      console.log(e);
    }

    try {
      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        '',
        {},
        {
          onBroadcasted: txHash => {
            // analyticsStore.logEvent('complete_claim', {
            //   chainId: viewToken.chainInfo.chainId,
            //   chainName: viewToken.chainInfo.chainName,
            // });
            navigation.navigate('TxPending', {
              chainId,
              txHash: Buffer.from(txHash).toString('hex'),
            });
          },
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);
              notification.show(
                'failed',
                intl.formatMessage({id: 'error.transaction-failed'}),
              );

              return;
            }
            notification.show(
              'success',
              intl.formatMessage({
                id: 'notification.transaction-success',
              }),
            );
          },
        },
      );
    } catch (e) {
      if (e?.message === 'Request rejected') {
        return;
      }
      notification.show(
        'failed',
        intl.formatMessage({id: 'error.transaction-failed'}),
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const isLoading =
    accountStore.getAccount(viewToken.chainInfo.chainId).isSendingMsg ===
      'withdrawRewards' ||
    state.isLoading ||
    isSimulating;

  return (
    <Box padding={16}>
      <Columns sum={1} alignY="center">
        <ChainImageFallback
          style={{
            width: 32,
            height: 32,
          }}
          alt={viewToken.token.currency.coinDenom}
          src={viewToken.token.currency.coinImageUrl}
        />

        <Gutter size={12} />

        <Column weight={1}>
          <Stack gutter={6}>
            <Text
              style={style.flatten([
                'subtitle3',
                'color-gray-700',
                'dark:color-gray-300',
              ])}>
              {(() => {
                if ('paths' in viewToken.token.currency) {
                  const originDenom =
                    viewToken.token.currency.originCurrency?.coinDenom;
                  if (originDenom) {
                    return `${originDenom} (${viewToken.chainInfo.chainName})`;
                  }
                }

                return viewToken.token.currency.coinDenom;
              })()}
            </Text>
            <Text
              style={style.flatten([
                'subtitle2',
                'color-gray-300',
                'dark:color-gray-10',
              ])}>
              {viewToken.token
                .maxDecimals(6)
                .shrink(true)
                .inequalitySymbol(true)
                .hideDenom(true)
                .toString()}
            </Text>
          </Stack>
        </Column>

        {/* TODO 이후 툴팁을 추가해야함  */}
        {/* <Tooltip
          enabled={!!state.failedReason}
          content={
            state.failedReason?.message || state.failedReason?.toString()
          }
          // 아이템이 한개만 있으면 tooltip이 VerticalCollapseTransition가 overflow: hidden이라
          // 위/아래로 나타나면 가려져서 유저가 오류 메세지를 볼 방법이 없다.
          // VerticalCollapseTransition가 overflow: hidden이여야 하는건 필수적이므로 이 부분을 수정할 순 없기 때문에
          // 대충 아이템이 한개면 tooltip이 왼족에 나타나도록 한다.
          allowedPlacements={itemsLength === 1 ? ['left'] : undefined}> */}
        <Button
          text={intl.formatMessage({
            id: 'page.main.components.claim-all.claim-button',
          })}
          size="small"
          color="secondary"
          loading={isLoading}
          disabled={viewToken.token.toDec().lte(new Dec(0))}
          textOverrideIcon={
            state.failedReason ? (
              <WarningIcon size={16} color={ColorPalette['gray-200']} />
            ) : undefined
          }
          onPress={claim}
        />
        {/* </Tooltip> */}
      </Columns>
    </Box>
  );
});
