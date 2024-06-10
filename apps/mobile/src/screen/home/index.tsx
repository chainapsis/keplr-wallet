import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Text, TextInput as NativeTextInput, RefreshControl} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {CoinPretty, Dec, PricePretty} from '@keplr-wallet/unit';
import {QueryError} from '@keplr-wallet/stores';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {LayeredHorizontalRadioGroup} from '../../components/radio-group';
import {YAxis} from '../../components/axis';
import {Stack} from '../../components/stack';
import {Column, Columns} from '../../components/column';
import {DepositModal} from './components/deposit-modal/deposit-modal';
import {
  DrawerActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {SearchTextInput} from '../../components/input/search-text-input';
import {AvailableTabView} from './available';
import {ChainInfo} from '@keplr-wallet/types';
import {StakedTabView} from './staked';
import {ClaimAll} from './components/claim-all';
import {Box} from '../../components/box';
import {StackNavProp} from '../../navigation';
import {Skeleton} from '../../components/skeleton';
import {StakingIcon} from '../../components/icon/stacking';
import {VoteIcon} from '../../components/icon';
import {useIntl} from 'react-intl';
import {AppUpdateTopLabel} from './app-update';
import {DualChart} from './components/chart';
import {IbcHistoryView} from './components/ibc-history-view';
import {
  UpdateNoteModal,
  UpdateNotePageData,
} from './components/update-note-modal';
import {NewChainModal} from './components/new-chain-modal';

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

type TabStatus = 'available' | 'staked';

export const useIsNotReady = () => {
  const {chainStore, queriesStore} = useStore();
  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;
  return query.response == null && query.error == null;
};

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const searchRef = useRef<NativeTextInput | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, _] = useState(false);
  const intl = useIntl();

  const isNotReady = useIsNotReady();

  const {
    hugeQueriesStore,
    priceStore,
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
  } = useStore();

  const navigation = useNavigation<StackNavProp>();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>('available');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectModalIsOpen, setSelectModalIsOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [isNewChainModalOpen, setIsNewChainModalOpen] = useState(false);

  const hasBalance = (() => {
    if (tabStatus === 'available') {
      const balances = hugeQueriesStore.getAllBalances(true);
      return balances.find(bal => bal.token.toDec().gt(new Dec(0))) != null;
    }
    return false;
  })();

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);
  const availableChartWeight =
    availableTotalPrice && !isNotReady
      ? Number.parseFloat(availableTotalPrice.toDec().toString())
      : 0;

  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (bal.viewToken.price) {
        if (!result) {
          result = bal.viewToken.price;
        } else {
          result = result.add(bal.viewToken.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]);
  const stakedChartWeight =
    stakedTotalPrice && !isNotReady
      ? Number.parseFloat(stakedTotalPrice.toDec().toString())
      : 0;

  const onRefresh = async () => {
    if (isNotReady) {
      return;
    }
    priceStore.fetch();
    if (tabStatus === 'available') {
      for (const chainInfo of chainStore.chainInfosInUI) {
        const account = accountStore.getAccount(chainInfo.chainId);

        if (account.bech32Address === '') {
          continue;
        }
        const queries = queriesStore.get(chainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryBech32Address(
          account.bech32Address,
        );
        const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
          account.bech32Address,
        );
        queryBalance.fetch();
        queryRewards.fetch();
      }
      return;
    }

    for (const chainInfo of chainStore.chainInfosInUI) {
      const account = accountStore.getAccount(chainInfo.chainId);

      if (account.bech32Address === '') {
        continue;
      }
      const queries = queriesStore.get(chainInfo.chainId);
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          account.bech32Address,
        );
      const queryDelegation =
        queries.cosmos.queryDelegations.getQueryBech32Address(
          account.bech32Address,
        );
      queryUnbonding.fetch();
      queryDelegation.fetch();
    }
  };

  useEffect(() => {
    if (uiConfigStore.changelogConfig.showingInfo.length > 0) {
      setIsChangelogModalOpen(true);
    }
  }, [uiConfigStore.changelogConfig.showingInfo.length]);

  useEffect(() => {
    if (uiConfigStore.newChainSuggestionConfig.newSuggestionChains.length > 0) {
      setIsNewChainModalOpen(true);
    }
  }, [uiConfigStore.newChainSuggestionConfig.newSuggestionChains.length]);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['padding-y-8'])}
      refreshControl={
        isNotReady ? undefined : (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={style.get('color-gray-200').color}
          />
        )
      }>
      <Stack gutter={12}>
        <AppUpdateTopLabel isNotReady={isNotReady} />
        <Gutter size={0} />

        <YAxis alignX="center">
          <LayeredHorizontalRadioGroup
            selectedKey={tabStatus}
            items={[
              {
                key: 'available',
                text: intl.formatMessage({
                  id: 'page.main.components.string-toggle.available-tab',
                }),
              },
              {
                key: 'staked',
                text: intl.formatMessage({
                  id: 'page.main.components.string-toggle.staked-tab',
                }),
              },
            ]}
            onSelect={key => {
              setTabStatus(key as TabStatus);
            }}
            itemMinWidth={92}
            isNotReady={isNotReady}
          />
        </YAxis>
        <Box position="relative">
          <DualChart
            first={{
              weight: availableChartWeight,
            }}
            second={{
              weight: stakedChartWeight,
            }}
            highlight={tabStatus === 'available' ? 'first' : 'second'}
            isNotReady={isNotReady}
          />
          <Box
            position="absolute"
            style={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,

              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Gutter size={34} />
            <Skeleton isNotReady={isNotReady} layer={1} type="button">
              <Text
                style={style.flatten([
                  'color-text-low',
                  'font-extrabold',
                  'font-medium',
                  'subtitle2',
                ])}>
                {tabStatus === 'available'
                  ? intl.formatMessage({
                      id: 'page.main.chart.available',
                    })
                  : intl.formatMessage({
                      id: 'page.main.chart.staked',
                    })}
              </Text>
            </Skeleton>
            <Gutter size={10} />
            <Skeleton
              isNotReady={isNotReady}
              layer={1}
              dummyMinWidth={130}
              type="button">
              <Text style={style.flatten(['color-text-high', 'mobile-h2'])}>
                {tabStatus === 'available'
                  ? availableTotalPrice?.toString() || '-'
                  : stakedTotalPrice?.toString() || '-'}
              </Text>
            </Skeleton>
          </Box>
        </Box>

        <Box paddingX={12}>
          {tabStatus === 'available' ? (
            <Columns sum={1} gutter={10}>
              <Column weight={1}>
                <Skeleton isNotReady={isNotReady} layer={1} type="button">
                  <Button
                    text={intl.formatMessage({
                      id: 'page.main.components.buttons.deposit-button',
                    })}
                    size="large"
                    color="secondary"
                    onPress={() => {
                      setIsDepositModalOpen(true);
                    }}
                  />
                </Skeleton>
              </Column>

              <Column weight={1}>
                <Skeleton isNotReady={isNotReady} layer={1} type="button">
                  <Button
                    text={intl.formatMessage({
                      id: 'page.main.components.buttons.send-button',
                    })}
                    size="large"
                    onPress={() => {
                      navigation.dispatch({
                        ...StackActions.push('Send.SelectAsset'),
                      });
                    }}
                    disabled={!hasBalance}
                  />
                </Skeleton>
              </Column>
            </Columns>
          ) : (
            <Columns sum={1} gutter={10}>
              <Button
                text={intl.formatMessage({id: 'button.vote'})}
                size="large"
                color="secondary"
                rightIcon={<VoteIcon />}
                containerStyle={style.flatten(['flex-1'])}
                onPress={() => {
                  //TODO - 거버넌스 페이지로 이동
                  navigation.navigate('Governance', {
                    screen: 'Governance.intro',
                  });
                }}
              />
              <Button
                text={intl.formatMessage({id: 'button.stake'})}
                size="large"
                rightIcon={<StakingIcon size={18} color="white" />}
                containerStyle={style.flatten(['flex-1'])}
                onPress={() => {
                  setSelectModalIsOpen(true);
                }}
              />
            </Columns>
          )}
        </Box>

        <Box paddingX={12}>
          <ClaimAll isNotReady={isNotReady} />
        </Box>

        <Box paddingX={12}>
          <IbcHistoryView isNotReady={isNotReady} />
        </Box>

        {!isNotReady ? (
          <Box paddingX={12}>
            {tabStatus === 'available' ? (
              <SearchTextInput
                ref={searchRef}
                value={search}
                onChange={e => {
                  e.preventDefault();
                  setSearch(e.nativeEvent.text);
                }}
                placeholder={intl.formatMessage({
                  id: 'page.main.search-placeholder',
                })}
              />
            ) : null}
          </Box>
        ) : null}

        <Box paddingX={12}>
          {tabStatus === 'available' ? (
            <AvailableTabView
              search={search}
              isNotReady={isNotReady}
              onClickGetStarted={() => {
                setIsDepositModalOpen(true);
              }}
            />
          ) : (
            <StakedTabView
              selectModalIsOpen={selectModalIsOpen}
              setSelectModalIsOpen={setSelectModalIsOpen}
            />
          )}
        </Box>
      </Stack>

      <DepositModal
        isOpen={isDepositModalOpen}
        setIsOpen={setIsDepositModalOpen}
        navigation={navigation}
      />

      <NewChainModal
        isOpen={isNewChainModalOpen}
        setIsOpen={setIsNewChainModalOpen}
        afterConfirm={() => {
          navigation.dispatch(DrawerActions.toggleDrawer());
        }}
      />

      <UpdateNoteModal
        isOpen={isChangelogModalOpen}
        setIsOpen={(isOpen: boolean) => {
          // close 할 때 1초 뒤에 마지막 정보를 지워준다. 1초를 기다리는 이유는 애니메이션이 끝나기 전에 지우면 애니메이션이 끝나지 않는 문제가 있음.
          if (!isOpen) {
            setTimeout(() => {
              uiConfigStore.changelogConfig.clearLastInfo();
            }, 1000);
          }

          setIsChangelogModalOpen(isOpen);
        }}
        updateNotePageData={(() => {
          const res: UpdateNotePageData[] = [];
          for (const info of uiConfigStore.changelogConfig.showingInfo) {
            for (const scene of info.scenes) {
              res.push({
                title: scene.title,
                image:
                  scene.image && scene.aspectRatio
                    ? {
                        default: scene.image.default,
                        light: scene.image.light,
                        aspectRatio: scene.aspectRatio,
                      }
                    : undefined,
                paragraph: scene.paragraph,
              });
            }
          }

          return res;
        })()}
      />
    </PageWithScrollView>
  );
});
