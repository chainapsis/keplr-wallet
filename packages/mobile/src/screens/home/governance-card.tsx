import React, { FunctionComponent, useMemo } from "react";
import { Card, CardDivider, CardHeaderFullButton } from "../../components/card";
import { ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { GovernanceCardBody } from "../governance";
import { useStore } from "../../stores";
import { ObservableQueryProposal, Governance } from "@keplr-wallet/stores";
import { useSmartNavigation } from "../../navigation";

export const GovernanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const allProposals = queries.cosmos.queryGovernance.proposals;

  // Assume that the all proposals are descending order.
  // And, show the recent proposals on voting period.
  // If, there are no proposals on voting period,
  // just show the recent proposal with taking precedence to the non deposit period proposal.
  const showingProposals = useMemo(() => {
    let result: ObservableQueryProposal[] = [];
    if (allProposals.length > 0) {
      result = result.concat(
        allProposals.filter(
          (proposal) =>
            proposal.proposalStatus === Governance.ProposalStatus.VOTING_PERIOD
        )
      );

      if (result.length === 0) {
        const nonDepositPeriodProposals = allProposals.filter(
          (proposal) =>
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
