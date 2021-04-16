import React, { FunctionComponent } from "react";
import { Card, Text, Button } from "react-native-elements";
import { View } from "react-native";
import { parseTime } from "./governance-utils";
import { StateBadge } from "./state-badge";
import { BarChart } from "../../components/svg";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { VotingButton } from "./voting-button";
import { Governance } from "@keplr-wallet/stores";

export const ProposalDetailsCard: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const { queriesStore, chainStore } = useStore();

  const chainId = chainStore.current.chainId;
  const queries = queriesStore.get(chainId);

  const governance = queries.getQueryGovernance();

  const proposal = governance.getProposal(proposalId);

  const tally = proposal?.tally;

  return proposal ? (
    <Card containerStyle={{ paddingBottom: 60 }}>
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
      <Text style={{ fontWeight: "700", fontSize: 14, marginBottom: 10 }}>
        {proposal.title}
      </Text>
      {/* {proposal.proposalStatus !== Governance.ProposalStatus.DEPOSIT_PERIOD ? (
        <BarChart
          labels={["Yes", "No", "NoWithVeto", "Abstain"]}
          data={[
            Number(tally?.yes.locale(false).toString()),
            Number(tally?.no.locale(false).toString()),
            Number(tally?.noWithVeto.locale(false).toString()),
            Number(tally?.abstain.locale(false).toString()),
          ]}
          backgroundColors={["#5e72e4", "#fb6340", "#f5365c", "#212529"]}
        />
      ) : null} */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {proposal.proposalStatus ===
        Governance.ProposalStatus.DEPOSIT_PERIOD ? (
          <React.Fragment>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 14, marginBottom: 3 }}
              >
                Submit Time
              </Text>
              <Text>{parseTime(proposal.raw.submit_time)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 14, marginBottom: 3 }}
              >
                Deposit End Time
              </Text>
              <Text>{parseTime(proposal.raw.deposit_end_time)}</Text>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 14, marginBottom: 3 }}
              >
                Voting Start Time
              </Text>
              <Text>{parseTime(proposal.raw.voting_start_time)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 14, marginBottom: 3 }}
              >
                Voting End Time
              </Text>
              <Text>{parseTime(proposal.raw.voting_end_time)}</Text>
            </View>
          </React.Fragment>
        )}
      </View>
      <Text style={{ fontWeight: "600", fontSize: 14, marginBottom: 3 }}>
        Description
      </Text>
      <Text style={{ marginBottom: 10 }}>
        {proposal.raw.content.value.description}
      </Text>
    </Card>
  ) : (
    // TO DO Loading
    <Text> Loading </Text>
  );
});
