import React, { FunctionComponent } from "react";
import { Card, Text, useTheme } from "react-native-elements";
import { View, FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { parseTime } from "./governance-utils";
import { ObservableQueryProposal } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StateBadge } from "./state-badge";
import { Governance } from "@keplr-wallet/stores";
import { useNavigation } from "@react-navigation/native";

const ProposalSummary: FunctionComponent<{
  proposal: ObservableQueryProposal;
}> = observer(({ proposal }) => {
  const navigation = useNavigation();

  const { theme } = useTheme();

  return (
    <RectButton
      rippleColor="#AAAAAA"
      onPress={() => {
        navigation.navigate("Governance Details", {
          proposalId: proposal.id,
        });
      }}
    >
      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            style={{ fontWeight: "700", fontSize: 14 }}
          >{`#${proposal.id}`}</Text>
          <StateBadge proposalStatus={proposal.proposalStatus} />
        </View>
        <Text style={{ fontWeight: "700", fontSize: 14 }}>
          {proposal.title}
        </Text>
        <Text
          style={{ color: theme.colors?.grey1, fontSize: 11, marginTop: 6 }}
        >
          {proposal.proposalStatus === Governance.ProposalStatus.DEPOSIT_PERIOD
            ? `Deposit End Time: ${parseTime(proposal.raw.deposit_end_time)}`
            : `Voting End Time: ${parseTime(proposal.raw.voting_end_time)}`}
        </Text>
      </Card>
    </RectButton>
  );
});

export const AllProposals: FunctionComponent = observer(() => {
  const { queriesStore, chainStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);
  const governance = queries.getQueryGovernance();

  const proposals = governance.proposals;

  const renderProposal: FunctionComponent<{
    item: ObservableQueryProposal;
  }> = ({ item }) => <ProposalSummary proposal={item} />;
  return (
    <FlatList data={proposals} renderItem={renderProposal} windowSize={5} />
  );
});
