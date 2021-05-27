import React, { FunctionComponent } from "react";
import { Text } from "react-native-elements";
import { View, FlatList } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { parseTime } from "./governance-utils";
import { ObservableQueryProposal } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { StateBadge } from "./state-badge";
import { Governance } from "@keplr-wallet/stores";
import { useNavigation } from "@react-navigation/native";
import {
  alignItemsCenter,
  bgcWhite,
  caption2,
  cardStyle,
  fcGrey1,
  flexDirectionRow,
  h6,
  justifyContentBetween,
  mb2,
  mt2,
  p4,
  sf,
} from "../../styles";

const ProposalSummary: FunctionComponent<{
  proposal: ObservableQueryProposal;
}> = observer(({ proposal }) => {
  const navigation = useNavigation();

  return (
    <RectButton
      style={sf([cardStyle, p4, bgcWhite])}
      rippleColor="#AAAAAA"
      onPress={() => {
        navigation.navigate("Governance Details", {
          proposalId: proposal.id,
        });
      }}
    >
      <View accessible>
        <View
          style={sf([
            flexDirectionRow,
            justifyContentBetween,
            alignItemsCenter,
            mb2,
          ])}
        >
          <Text style={h6}>{`#${proposal.id}`}</Text>
          <StateBadge proposalStatus={proposal.proposalStatus} />
        </View>
        <Text style={h6}>{proposal.title}</Text>
        <Text style={sf([fcGrey1, caption2, mt2])}>
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
  const governance = queries.cosmos.queryGovernance;

  const proposals = governance.proposals;

  const renderProposal: FunctionComponent<{
    item: ObservableQueryProposal;
  }> = ({ item }) => <ProposalSummary proposal={item} />;
  return (
    <FlatList data={proposals} renderItem={renderProposal} windowSize={5} />
  );
});
