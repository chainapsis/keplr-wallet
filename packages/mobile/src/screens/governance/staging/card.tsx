import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { Governance, ObservableQueryProposal } from "@keplr-wallet/stores";
import { Chip } from "../../../components/staging/chip";
import { CardBody } from "../../../components/staging/card";
import { RectButton } from "react-native-gesture-handler";
import { Text, View } from "react-native";
import { LoadingSpinner } from "../../../components/staging/spinner";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
import { dateToLocalString } from "./utils";
import { navigateSmart } from "../../../navigation";

export const GovernanceProposalStatusChip: FunctionComponent<{
  status: Governance.ProposalStatus;
}> = ({ status }) => {
  switch (status) {
    case Governance.ProposalStatus.DEPOSIT_PERIOD:
      return <Chip text="Deposit period" color="primary" mode="outline" />;
    case Governance.ProposalStatus.VOTING_PERIOD:
      return <Chip text="Voting period" color="primary" mode="highlight" />;
    case Governance.ProposalStatus.PASSED:
      return <Chip text="Passed" color="primary" mode="fill" />;
    case Governance.ProposalStatus.REJECTED:
      return <Chip text="Rejected" color="danger" mode="fill" />;
    case Governance.ProposalStatus.FAILED:
      return <Chip text="Failed" color="danger" mode="highlight" />;
    default:
      return <Chip text="Unspecified" color="danger" mode="highlight" />;
  }
};

export const GovernanceCardBody: FunctionComponent<{
  proposalId: string;
}> = observer(({ proposalId }) => {
  const { chainStore, queriesStore } = useStore();

  const navigation = useNavigation();
  const route = useRoute();

  const style = useStyle();

  const intl = useIntl();

  const queries = queriesStore.get(chainStore.current.chainId);
  const queryGovernance = queries.cosmos.queryGovernance;
  const proposal = queryGovernance.getProposal(proposalId);

  const renderProposalDateString = (proposal: ObservableQueryProposal) => {
    switch (proposal.proposalStatus) {
      case Governance.ProposalStatus.DEPOSIT_PERIOD:
        return `Deposit End. ${dateToLocalString(
          intl,
          proposal.raw.deposit_end_time
        )}`;
      case Governance.ProposalStatus.VOTING_PERIOD:
      case Governance.ProposalStatus.FAILED:
      case Governance.ProposalStatus.PASSED:
      case Governance.ProposalStatus.REJECTED:
      case Governance.ProposalStatus.UNSPECIFIED:
        return `Voting End. ${dateToLocalString(
          intl,
          proposal.raw.voting_end_time
        )}`;
    }
  };

  const [current] = useState(() => new Date().getTime());

  // Relative time is not between the end time and actual current time.
  // Relative time is between the end time and "the time that the component is mounted."
  const proposalRelativeEndTimeString = (() => {
    if (!proposal) {
      return "";
    }

    switch (proposal.proposalStatus) {
      case Governance.ProposalStatus.DEPOSIT_PERIOD:
        const relativeDepositEndTime =
          (new Date(proposal.raw.deposit_end_time).getTime() - current) / 1000;
        const relativeDepositEndTimeDays = Math.floor(
          relativeDepositEndTime / (3600 * 24)
        );
        const relativeDepositEndTimeHours = Math.ceil(
          relativeDepositEndTime / 3600
        );

        if (relativeDepositEndTimeDays) {
          return (
            intl
              .formatRelativeTime(relativeDepositEndTimeDays, "days", {
                numeric: "always",
              })
              .replace("in ", "") + " left"
          );
        } else {
          return (
            intl
              .formatRelativeTime(relativeDepositEndTimeHours, "hours", {
                numeric: "always",
              })
              .replace("in ", "") + " left"
          );
        }
      case Governance.ProposalStatus.VOTING_PERIOD:
        const relativeVotingEndTime =
          (new Date(proposal.raw.voting_end_time).getTime() - current) / 1000;
        const relativeVotingEndTimeDays = Math.floor(
          relativeVotingEndTime / (3600 * 24)
        );
        const relativeVotingEndTimeHours = Math.ceil(
          relativeVotingEndTime / 3600
        );

        if (relativeVotingEndTimeDays) {
          return (
            intl
              .formatRelativeTime(relativeVotingEndTimeDays, "days", {
                numeric: "always",
              })
              .replace("in ", "") + " left"
          );
        } else {
          return (
            intl
              .formatRelativeTime(relativeVotingEndTimeHours, "hours", {
                numeric: "always",
              })
              .replace("in ", "") + " left"
          );
        }
      case Governance.ProposalStatus.FAILED:
      case Governance.ProposalStatus.PASSED:
      case Governance.ProposalStatus.REJECTED:
      case Governance.ProposalStatus.UNSPECIFIED:
        return "";
    }
  })();

  return (
    <CardBody style={style.flatten(["padding-0", "overflow-hidden"])}>
      {proposal ? (
        <RectButton
          style={style.flatten(["padding-16"])}
          onPress={() => {
            navigateSmart(route, navigation, "Governance Details", {
              proposalId: proposal.id,
            });
          }}
        >
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "margin-bottom-8",
            ])}
          >
            <Text
              style={style.flatten(["h5", "color-text-black-high"])}
            >{`#${proposal.id}`}</Text>
            <View style={style.flatten(["flex-1"])} />
            <GovernanceProposalStatusChip status={proposal.proposalStatus} />
          </View>
          <View style={style.flatten(["margin-bottom-8"])}>
            <Text style={style.flatten(["h6", "color-text-black-high"])}>
              {proposal.title}
            </Text>
          </View>
          <View style={style.flatten(["flex-row", "items-center"])}>
            <Text
              style={style.flatten(["text-caption1", "color-text-black-low"])}
            >
              {renderProposalDateString(proposal)}
            </Text>
            <View style={style.flatten(["flex-1"])} />
            {proposalRelativeEndTimeString ? (
              <Text
                style={style.flatten([
                  "text-caption1",
                  "color-text-black-medium",
                ])}
              >
                {proposalRelativeEndTimeString}
              </Text>
            ) : null}
          </View>
        </RectButton>
      ) : (
        <View
          style={style.flatten([
            "height-governance-card-body-placeholder",
            "justify-center",
            "items-center",
          ])}
        >
          <LoadingSpinner
            color={style.get("color-loading-spinner").color}
            size={22}
          />
        </View>
      )}
    </CardBody>
  );
});
