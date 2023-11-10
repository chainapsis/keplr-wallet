import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {RouteProp, useRoute} from '@react-navigation/native';
import {GovernanceNavigation} from '../../../navigation';
import {FlatList} from 'react-native';
import {GovernanceCardBody} from '../components/card';
import {useStore} from '../../../stores';
import {ProposalStatus} from '../../../stores/governance/types';
import {GovernanceV1ChainIdentifiers} from '../../../config';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {Gutter} from '../../../components/gutter';

export const GovernanceListScreen: FunctionComponent = observer(() => {
  const {queriesStore, scamProposalStore} = useStore();

  // const style = useStyle();
  const route = useRoute<RouteProp<GovernanceNavigation, 'Governance.list'>>();
  const {chainId, isGovV1Supported} = route.params;
  const governanceV1 = queriesStore
    .get(chainId)
    .governanceV1.queryGovernance.getQueryGovernance();
  const governanceLegacy = queriesStore.get(chainId).governance.queryGovernance;
  const isGovV1SupportedRef = useRef(isGovV1Supported || false);

  const proposals = (() => {
    //NOTE staking한 체인의 경우 이전페이지에서 isGovV1Supported를 이미 구했기때문에 바로 proposal를 호출
    if (typeof isGovV1Supported === 'boolean') {
      if (isGovV1Supported) {
        return governanceV1.proposals;
      }
      return governanceLegacy.getQueryGovernance().proposals;
    }

    if (governanceV1.isFetching) {
      return [];
    }
    if (
      GovernanceV1ChainIdentifiers.includes(
        ChainIdHelper.parse(chainId).identifier,
      ) ||
      !((governanceV1.error?.data as any)?.code === 12)
    ) {
      isGovV1SupportedRef.current = true;
      return governanceV1.proposals;
    }

    isGovV1SupportedRef.current = false;
    return governanceLegacy.getQueryGovernance().proposals;
  })();

  const sections = useMemo(() => {
    return proposals.filter(
      p =>
        p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD &&
        !scamProposalStore.isScamProposal(chainId, p.id),
    );
  }, [chainId, proposals, scamProposalStore]);

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
    />
  );
});
