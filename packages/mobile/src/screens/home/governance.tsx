import React, { FunctionComponent } from "react";
import { Text, Card } from "react-native-elements";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { parseTime } from "../governance/governance-utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Governance } from "@keplr-wallet/stores";
import { useNavigation } from "@react-navigation/native";
import { StateBadge } from "../governance/state-badge";
import {
  alignItemsCenter,
  caption2,
  fcGrey1,
  flexDirectionRow,
  h6,
  justifyContentBetween,
  mb2,
  mt2,
  sf,
  h5,
  fcHigh,
  bbw1,
  bcGray,
  py3,
  buttonFont2,
  fcGrey4,
  mt3,
  mt4,
} from "../../styles";

export const GovernanceView: FunctionComponent = observer(() => {
  const { queriesStore, chainStore } = useStore();
  const navigation = useNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);
  const governance = queries.cosmos.queryGovernance;

  const lastProposal = governance.proposals[0] || null;

  return (
    <Card containerStyle={mt4}>
      <RectButton
        rippleColor="#AAAAAA"
        onPress={() => {
          navigation.navigate("Governance");
        }}
      >
        <View
          accessible
          style={sf([
            flexDirectionRow,
            justifyContentBetween,
            alignItemsCenter,
            py3,
            bbw1,
            bcGray,
          ])}
        >
          <Text style={sf([h5, fcHigh])}>Governance</Text>
          <Text style={sf([buttonFont2, fcGrey4])}>View All</Text>
        </View>
      </RectButton>

      {lastProposal ? (
        <RectButton
          rippleColor="#AAAAAA"
          onPress={() => {
            navigation.navigate("Governance", {
              screen: "Governance Details",
              params: { proposalId: lastProposal.id },
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
                mt3,
              ])}
            >
              <Text style={h6}>{`#${lastProposal.id}`}</Text>
              <StateBadge proposalStatus={lastProposal.proposalStatus} />
            </View>
            <Text style={h6}>{lastProposal.title}</Text>
            <Text style={sf([fcGrey1, caption2, mt2])}>
              {lastProposal.proposalStatus ===
              Governance.ProposalStatus.DEPOSIT_PERIOD
                ? `Deposit endtime: ${parseTime(
                    lastProposal.raw.deposit_end_time
                  )}`
                : `Voting endtime: ${parseTime(
                    lastProposal.raw.voting_end_time
                  )}`}
            </Text>
          </View>
        </RectButton>
      ) : null}
    </Card>
  );
});
