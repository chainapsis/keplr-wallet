import React, { FunctionComponent } from "react";
import {
  Card,
  CardDivider,
  CardHeaderFullButton,
} from "../../../components/staging/card";
import { ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { GovernanceCardBody } from "../../governance/staging";
import { useStore } from "../../../stores";
import { ObservableQueryProposal, Governance } from "@keplr-wallet/stores";

export const GovernanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const allProposals = queries.cosmos.queryGovernance.proposals;
  const showingProposals: ObservableQueryProposal[] = [];
  // Assume that the all proposals are descending order.
  // And, show the recent proposals on voting period or deposit period.
  // If, there are no proposals on voting period or deposit period,
  // just show the recent proposal.
  for (let i = 0; i < allProposals.length; i++) {
    const proposal = allProposals[i];
    if (
      proposal.proposalStatus === Governance.ProposalStatus.VOTING_PERIOD ||
      proposal.proposalStatus === Governance.ProposalStatus.DEPOSIT_PERIOD
    ) {
      showingProposals.push(proposal);
    } else {
      break;
    }
  }
  if (showingProposals.length === 0 && allProposals.length > 0) {
    showingProposals.push(allProposals[0]);
  }

  const navigation = useNavigation();

  return (
    <Card style={containerStyle}>
      <CardHeaderFullButton
        title="Governance"
        buttonText="View All"
        onPress={() => {
          navigation.navigate("Others", { screen: "Governance" });
        }}
      />
      <CardDivider />
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
