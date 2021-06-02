import React, { FunctionComponent } from "react";
import { Text } from "react-native-elements";
import moment from "moment";
import { CardWithoutPadding } from "../../components/layout";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { parseTime } from "../governance/governance-utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Governance } from "@keplr-wallet/stores";
import { useNavigation } from "@react-navigation/native";
import { StateBadge } from "../governance/state-badge";
import EntypoIcon from "react-native-vector-icons/Entypo";
import {
  alignItemsCenter,
  caption2,
  flexDirectionRow,
  h6,
  justifyContentBetween,
  mb2,
  mt2,
  sf,
  h5,
  fcHigh,
  bbw1,
  buttonFont2,
  mt4,
  p4,
  px4,
  pt4,
  pb3,
  caption1,
  bcWhiteGrey,
  fcLow,
} from "../../styles";

export const GovernanceView: FunctionComponent = observer(() => {
  const { queriesStore, chainStore } = useStore();
  const navigation = useNavigation();

  const queries = queriesStore.get(chainStore.current.chainId);
  const governance = queries.cosmos.queryGovernance;

  const lastProposal = governance.proposals[0] || null;

  return (
    <CardWithoutPadding style={[mt4]}>
      <RectButton
        rippleColor="#AAAAAA"
        onPress={() => {
          navigation.navigate("Governance");
        }}
      >
        <View accessible style={sf([px4, pt4])}>
          <View
            style={sf([
              flexDirectionRow,
              justifyContentBetween,
              alignItemsCenter,
              bbw1,
              bcWhiteGrey,
              pb3,
            ])}
          >
            <Text style={sf([h5, fcHigh])}>Governance</Text>
            <View
              style={sf([
                flexDirectionRow,
                justifyContentBetween,
                alignItemsCenter,
              ])}
            >
              <Text style={sf([buttonFont2, fcLow])}>View All</Text>
              <EntypoIcon name="chevron-right" size={22} color="#C6C6CD" />
            </View>
          </View>
        </View>
      </RectButton>
      {lastProposal ? (
        <RectButton
          rippleColor="#AAAAAA"
          onPress={() => {
            navigation.navigate("Governance Details", {
              proposalId: lastProposal.id,
            });
          }}
        >
          <View accessible style={p4}>
            <View
              style={sf([
                flexDirectionRow,
                justifyContentBetween,
                alignItemsCenter,
                mb2,
              ])}
            >
              <Text style={h6}>{`#${lastProposal.id}`}</Text>
              <StateBadge proposalStatus={lastProposal.proposalStatus} />
            </View>
            <Text style={h6}>{lastProposal.title}</Text>
            <View
              style={sf([
                flexDirectionRow,
                justifyContentBetween,
                alignItemsCenter,
                mt2,
              ])}
            >
              <Text style={sf([fcLow, caption2])}>
                {lastProposal.proposalStatus ===
                Governance.ProposalStatus.DEPOSIT_PERIOD
                  ? `Deposit endtime: ${parseTime(
                      lastProposal.raw.deposit_end_time
                    )}`
                  : `Voting endtime: ${parseTime(
                      lastProposal.raw.voting_end_time
                    )}`}
              </Text>
              <Text style={sf([caption1])}>
                {lastProposal.proposalStatus ===
                Governance.ProposalStatus.DEPOSIT_PERIOD
                  ? moment(lastProposal.raw.deposit_end_time).diff(
                      moment(),
                      "days"
                    )
                  : moment(lastProposal.raw.voting_end_time).diff(
                      moment(),
                      "days"
                    )}
              </Text>
            </View>
          </View>
        </RectButton>
      ) : null}
    </CardWithoutPadding>
  );
});
