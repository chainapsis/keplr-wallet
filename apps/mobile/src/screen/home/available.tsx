import React, {FunctionComponent, useMemo, useState} from 'react';
import {CoinPretty, Dec} from '@keplr-wallet/unit';
import {observer} from 'mobx-react-lite';
import {Stack} from '../../components/stack';
import {Button} from '../../components/button';
import {useStore} from '../../stores';
import {Box} from '../../components/box';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {EmptyView} from '../../components/empty-view';
import {YAxis} from '../../components/axis';
import {Text} from 'react-native';
import {MainEmptyView} from './components/empty-view';
import {useStyle} from '../../styles';
import {TokenItem, TokenTitleView} from './components/token';
import {ViewToken} from '.';
import {CollapsibleList} from '../../components/collapsible-list';
import {TokenFoundModal} from './components/token-found-modal';
import {LookingForChains} from './components/looking-for-chains';
import {Gutter} from '../../components/gutter';
import * as ExpoImage from 'expo-image';
import {useNavigation} from '@react-navigation/native';
import {FormattedMessage, useIntl} from 'react-intl';
import {Toggle} from '../../components/toggle';
import {
  InformationModal,
  InformationModalProps,
} from '../../components/modal/infoModal';
import {StackNavProp} from '../../navigation';
import {Secret20Currency} from '@keplr-wallet/types';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const zeroDec = new Dec(0);

export const AvailableTabView: FunctionComponent<{
  search: string;
  isNotReady?: boolean;

  // 초기 유저에게 뜨는 alternative에서 get started 버튼을 누르면 copy address modal을 띄워야된다...
  // 근데 컴포넌트가 분리되어있는데 이거 하려고 context api 쓰긴 귀찮아서 그냥 prop으로 대충 처리한다.
  onClickGetStarted?: () => void;
}> = observer(({search, isNotReady, onClickGetStarted}) => {
  const {hugeQueriesStore, chainStore, uiConfigStore} = useStore();
  const style = useStyle();
  // const navigate = useNavigate();
  const [isOpenTokenFoundModal, setIsOpenTokenFoundModal] = useState(false);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSecretErrorModalOpen, setIsSecretErrorModalOpen] = useState(false);
  const [errorTokenItem, setErrorTokenItem] = useState<ViewToken | null>(null);
  const [infoModalState, setInfoModalState] = useState<InformationModalProps>({
    title: '',
    paragraph: '',
  });
  const intl = useIntl();
  const navigation = useNavigation<StackNavProp>();

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
  const lowBalanceFilteredAllBalancesSearchFiltered =
    hugeQueriesStore.filterLowBalanceTokens(_allBalancesSearchFiltered);

  const allBalancesSearchFiltered =
    uiConfigStore.isHideLowBalance && hasLowBalanceTokens
      ? lowBalanceFilteredAllBalancesSearchFiltered
      : _allBalancesSearchFiltered;

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
  }[] = [
    {
      title: intl.formatMessage({
        id: 'page.main.available.available-balance-title',
      }),
      balance: allBalancesSearchFiltered,
      lenAlwaysShown: 10,
    },
  ];

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
                  itemKind="tokens"
                  title={
                    <TokenTitleView
                      onOpenModal={() => {
                        setIsInfoModalOpen(true);
                        setInfoModalState({
                          title: intl.formatMessage({
                            id: 'page.main.available.available-balance-title',
                          }),
                          paragraph: intl.formatMessage({
                            id: 'page.main.available.available-balance-tooltip',
                          }),
                        });
                      }}
                      title={title}
                      right={
                        hasLowBalanceTokens ? (
                          <React.Fragment>
                            <TouchableWithoutFeedback
                              onPress={() => {
                                uiConfigStore.setHideLowBalance(
                                  !uiConfigStore.isHideLowBalance,
                                );
                              }}>
                              <Text
                                style={style.flatten([
                                  'body2',
                                  'color-gray-300',
                                ])}>
                                <FormattedMessage id="page.main.available.hide-low-balance" />
                              </Text>
                            </TouchableWithoutFeedback>
                            <Gutter size={4} />
                            <Toggle
                              size="small"
                              isOpen={uiConfigStore.isHideLowBalance}
                              setIsOpen={() => {
                                uiConfigStore.setHideLowBalance(
                                  !uiConfigStore.isHideLowBalance,
                                );
                              }}
                              containerStyle={style.flatten(
                                !uiConfigStore.isHideLowBalance
                                  ? [
                                      'background-color-transparent',
                                      'border-width-2',
                                      'border-color-gray-500',
                                      'padding-4',
                                    ]
                                  : [],
                              )}
                              toggleCircleColor={
                                !uiConfigStore.isHideLowBalance
                                  ? style.get('color-gray-400').color
                                  : undefined
                              }
                            />
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
                      onClickError={(errorKind, errorMsg) => {
                        if (errorKind === 'common') {
                          setInfoModalState({
                            title: intl.formatMessage({
                              id: 'page.main.components.error-modal-title',
                            }),
                            paragraph:
                              errorMsg ||
                              'Failed to query response from endpoint. Check again in a few minutes.',
                          });
                          setIsInfoModalOpen(true);
                          return;
                        }
                        setErrorTokenItem(viewToken);
                        setIsSecretErrorModalOpen(true);
                      }}
                      onClick={() => {
                        navigation.navigate({
                          name: 'TokenDetail',
                          params: {
                            chainId: viewToken.chainInfo.chainId,
                            coinMinimalDenom:
                              viewToken.token.currency.coinMinimalDenom,
                          },
                        });
                      }}
                      showPrice24HChange={
                        uiConfigStore.show24HChangesInMagePage
                      }
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
                      'color-gray-400',
                      'subtitle3',
                      'font-bold',
                    ])}>
                    <FormattedMessage id="page.main.available.search-empty-view-title" />
                  </Text>
                  <Text style={style.flatten(['subtitle3', 'color-gray-400'])}>
                    <FormattedMessage id="page.main.available.search-empty-view-paragraph" />
                  </Text>
                </Stack>
              </EmptyView>
            </Box>
          ) : isFirstTime ? (
            <MainEmptyView
              image={
                <ExpoImage.Image
                  style={{width: 100, height: 100}}
                  source={require('../../public/assets/img/main-empty-balance.png')}
                />
              }
              title={intl.formatMessage({
                id: 'page.main.available.empty-view-title',
              })}
              paragraph={intl.formatMessage({
                id: 'page.main.available.empty-view-paragraph',
              })}
              button={
                <Button
                  text={intl.formatMessage({
                    id: 'page.main.available.get-started-button',
                  })}
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
                  onPress={() => setIsOpenTokenFoundModal(true)}
                />
              </YAxis>
            </Box>
          ) : null}
        </React.Fragment>
      )}
      <TokenFoundModal
        isOpen={isOpenTokenFoundModal}
        setIsOpen={setIsOpenTokenFoundModal}
        navigation={navigation}
      />
      <InformationModal
        isOpen={isInfoModalOpen}
        setIsOpen={setIsInfoModalOpen}
        title={infoModalState?.title}
        paragraph={infoModalState?.paragraph}
      />

      <InformationModal
        isOpen={isSecretErrorModalOpen}
        setIsOpen={setIsSecretErrorModalOpen}
        title={intl.formatMessage({
          id: 'page.main.error-modal-title',
        })}
        paragraph={intl.formatMessage({
          id: 'page.main.components.token.wrong-viewing-key-error',
        })}
        bottomButton={
          <Button
            text={intl.formatMessage({
              id: 'page.main.components.secret-error-modal-button',
            })}
            color="secondary"
            onPress={() => {
              setIsSecretErrorModalOpen(false);
              if (errorTokenItem) {
                navigation.navigate('Setting.ManageTokenList.Add', {
                  chainId: errorTokenItem.chainInfo.chainId,
                  contractAddress: (
                    errorTokenItem.token.currency as Secret20Currency
                  ).contractAddress,
                });
              }
            }}
          />
        }
      />
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
    <TouchableWithoutFeedback
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
        <FormattedMessage
          id="page.main.available.new-token-found"
          values={{numFoundToken}}
        />
      </Text>
    </TouchableWithoutFeedback>
  );
};
