import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {RouteProp, useRoute} from '@react-navigation/native';
import {GovernanceNavigation} from '../../../navigation';
import {FlatList, Text} from 'react-native';
import {GovernanceCardBody} from '../components/card';
import {useStore} from '../../../stores';
import {ProposalStatus} from '../../../stores/governance/types';
import {GovernanceV1ChainIdentifiers} from '../../../config';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {Gutter} from '../../../components/gutter';
import {EmptyView} from '../../../components/empty-view';
import {FormattedMessage} from 'react-intl';

export const GovernanceListScreen: FunctionComponent = observer(() => {
  const {queriesStore, scamProposalStore} = useStore();

  const route = useRoute<RouteProp<GovernanceNavigation, 'Governance.list'>>();
  const {chainId, isGovV1Supported} = route.params;
  const governanceV1 = queriesStore
    .get(chainId)
    .governanceV1.queryGovernance.getQueryGovernance();
  const governanceLegacy = queriesStore
    .get(chainId)
    .governance.queryGovernance.getQueryGovernance();
  const isGovV1SupportedRef = useRef(isGovV1Supported || false);

  const governance = (() => {
    if (typeof isGovV1Supported === 'boolean') {
      if (isGovV1Supported) {
        return governanceV1;
      }
      return governanceLegacy;
    }

    if (
      !governanceV1.isFetching &&
      (GovernanceV1ChainIdentifiers.includes(
        ChainIdHelper.parse(chainId).identifier,
      ) ||
        !((governanceV1.error?.data as any)?.code === 12))
    ) {
      isGovV1SupportedRef.current = true;
      return governanceV1;
    }

    return governanceLegacy;
  })();

  const sections = useMemo(() => {
    return governance.proposals.filter(
      p =>
        p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD &&
        !scamProposalStore.isScamProposal(chainId, p.id),
    );
  }, [chainId, governance.proposals, scamProposalStore]);

  return (
    <FlatList
      data={sections}
      ListHeaderComponent={
        <React.Fragment>
          <Gutter size={12} />
          {/* TODO 나중에 show spam proposal 토글넣어야함 */}
        </React.Fragment>
      }
      renderItem={({item}) => {
        return (
          <GovernanceCardBody
            isGovV1Supported={isGovV1SupportedRef.current}
            chainId={chainId}
            proposalId={item.id}
          />
        );
      }}
      ItemSeparatorComponent={() => <Gutter size={12} />}
      ListEmptyComponent={
        governance.isFetching ? null : (
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
