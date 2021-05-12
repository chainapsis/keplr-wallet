import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ScrollView } from "react-native";
import { ProposalDetailsCard } from "./proposal-details-card";
import { SafeAreaFixedPage } from "../../components/page";
import { VotingButton } from "./voting-button";

export const GovernanceDetailsScreeen: FunctionComponent<{
  route: {
    params: { proposalId: string };
  };
}> = observer(({ route }) => {
  const { proposalId } = route.params;
  return (
    <SafeAreaFixedPage>
      <ScrollView>
        <ProposalDetailsCard proposalId={proposalId} />
      </ScrollView>
      <VotingButton proposalId={proposalId} />
    </SafeAreaFixedPage>
  );
});
