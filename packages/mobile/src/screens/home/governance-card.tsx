import React, { FunctionComponent, useMemo } from "react";
import { Card, CardDivider, CardHeaderFullButton } from "../../components/card";
import { ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { GovernanceCardBody } from "../governance";
import { useStore } from "../../stores";
import {
  ObservableQueryProposal,
  Governance,
  ObservableQueryProposalV1,
} from "@keplr-wallet/stores";
import { useSmartNavigation } from "../../navigation";
import { GovernanceV1ChainIdentifiers } from "../../config";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const GovernanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore, scamProposalStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const isGovernanceV1 = GovernanceV1ChainIdentifiers.includes(
    ChainIdHelper.parse(chainStore.current.chainId).identifier
  );
  const proposalQuery = isGovernanceV1
    ? queries.cosmos.queryGovernanceV1.proposals
    : queries.cosmos.queryGovernance.proposals;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // proposalQuery 의 형식은 _DeepReadonlyArray<ObservableQueryProposal> | _DeepReadonlyArray<ObservableQueryProposalV1>이다
  // _DeepReadonlyArray를 유니온 한 타입은 filter를 사용했을 때 타입이 제대로 유추되지 않는다. any로 추론된다.
  const allProposals = proposalQuery.filter(
    (proposal: ObservableQueryProposal | ObservableQueryProposalV1) =>
      !scamProposalStore.isScamProposal(chainStore.current.chainId, proposal.id)
  );

  // Assume that the all proposals are descending order.
  // And, show the recent proposals on voting period.
  // If, there are no proposals on voting period,
  // just show the recent proposal with taking precedence to the non deposit period proposal.
  const showingProposals = useMemo(() => {
    let result: (ObservableQueryProposal | ObservableQueryProposalV1)[] = [];
    if (allProposals.length > 0) {
      result = result.concat(
        allProposals.filter(
          (proposal: ObservableQueryProposal | ObservableQueryProposalV1) =>
            proposal.proposalStatus === Governance.ProposalStatus.VOTING_PERIOD
        )
      );

      if (result.length === 0) {
        const nonDepositPeriodProposals = allProposals.filter(
          (proposal: ObservableQueryProposal | ObservableQueryProposalV1) =>
            proposal.proposalStatus !== Governance.ProposalStatus.DEPOSIT_PERIOD
        );
        if (nonDepositPeriodProposals.length > 0) {
          result.push(nonDepositPeriodProposals[0]);
        } else {
          result.push(allProposals[0]);
        }
      }
    }
    return result;
  }, [allProposals]);

  const smartNavigation = useSmartNavigation();

  return (
    <Card style={containerStyle}>
      <CardHeaderFullButton
        title="Governance"
        onPress={() => {
          smartNavigation.navigateSmart("Governance", undefined);
        }}
      />
      {/* TODO: Show the alternative component if any proposals don't exist */}
      {showingProposals.map((proposal, i) => {
        return (
          <React.Fragment key={proposal.id}>
            <GovernanceCardBody proposalId={proposal.id} />
            {showingProposals.length - 1 !== i ? <CardDivider /> : null}
          </React.Fragment>
        );
      })}
    </Card>
  );
});
