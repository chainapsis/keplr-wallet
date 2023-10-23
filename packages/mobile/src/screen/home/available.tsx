import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {CoinPretty, Dec} from '@keplr-wallet/unit';
import {observer} from 'mobx-react-lite';
import {Stack} from '../../components/stack';
import {Button} from '../../components/button';
import {useStore} from '../../stores';
import {Box} from '../../components/box';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {EmptyView} from '../../components/empty-view';
import {YAxis} from '../../components/axis';
import {Pressable, Text} from 'react-native';
import {MainEmptyView} from './components/empty-view';
import {useStyle} from '../../styles';
import {TokenItem, TokenTitleView} from './components/token';
import {ViewToken} from '.';
import {CollapsibleList} from '../../components/collapsible-list';
import {Modal} from '../../components/modal';
import {TokenFoundModal} from './components/token-found-modal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {LookingForChains} from './components/looking-for-chains';
import {Gutter} from '../../components/gutter';
import FastImage from 'react-native-fast-image';
import {InformationModal} from './infoModal';
import {StackActions, useNavigation} from '@react-navigation/native';

const zeroDec = new Dec(0);

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted?: () => void;
}> = observer(({search, isNotReady, onClickGetStarted}) => {
  const {hugeQueriesStore, chainStore} = useStore();
  const style = useStyle();
  // const navigate = useNavigate();
  const tokenFoundModalRef = useRef<BottomSheetModal>(null);
  const infoModalRef = useRef<BottomSheetModal>(null);

  const allBalances = hugeQueriesStore.getAllBalances(true);
  const allBalancesNonZero = useMemo(() => {
    return allBalances.filter(token => {
      return token.token.toDec().gt(zeroDec);
    });
  }, [allBalances]);

  const isFirstTime = allBalancesNonZero.length === 0;
  const trimSearch = search.trim();
  const _allBalancesSearchFiltered = useMemo(() => {
    return allBalances.filter(token => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [allBalances, trimSearch]);

  const hasLowBalanceTokens =
    hugeQueriesStore.filterLowBalanceTokens(allBalances).length > 0;
  // const lowBalanceFilteredAllBalancesSearchFiltered =
  //   hugeQueriesStore.filterLowBalanceTokens(_allBalancesSearchFiltered);

  //NOTE ui config 추가 되면 추가 하기
  // const allBalancesSearchFiltered =
  //   uiConfigStore.isHideLowBalance && hasLowBalanceTokens
  //     ? lowBalanceFilteredAllBalancesSearchFiltered
  //     : _allBalancesSearchFiltered;

  const lookingForChains = (() => {
    return chainStore.chainInfos.filter(chainInfo => {
      if (chainStore.isEnabledChain(chainInfo.chainId)) {
        return false;
      }

      const replacedSearchValue = trimSearch.replace(/ /g, '').toLowerCase();

      if (replacedSearchValue.length < 3) {
        return false;
      }

      const hasChainName =
        chainInfo.chainName.replace(/ /gi, '').toLowerCase() ===
        replacedSearchValue;
      const hasCurrency = chainInfo.currencies.some(
        currency =>
          currency.coinDenom.replace(/ /gi, '').toLowerCase() ===
          replacedSearchValue,
      );

      const hasStakeCurrency =
        chainInfo.stakeCurrency &&
        chainInfo.stakeCurrency.coinDenom.replace(/ /gi, '').toLowerCase() ===
          replacedSearchValue;

      return hasChainName || hasCurrency || hasStakeCurrency;
    });
  })();

  const TokenViewData: {
    title: string;
    balance: ViewToken[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: 'Available Balance',
      balance: _allBalancesSearchFiltered,
      lenAlwaysShown: 10,
      tooltip:
        'The amount of your assets that are available for use or transfer immediately, except for those that are currently staked or locked in LP pools.',
    },
  ];

  const navigation = useNavigation();

  const numFoundToken = useMemo(() => {
    if (chainStore.tokenScans.length === 0) {
      return 0;
    }

    const set = new Set<string>();

    for (const tokenScan of chainStore.tokenScans) {
      for (const info of tokenScan.infos) {
        for (const asset of info.assets) {
          const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
            asset.currency.coinMinimalDenom
          }`;
          set.add(key);
        }
      }
    }

    return Array.from(set).length;
  }, [chainStore.tokenScans]);

  const isShowNotFound =
    _allBalancesSearchFiltered.length === 0 && trimSearch.length > 0;
  return (
    <React.Fragment>
      {isNotReady ? (
        <TokenItem
          viewToken={{
            token: new CoinPretty(
              chainStore.chainInfos[0].currencies[0],
              new Dec(0),
            ),
            chainInfo: chainStore.chainInfos[0],
            isFetching: false,
            error: undefined,
          }}
          isNotReady={isNotReady}
        />
      ) : (
        <React.Fragment>
          <Stack gutter={8}>
            {TokenViewData.map(({title, balance, lenAlwaysShown}) => {
              if (balance.length === 0) {
                return null;
              }
              return (
                <CollapsibleList
                  key={title}
                  title={
                    <TokenTitleView
                      onOpenModal={() => infoModalRef.current?.present()}
                      title={title}
                      right={
                        hasLowBalanceTokens ? (
                          <React.Fragment>
                            {/* TODO 해당영역에 뷰옵션을 보여주는 버튼이 생길수도 있으니 해서 일단 구현안함 */}
                            {/* <Caption2
                              style={{cursor: 'pointer'}}
                              onClick={() => {
                                uiConfigStore.setHideLowBalance(
                                  !uiConfigStore.isHideLowBalance,
                                );
                              }}
                              color={ColorPalette['gray-300']}>
                              <FormattedMessage id="page.main.available.hide-low-balance" />
                            </Caption2>

                            <Gutter size="0.25rem" />

                            <Checkbox
                              size="extra-small"
                              checked={uiConfigStore.isHideLowBalance}
                              onChange={() => {
                                uiConfigStore.setHideLowBalance(
                                  !uiConfigStore.isHideLowBalance,
                                );
                              }}
                            /> */}
                          </React.Fragment>
                        ) : undefined
                      }
                    />
                  }
                  lenAlwaysShown={lenAlwaysShown}
                  items={balance.map(viewToken => (
                    <TokenItem
                      viewToken={viewToken}
                      key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                      onClick={() => {
                        navigation.dispatch({
                          ...StackActions.push('Send', {
                            chainId: viewToken.chainInfo.chainId,
                            coinMinimalDenom:
                              viewToken.token.currency.coinMinimalDenom,
                          }),
                        });
                      }}
                    />
                  ))}
                />
              );
            })}
          </Stack>

          {lookingForChains.length > 0 ? (
            <React.Fragment>
              <Gutter size={8} direction="vertical" />
              <LookingForChains chainInfos={lookingForChains} />
            </React.Fragment>
          ) : null}

          {isShowNotFound ? (
            <Box marginY={16}>
              <EmptyView>
                <Stack alignX="center" gutter={0.1}>
                  <Text
                    style={style.flatten([
                      'color-white',
                      'subtitle3',
                      'font-bold',
                    ])}>
                    Oops!
                  </Text>
                  <Text style={style.flatten(['subtitle3', 'color-white'])}>
                    No Result Found
                  </Text>
                </Stack>
              </EmptyView>
            </Box>
          ) : isFirstTime ? (
            <MainEmptyView
              image={
                <FastImage
                  style={{width: 100, height: 100}}
                  source={require('../../public/assets/img/main-empty-balance.png')}
                />
              }
              paragraph="Gear up yourself by topping up your wallet!"
              title="Ready to Explore the Interchain?"
              button={
                <Button
                  text="Get Started"
                  color="primary"
                  size="small"
                  onPress={onClickGetStarted}
                />
              }
            />
          ) : null}

          {numFoundToken > 0 ? (
            <Box padding={12}>
              <YAxis alignX="center">
                <NewTokenFoundButton
                  numFoundToken={numFoundToken}
                  onPress={() => tokenFoundModalRef.current?.present()}
                />
              </YAxis>
            </Box>
          ) : null}
        </React.Fragment>
      )}
      <Modal ref={tokenFoundModalRef} snapPoints={['60%']}>
        <TokenFoundModal />
      </Modal>
      <Modal ref={infoModalRef} enableDynamicSizing={true}>
        <InformationModal />
      </Modal>
    </React.Fragment>
  );
});

const NewTokenFoundButton = ({
  onPress,
  numFoundToken,
}: {
  onPress: () => void;
  numFoundToken: number;
}) => {
  const style = useStyle();
  const [isPressIn, setIsPressIn] = useState(false);

  return (
    <Pressable
      style={style.flatten([
        'flex-row',
        'justify-center',
        'items-center',
        'padding-x-16',
        'padding-y-6',
      ])}
      onPress={onPress}
      onPressOut={() => setIsPressIn(false)}
      onPressIn={() => setIsPressIn(true)}>
      <Text
        style={style.flatten([
          'text-center',
          'text-button1',
          isPressIn ? 'color-gray-200' : 'color-gray-50',
        ])}>
        {`${numFoundToken} new token(s) found`}
      </Text>
    </Pressable>
  );
};
