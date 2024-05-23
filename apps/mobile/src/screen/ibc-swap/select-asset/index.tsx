import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import {TextInput} from '../../../components/input';
import {SearchIcon} from '../../../components/icon';
import {useIntl} from 'react-intl';
import {useStore} from '../../../stores';
import {
  BoundaryScrollView,
  BoundaryScrollViewBoundary,
} from '../../../components/boundary-scroll-view';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TokenItem} from '../../../components/token-view';
import {Gutter} from '../../../components/gutter';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation.tsx';
import {HugeQueriesStore} from '../../../stores/huge-queries';
import {ObservableQueryIbcSwap} from '@keplr-wallet/stores-internal';
import {computed, makeObservable} from 'mobx';
import {Currency} from '@keplr-wallet/types';
import {IChainInfoImpl} from '@keplr-wallet/stores';
import {CoinPretty, Dec} from '@keplr-wallet/unit';
import {TextInput as NativeInput} from 'react-native';
import {ViewToken} from '../../../components/token-view';

// 계산이 복잡해서 memoize을 적용해야하는데
// mobx와 useMemo()는 같이 사용이 어려워서
// 그냥 일단 computed를 쓰기 위해서 따로 뺌
class IBCSwapDestinationState {
  constructor(
    protected readonly hugeQueriesStore: HugeQueriesStore,
    protected readonly queryIBCSwap: ObservableQueryIbcSwap,
  ) {
    makeObservable(this);
  }

  // ibc swap destination인 currency 중에서 현재 가지고 있는 자산은 기존처럼 보여준다.
  // 현재 가지고 있지 않은 자산도 유저가 선택할 수 있도록 UI 상 후순위로 둔채로 balance 등을 보여주지 않은채 선택은 할 수 있도록 보여준다.
  @computed
  get tokens(): {
    tokens: ReadonlyArray<ViewToken>;
    remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[];
  } {
    const zeroDec = new Dec(0);

    const destinationMap = this.queryIBCSwap.swapDestinationCurrenciesMap;

    // Swap destination은 ibc currency는 보여주지 않는다.
    let tokens = this.hugeQueriesStore.getAllBalances(false);
    let remaining: {
      currency: Currency;
      chainInfo: IChainInfoImpl;
    }[] = [];

    tokens = tokens
      .filter(token => {
        return token.token.toDec().gt(zeroDec);
      })
      .filter(token => {
        const map = destinationMap.get(token.chainInfo.chainIdentifier);
        if (map) {
          return (
            map.currencies.find(
              cur =>
                cur.coinMinimalDenom === token.token.currency.coinMinimalDenom,
            ) != null
          );
        }

        return false;
      });

    // tokens에 존재했는지 체크 용으로 사용
    // key: {chain_identifier}/{coinMinimalDenom}
    const tokensKeyMap = new Map<string, boolean>();

    for (const token of tokens) {
      tokensKeyMap.set(
        `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}`,
        true,
      );
    }

    for (const [chainIdentifier, map] of destinationMap) {
      for (const currency of map.currencies) {
        if (
          !tokensKeyMap.has(`${chainIdentifier}/${currency.coinMinimalDenom}`)
        ) {
          remaining.push({
            currency,
            chainInfo: map.chainInfo,
          });
        }
      }
    }

    remaining = remaining.sort((a, b) => {
      if (a.currency.coinDenom < b.currency.coinDenom) {
        return -1;
      } else if (a.currency.coinDenom > b.currency.coinDenom) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      tokens,
      remaining,
    };
  }
}

export const IBCSwapDestinationSelectAssetScreen: FunctionComponent = observer(
  () => {
    const intl = useIntl();
    const style = useStyle();
    const safeAreaInsets = useSafeAreaInsets();

    const {hugeQueriesStore, skipQueriesStore} = useStore();

    const navigation = useNavigation<StackNavProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'Swap.SelectAsset'>>();
    const excludeKey = route.params?.excludeKey;

    const [search, setSearch] = useState('');
    const searchRef = useRef<NativeInput | null>(null);
    useEffect(() => {
      if (searchRef.current) {
        searchRef.current?.focus();
      }
    }, []);

    const [state] = useState(
      () =>
        new IBCSwapDestinationState(
          hugeQueriesStore,
          skipQueriesStore.queryIBCSwap,
        ),
    );
    const {tokens, remaining} = state.tokens;

    const filteredTokens = useMemo(() => {
      const filtered = tokens.filter(token => {
        return (
          !excludeKey ||
          `${token.chainInfo.chainIdentifier}/${token.token.currency.coinMinimalDenom}` !==
            excludeKey
        );
      });

      const trimSearch = search.trim();

      if (!trimSearch) {
        return filtered;
      }

      return filtered.filter(token => {
        return (
          token.chainInfo.chainName
            .toLowerCase()
            .includes(trimSearch.toLowerCase()) ||
          token.token.currency.coinDenom
            .toLowerCase()
            .includes(trimSearch.toLowerCase())
        );
      });
    }, [excludeKey, search, tokens]);

    const filteredRemaining = useMemo(() => {
      const filtered = remaining.filter(r => {
        return (
          !excludeKey ||
          `${r.chainInfo.chainIdentifier}/${r.currency.coinMinimalDenom}` !==
            excludeKey
        );
      });

      const trimSearch = search.trim();

      if (!trimSearch) {
        return filtered;
      }

      return filtered.filter(r => {
        return (
          r.chainInfo.chainName
            .toLowerCase()
            .includes(trimSearch.toLowerCase()) ||
          r.currency.coinDenom.toLowerCase().includes(trimSearch.toLowerCase())
        );
      });
    }, [excludeKey, remaining, search]);

    return (
      <Box
        style={{
          flex: 1,
        }}>
        <Box paddingX={12}>
          <TextInput
            ref={searchRef}
            left={color => <SearchIcon size={20} color={color} />}
            value={search}
            placeholder={intl.formatMessage({
              id: 'page.send.select-asset.search-placeholder',
            })}
            onChange={e => {
              e.preventDefault();

              setSearch(e.nativeEvent.text);
            }}
          />

          <Gutter size={10} />
        </Box>

        <BoundaryScrollView
          contentContainerStyle={{
            ...style.flatten(['flex-grow-1', 'padding-x-12']),
            paddingBottom: safeAreaInsets.bottom,
          }}>
          <BoundaryScrollViewBoundary
            itemHeight={71.3}
            gap={8}
            data={(
              filteredTokens.map(viewToken => ({
                type: 'filtered',
                viewToken,
              })) as (
                | {
                    type: 'filtered';
                    viewToken: ViewToken;
                  }
                | {
                    type: 'remaining';
                    chainInfo: IChainInfoImpl;
                    currency: Currency;
                  }
              )[]
            ).concat(
              filteredRemaining.map(remaining => ({
                type: 'remaining',
                chainInfo: remaining.chainInfo,
                currency: remaining.currency,
              })),
            )}
            renderItem={(
              d:
                | {
                    type: 'filtered';
                    viewToken: ViewToken;
                  }
                | {
                    type: 'remaining';
                    chainInfo: IChainInfoImpl;
                    currency: Currency;
                  },
            ) => {
              if (d.type === 'filtered') {
                const viewToken = d.viewToken;
                return (
                  <TokenItem
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                    onClick={() => {
                      navigation.navigate({
                        name: 'Swap',
                        params: {
                          ...route.params,
                          outChainId: viewToken.chainInfo.chainId,
                          outCoinMinimalDenom:
                            viewToken.token.currency.coinMinimalDenom,
                        },
                        merge: true,
                      });
                    }}
                  />
                );
              } else if (d.type === 'remaining') {
                const currency = d.currency;
                const chainInfo = d.chainInfo;

                return (
                  <TokenItem
                    viewToken={{
                      chainInfo: chainInfo,
                      token: new CoinPretty(currency, new Dec(0)),
                      isFetching: false,
                      error: undefined,
                    }}
                    key={`${chainInfo.chainId}-${currency.coinMinimalDenom}`}
                    onClick={() => {
                      navigation.navigate({
                        name: 'Swap',
                        params: {
                          ...route.params,
                          outChainId: chainInfo.chainId,
                          outCoinMinimalDenom: currency.coinMinimalDenom,
                        },
                        merge: true,
                      });
                    }}
                  />
                );
              }
            }}
            keyExtractor={(
              d:
                | {
                    type: 'filtered';
                    viewToken: ViewToken;
                  }
                | {
                    type: 'remaining';
                    chainInfo: IChainInfoImpl;
                    currency: Currency;
                  },
            ) => {
              if (d.type === 'filtered') {
                return `${d.viewToken.chainInfo.chainId}-${d.viewToken.token.currency.coinMinimalDenom}`;
              } else if (d.type === 'remaining') {
                return `${d.chainInfo.chainId}-${d.currency.coinMinimalDenom}`;
              }

              return "Can't happen";
            }}
          />
        </BoundaryScrollView>
      </Box>
    );
  },
);
