import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-elements";
import { Governance } from "@keplr-wallet/stores";

export const StateBadge: FunctionComponent<{
  proposalStatus: Governance.ProposalStatus;
}> = ({ proposalStatus }) => {
  const ProposalStatus = Governance.ProposalStatus;

  const backgroundColor = (() => {
    switch (proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return "#aaedf9";
      case ProposalStatus.VOTING_PERIOD:
        return "#eaecfb";
      case ProposalStatus.PASSED:
        return "#b0eed3";
      case ProposalStatus.REJECTED:
        return "#fdd1da";
      case ProposalStatus.FAILED:
        return "#fdd1da";
      default:
        return "#fdd1da";
    }
  })();

  const textColor = (() => {
    switch (proposalStatus) {
      case ProposalStatus.DEPOSIT_PERIOD:
        return "#03acca";
      case ProposalStatus.VOTING_PERIOD:
        return "#2643e9";
      case ProposalStatus.PASSED:
        return "#1aae6f";
      case ProposalStatus.REJECTED:
        return "#f80031";
      case ProposalStatus.FAILED:
        return "#f80031";
      default:
        return "#f80031";
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
    <View
      style={{
        backgroundColor: backgroundColor,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color: textColor, fontWeight: "600" }}>{text}</Text>
    </View>
  );
};
