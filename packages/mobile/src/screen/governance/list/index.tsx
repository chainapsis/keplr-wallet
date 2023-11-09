import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {RouteProp, useRoute} from '@react-navigation/native';
import {GovernanceNavigation} from '../../../navigation';
import {FlatList} from 'react-native';
import {GovernanceCardBody} from '../components/card';
import {useStore} from '../../../stores';
import {ProposalStatus} from '../../../stores/governance/types';

export const GovernanceListScreen: FunctionComponent = observer(() => {
  const {queriesStore} = useStore();

  // const style = useStyle();
  const route = useRoute<RouteProp<GovernanceNavigation, 'Governance.list'>>();
  const {chainId} = route.params;
  const governanceV1 = queriesStore.get(chainId).governanceV1.queryGovernance;
  const governance = queriesStore.get(chainId).governance.queryGovernance;
  const isV1 = useRef(true);

  const proposals = (() => {
    if (governanceV1.isFetching) {
      return [];
    }
    if (
      !governanceV1.isFetching &&
      !((governanceV1.error?.data as any)?.code === 12)
    ) {
      isV1.current = true;
      return governanceV1.proposals;
    }
    isV1.current = false;
    return governance.proposals;
  })();

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
            isV1={isV1.current}
            chainId={chainId}
            proposalId={item.id}
          />
        );
      }}
    />
  );
});
