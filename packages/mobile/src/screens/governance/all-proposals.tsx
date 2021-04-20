import React, { FunctionComponent } from "react";
import { Text, useTheme } from "react-native-elements";
import { View, FlatList, Platform } from "react-native";
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
      style={{
        ...(theme.Card?.containerStyle as Record<string, unknown>),
        padding: 15,
        backgroundColor: "#fff",
        opacity: 0.9,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
          },
          android: {
            elevation: 2,
          },
        }),
      }}
      rippleColor="#AAAAAA"
      onPress={() => {
        navigation.navigate("Governance Details", {
          proposalId: proposal.id,
        });
      }}
    >
      <View accessible>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              lineHeight: 18,
              letterSpacing: 0.4,
            }}
          >{`#${proposal.id}`}</Text>
          <StateBadge proposalStatus={proposal.proposalStatus} />
        </View>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            lineHeight: 18,
            letterSpacing: 0.4,
          }}
        >
          {proposal.title}
        </Text>
        <Text
          style={{
            color: theme.colors?.grey1,
            fontSize: 12,
            lineHeight: 14,
            marginTop: 6,
          }}
        >
          {proposal.proposalStatus === Governance.ProposalStatus.DEPOSIT_PERIOD
            ? `Deposit endtime: ${parseTime(proposal.raw.deposit_end_time)}`
            : `Voting endtime: ${parseTime(proposal.raw.voting_end_time)}`}
        </Text>
      </View>
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
