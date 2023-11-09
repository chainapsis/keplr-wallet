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

export const GovernanceListScreen: FunctionComponent = observer(() => {
  const {queriesStore, scamProposalStore} = useStore();

  // const style = useStyle();
  const route = useRoute<RouteProp<GovernanceNavigation, 'Governance.list'>>();
  const {chainId, isGovV1Supported} = route.params;
  const governanceV1 = queriesStore
    .get(chainId)
    .governanceV1.queryGovernance.getQueryGovernance();
  const governance = queriesStore.get(chainId).governance.queryGovernance;
  const isGovV1SupportedRef = useRef(isGovV1Supported || false);

  const proposals = (() => {
    //NOTE staking한 체인의 경우 이전페이지에서 isGovV1Supported를 이미 구했기때문에 바로 proposal를 호출
    if (typeof isGovV1Supported === 'boolean') {
      if (isGovV1Supported) {
        return governanceV1.proposals;
      }
      return governance.getQueryGovernance().proposals;
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
    return governance.getQueryGovernance().proposals;
  })().filter(
    proposal => !scamProposalStore.isScamProposal(chainId, proposal.id),
  );

  const sections = useMemo(() => {
    // .filter(
    //   proposal =>
    //     !scamProposalStore.isScamProposal(
    //       chainStore.current.chainId,
    //       proposal.id,
    //     ),
    // );

    return proposals.filter(
      p => p.proposalStatus !== ProposalStatus.DEPOSIT_PERIOD,
    );
  }, [proposals]);

  return (
    <FlatList
      data={sections}
      renderItem={({item}) => {
        return (
          <GovernanceCardBody
            isGovV1Supported={isGovV1SupportedRef.current}
            chainId={chainId}
            proposalId={item.id}
          />
        );
      }}
    />
  );
});
