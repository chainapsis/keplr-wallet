import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ScrollView } from "react-native";
import { SafeAreaFixedPage } from "../../components/page";
import { Card } from "../../components/layout";
import { VotingButton } from "./voting-button";
import { Text } from "react-native-elements";
import { View } from "react-native";
import { parseTime } from "./governance-utils";
import { StateBadge } from "./state-badge";
import { useStore } from "../../stores";
import { Governance } from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import {
  alignItemsCenter,
  bcWhiteGrey,
  bgcPrimary,
  body3,
  br1,
  bw1,
  caption1,
  fcLow,
  flex1,
  flexDirectionRow,
  h6,
  h7,
  justifyContentBetween,
  mb1,
  mb2,
  mb3,
  mr2,
  mr3,
  my4,
  p2,
  sf,
} from "../../styles";
import { ProgressBar } from "../../components/svg";

const VotingBox: FunctionComponent<{
  label: string;
  percent: string;
  isLeft?: boolean;
}> = ({ label, percent, isLeft }) => {
  return (
    <View
      style={sf([
        flex1,
        flexDirectionRow,
        alignItemsCenter,
        p2,
        br1,
        bw1,
        bcWhiteGrey,
        isLeft ? mr3 : undefined,
      ])}
    >
      <View style={sf([{ width: 5, height: "100%" }, bgcPrimary, mr2])} />
      <View>
        <Text style={sf([fcLow, caption1])}>{label}</Text>
        <Text>{percent}%</Text>
      </View>
    </View>
  );
};

const VotingGraphView: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const { queriesStore, chainStore } = useStore();

  const chainId = chainStore.current.chainId;
  const queries = queriesStore.get(chainId);

  const governance = queries.cosmos.queryGovernance;

  const proposal = governance.getProposal(proposalId);

  if (!proposal) {
    throw new Error(`Unknown proposal: ${proposalId}`);
  }

  const tally = proposal.tally;

  const total = tally.yes
    .add(tally.no)
    .add(tally.noWithVeto)
    .add(tally.abstain);

  return (
    <View style={my4}>
      <View style={mb3}>
        <View style={sf([flexDirectionRow, justifyContentBetween, mb1])}>
          <Text style={h7}>Turnout</Text>
          <Text style={body3}>
            {proposal.turnout.maxDecimals(2).toString()}%
          </Text>
        </View>
        <ProgressBar
          progress={Number(proposal.turnout.maxDecimals(2).toString())}
        />
      </View>
      <View style={sf([flexDirectionRow, mb2])}>
        <VotingBox
          label="Yes"
          percent={
            tally.yes.toDec().equals(new Dec(0))
              ? "0"
              : tally.yes
                  .quo(total)
                  .maxDecimals(1)
                  .trim(true)
                  .decreasePrecision(2)
                  .toString()
          }
          isLeft
        />
        <VotingBox
          label="No"
          percent={
            tally.no.toDec().equals(new Dec(0))
              ? "0"
              : tally.no
                  .quo(total)
                  .maxDecimals(1)
                  .trim(true)
                  .decreasePrecision(2)
                  .toString()
          }
        />
      </View>
      <View style={flexDirectionRow}>
        <VotingBox
          label="No With Veto"
          percent={
            tally.noWithVeto.toDec().equals(new Dec(0))
              ? "0"
              : tally.noWithVeto
                  .quo(total)
                  .maxDecimals(1)
                  .trim(true)
                  .decreasePrecision(2)
                  .toString()
          }
          isLeft
        />
        <VotingBox
          label="Abstain"
          percent={
            tally.abstain.toDec().equals(new Dec(0))
              ? "0"
              : tally.abstain
                  .quo(total)
                  .maxDecimals(1)
                  .trim(true)
                  .decreasePrecision(2)
                  .toString()
          }
        />
      </View>
    </View>
  );
});

export const ProposalDetailsCard: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const { queriesStore, chainStore } = useStore();

  const chainId = chainStore.current.chainId;
  const queries = queriesStore.get(chainId);

  const governance = queries.cosmos.queryGovernance;

  const proposal = governance.getProposal(proposalId);

  return proposal ? (
    <Card style={[{ paddingBottom: 60 }]}>
      <View
        style={sf([
          flexDirectionRow,
          justifyContentBetween,
          alignItemsCenter,
          mb1,
        ])}
      >
        <Text style={sf([h6])}>{`#${proposal.id}`}</Text>
        <StateBadge proposalStatus={proposal.proposalStatus} />
      </View>
      <Text style={sf([h6, mb2])}>{proposal.title}</Text>
      {proposal.proposalStatus !== Governance.ProposalStatus.DEPOSIT_PERIOD ? (
        <VotingGraphView proposalId={proposalId} />
      ) : null}
      <View style={sf([flexDirectionRow, mb2])}>
        {proposal.proposalStatus ===
        Governance.ProposalStatus.DEPOSIT_PERIOD ? (
          <React.Fragment>
            <View style={flex1}>
              <Text style={sf([h7, mb1])}>Submit Time</Text>
              <Text style={body3}>{parseTime(proposal.raw.submit_time)}</Text>
            </View>
            <View style={flex1}>
              <Text style={sf([h7, mb1])}>Deposit End Time</Text>
              <Text style={body3}>
                {parseTime(proposal.raw.deposit_end_time)}
              </Text>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={flex1}>
              <Text style={sf([h7, mb1])}>Voting Start Time</Text>
              <Text style={body3}>
                {parseTime(proposal.raw.voting_start_time)}
              </Text>
            </View>
            <View style={flex1}>
              <Text style={sf([h7, mb1])}>Voting End Time</Text>
              <Text style={body3}>
                {parseTime(proposal.raw.voting_end_time)}
              </Text>
            </View>
          </React.Fragment>
        )}
      </View>
      <Text style={sf([h7, mb1])}>Description</Text>
      <Text style={body3}>{proposal.raw.content.value.description}</Text>
    </Card>
  ) : (
    // TO DO Loading
    <Text>Loading</Text>
  );
});

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
