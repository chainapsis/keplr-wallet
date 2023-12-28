import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {Text, TextInput as NativeTextInput, RefreshControl} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {CoinPretty, PricePretty} from '@keplr-wallet/unit';
import {QueryError} from '@keplr-wallet/stores';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {LayeredHorizontalRadioGroup} from '../../components/radio-group';
import {YAxis} from '../../components/axis';
import {Stack} from '../../components/stack';
import {Column, Columns} from '../../components/column';
import {DepositModal} from './components/deposit-modal/deposit-modal';
import {BuyModal} from './buy-modal';
import {StackActions, useNavigation} from '@react-navigation/native';
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

  const {hugeQueriesStore, priceStore, chainStore, accountStore, queriesStore} =
    useStore();

  const navigation = useNavigation<StackNavProp>();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>('available');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectModalIsOpen, setSelectModalIsOpen] = useState(false);

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

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['padding-x-12', 'padding-y-8'])}
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
        <YAxis alignX="center">
          <LayeredHorizontalRadioGroup
            selectedKey={tabStatus}
            items={[
              {
                key: 'available',
                text: intl.formatMessage({
                  id: 'page.main.available.available-button-title',
                }),
              },
              {
                key: 'staked',
                text: intl.formatMessage({
                  id: 'page.main.staked.staked-button-title',
                }),
              },
            ]}
            onSelect={key => {
              setTabStatus(key as TabStatus);
            }}
            itemMinWidth={92}
            size="large"
            isNotReady={isNotReady}
          />
        </YAxis>
        <Box height={168} alignX="center" alignY="center">
          <Skeleton isNotReady={isNotReady} layer={1} type="button">
            <Text
              style={style.flatten([
                'color-text-low',
                'font-extrabold',
                'font-medium',
                'subtitle2',
              ])}>
              {tabStatus === 'available' ? 'Total Available' : 'Total Staked'}
            </Text>
          </Skeleton>
          <Gutter size={10} />
          <Skeleton
            isNotReady={isNotReady}
            layer={1}
            dummyMinWidth={180}
            type="button">
            <Text style={style.flatten(['color-text-high', 'mobile-h2'])}>
              {tabStatus === 'available'
                ? availableTotalPrice?.toString() || '-'
                : stakedTotalPrice?.toString() || '-'}
            </Text>
          </Skeleton>
        </Box>
        {tabStatus === 'available' ? (
          <Columns sum={1} gutter={10}>
            <Column weight={1}>
              <Skeleton isNotReady={isNotReady} layer={1} type="button">
                <Button
                  text="Deposit"
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
                  text="Buy"
                  size="large"
                  color="secondary"
                  onPress={() => {
                    setIsBuyModalOpen(true);
                  }}
                />
              </Skeleton>
            </Column>

            <Column weight={1}>
              <Skeleton isNotReady={isNotReady} layer={1} type="button">
                <Button
                  text="Send"
                  size="large"
                  onPress={() => {
                    navigation.dispatch({
                      ...StackActions.push('Send.SelectAsset'),
                    });
                  }}
                />
              </Skeleton>
            </Column>
          </Columns>
        ) : (
          <Columns sum={1} gutter={10}>
            <Button
              text="Vote"
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
              text="Stake"
              size="large"
              rightIcon={<StakingIcon size={18} color="white" />}
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                setSelectModalIsOpen(true);
              }}
            />
          </Columns>
        )}

        <ClaimAll isNotReady={isNotReady} />

        {!isNotReady ? (
          <Stack>
            {tabStatus === 'available' ? (
              <SearchTextInput
                ref={searchRef}
                value={search}
                onChange={e => {
                  e.preventDefault();
                  setSearch(e.nativeEvent.text);
                }}
                placeholder="Search for asset or chain (i.e. ATOM, Cosmos)"
              />
            ) : null}
          </Stack>
        ) : null}
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
      </Stack>

      <DepositModal
        isOpen={isDepositModalOpen}
        setIsOpen={setIsDepositModalOpen}
      />
      <BuyModal
        navigation={navigation}
        isOpen={isBuyModalOpen}
        setIsOpen={setIsBuyModalOpen}
      />
    </PageWithScrollView>
  );
});
