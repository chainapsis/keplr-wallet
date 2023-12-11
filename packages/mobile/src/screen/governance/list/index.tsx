import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {RouteProp, useRoute} from '@react-navigation/native';
import {GovernanceNavigation} from '../../../navigation';
import {FlatList, RefreshControl, StyleSheet, Text} from 'react-native';
import {GovernanceCardBody} from '../components/card';
import {useStore} from '../../../stores';
import {ProposalStatus} from '../../../stores/governance/types';
import {GovernanceV1ChainIdentifiers} from '../../../config';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {Gutter} from '../../../components/gutter';
import {EmptyView} from '../../../components/empty-view';
import {FormattedMessage} from 'react-intl';
import {useStyle} from '../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DEFAULT_PARAMS = {
  'pagination.offset': 0,
  'pagination.limit': 20,
};

export const GovernanceListScreen: FunctionComponent = observer(() => {
  const {queriesStore, scamProposalStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<GovernanceNavigation, 'Governance.list'>>();
  const [params, setParams] = useState({page: 0, perPageNumber: 20});
  const {chainId, isGovV1Supported} = route.params;
  const governanceV1 = queriesStore.get(chainId).governanceV1.queryGovernance;
  const governanceLegacy = queriesStore.get(chainId).governance.queryGovernance;
  const isGovV1SupportedRef = useRef(isGovV1Supported || false);
  //NOTE refresh를 했을때에만 자식인 GovernanceCardBody에서 refetch를 해야 되기 때문에 숫자값으로 순차적으로 증가하게 하고
  //무한스크롤에 의해서 렌더링 될경우 다시 refreshing값을 0으로 만들어서 하위 GovernanceCardBody에서
  //refetch 되지 않게 구현함
  const [refreshing, setRefreshing] = useState(0);
  const onRefresh = () => {
    setRefreshing(refreshing + 1);
  };

  const insects = useSafeAreaInsets();

  const governance = (() => {
    if (typeof isGovV1Supported === 'boolean') {
      if (isGovV1Supported) {
        return governanceV1;
      }
      return governanceLegacy;
    }

    if (
      !governanceV1.getQueryGovernance(DEFAULT_PARAMS).isFetching &&
      (GovernanceV1ChainIdentifiers.includes(
        ChainIdHelper.parse(chainId).identifier,
      ) ||
        !(
          (governanceV1.getQueryGovernance(DEFAULT_PARAMS).error?.data as any)
            ?.code === 12
        ))
    ) {
      isGovV1SupportedRef.current = true;
      return governanceV1;
    }

    return governanceLegacy;
  })();

  const {proposals, firstFetching} =
    governance.getQueryGovernanceWithPage(params);

  const sections = useMemo(() => {
    return proposals.filter(
      p =>
        p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD &&
        !scamProposalStore.isScamProposal(chainId, p.id),
    );
  }, [chainId, scamProposalStore, proposals]);

  const loadMore = (page: number) => {
    setParams({
      page: page + 1,
      perPageNumber: 20,
    });
    setRefreshing(0);
  };

  return (
    <FlatList
      data={sections}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
      style={StyleSheet.flatten([
        style.flatten(['padding-x-12']),
        {marginBottom: insects.bottom},
      ])}
      ListHeaderComponent={
        <React.Fragment>
          <Gutter size={12} />
          {/* TODO 나중에 show spam proposal 토글넣어야함 */}
        </React.Fragment>
      }
      keyExtractor={proposal => proposal.id}
      renderItem={({item}) => {
        return (
          <GovernanceCardBody
            chainId={chainId}
            proposal={item}
            isGovV1Supported={isGovV1Supported}
            refreshing={refreshing}
          />
        );
      }}
      ItemSeparatorComponent={() => <Gutter size={12} />}
      onEndReached={() => loadMore(Math.floor(sections.length / 20))}
      onEndReachedThreshold={1}
      ListEmptyComponent={
        firstFetching ? null : (
          <React.Fragment>
            <Gutter size={138} />
            <EmptyView>
              <Text>
                <FormattedMessage id="page.governance.proposal-list.empty-text" />
              </Text>
            </EmptyView>
          </React.Fragment>
        )
      }
    />
  );
});
