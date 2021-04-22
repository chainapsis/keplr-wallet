import React, { FunctionComponent } from "react";
import { StyleProp, View, ViewProps } from "react-native";
import { Text, TextProps } from "react-native-elements";
import { Governance } from "@keplr-wallet/stores";
import { br2, caption2, px3, py1, sf } from "../../styles";

export const StateBadge: FunctionComponent<{
  proposalStatus: Governance.ProposalStatus;
}> = ({ proposalStatus }) => {
  const ProposalStatus = Governance.ProposalStatus;

  const backgroundColor: StyleProp<ViewProps> = (() => {
    switch (proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return { backgroundColor: "#aaedf9" };
      case ProposalStatus.VOTING_PERIOD:
        return { backgroundColor: "#eaecfb" };
      case ProposalStatus.PASSED:
        return { backgroundColor: "#b0eed3" };
      case ProposalStatus.REJECTED:
        return { backgroundColor: "#fdd1da" };
      case ProposalStatus.FAILED:
        return { backgroundColor: "#fdd1da" };
      default:
        return { backgroundColor: "#fdd1da" };
    }
  })();

  const fontColor: StyleProp<TextProps> = (() => {
    switch (proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return { color: "#03acca" };
      case ProposalStatus.VOTING_PERIOD:
        return { color: "#2643e9" };
      case ProposalStatus.PASSED:
        return { color: "#1aae6f" };
      case ProposalStatus.REJECTED:
        return { color: "#f80031" };
      case ProposalStatus.FAILED:
        return { color: "#f80031" };
      default:
        return { color: "#f80031" };
    }
  })();

  const text = (() => {
    switch (proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return "Deposit Period";
      case ProposalStatus.VOTING_PERIOD:
        return "Voting Period";
      case ProposalStatus.PASSED:
        return "Passed";
      case ProposalStatus.REJECTED:
        return "Rejected";
      case ProposalStatus.FAILED:
        return "Failed";
      default:
        return "Unspecified";
    }
  })();

  return (
    <View style={sf([backgroundColor, br2, px3, py1])}>
      <Text style={sf([fontColor, caption2])}>{text}</Text>
    </View>
  );
};
