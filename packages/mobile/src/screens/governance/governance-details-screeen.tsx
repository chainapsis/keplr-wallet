import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ScrollView } from "react-native";
import { ProposalDetailsCard } from "./proposal-details-card";
import { FixedPage } from "../../components/page";
import { VotingButton } from "./voting-button";

export const GovernanceDetailsScreeen: FunctionComponent<{
  route: {
    params: { proposalId: string };
  };
}> = observer(({ route }) => {
  const { proposalId } = route.params;
  return (
    <FixedPage>
      <ScrollView style={{ padding: 10 }}>
        <ProposalDetailsCard proposalId={proposalId} />
      </ScrollView>
      <VotingButton proposalId={proposalId} />
    </FixedPage>
  );
});
