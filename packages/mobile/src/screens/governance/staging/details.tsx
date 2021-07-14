import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../components/staging/page";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Card, CardBody, CardDivider } from "../../../components/staging/card";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";
import { useStore } from "../../../stores";
import { useRoute, RouteProp } from "@react-navigation/native";
import { LoadingSpinner } from "../../../components/staging/spinner";
import { Governance } from "@keplr-wallet/stores";
import { GovernanceProposalStatusChip } from "./card";
import { IntPretty } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { dateToLocalString } from "./utils";

export const TallyVoteInfoView: FunctionComponent<{
  vote: "yes" | "no" | "abstain" | "noWithVeto";
  percentage: IntPretty;
  hightlight?: boolean;
}> = ({ vote, percentage, hightlight = false }) => {
  const style = useStyle();

  const text = (() => {
    switch (vote) {
      case "yes":
        return "Yes";
      case "no":
        return "No";
      case "abstain":
        return "Abstain";
      case "noWithVeto":
        return "No With Veto";
    }
  })();

  return (
    <View
      style={style.flatten(
        [
          "height-56",
          "padding-8",
          "border-radius-4",
          "border-width-1",
          "border-color-border-white",
        ],
        [hightlight && "background-color-primary-10"]
      )}
    >
      <View style={style.flatten(["flex-row", "height-full"])}>
        <View
          style={style.flatten([
            "width-4",
            "background-color-primary",
            "margin-right-8",
          ])}
        />
        <View style={style.flatten(["justify-center"])}>
          <Text
            style={style.flatten([
              "text-caption1",
              "color-text-black-low",
              "margin-bottom-2",
            ])}
          >
            {text}
          </Text>
          <Text
            style={style.flatten(["text-button3", "color-text-black-medium"])}
          >{`${percentage.trim(true).maxDecimals(1).toString()}%`}</Text>
        </View>
      </View>
    </View>
  );
};

export const GovernanceDetailsCardBody: FunctionComponent<{
  containerStyle?: ViewStyle;
  proposalId: string;
}> = observer(({ proposalId, containerStyle }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const proposal = queries.cosmos.queryGovernance.getProposal(proposalId);

  const voted = proposal
    ? queries.cosmos.queryProposalVote.getVote(
        proposal.id,
        account.bech32Address
      ).vote
    : undefined;

  const intl = useIntl();

  return (
    <CardBody>
      {proposal ? (
        <View style={containerStyle}>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "margin-bottom-8",
            ])}
          >
            <Text
              style={style.flatten(["h6", "color-text-black-high"])}
            >{`#${proposal.id}`}</Text>
            <View style={style.flatten(["flex-1"])} />
            <GovernanceProposalStatusChip status={proposal.proposalStatus} />
          </View>
          <Text
            style={style.flatten([
              "h6",
              "color-text-black-high",
              "margin-bottom-16",
            ])}
          >
            {proposal.title}
          </Text>
          <View style={style.flatten(["margin-bottom-12"])}>
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "margin-bottom-6",
              ])}
            >
              <Text style={style.flatten(["h7", "color-text-black-medium"])}>
                Turnout
              </Text>
              <View style={style.flatten(["flex-1"])} />
              <Text
                style={style.flatten(["body3", "color-text-black-medium"])}
              >{`${proposal.turnout
                .trim(true)
                .maxDecimals(1)
                .toString()}%`}</Text>
            </View>
            <View
              style={style.flatten([
                "height-8",
                "background-color-border-white",
                "border-radius-32",
                "overflow-hidden",
              ])}
            >
              <View
                style={StyleSheet.flatten([
                  style.flatten([
                    "height-8",
                    "background-color-primary",
                    "border-radius-32",
                  ]),
                  {
                    width: `${parseFloat(
                      proposal.turnout.toDec().toString(1)
                    )}%`,
                  },
                ])}
              />
            </View>
          </View>
          <View>
            <View style={style.flatten(["flex-row", "margin-bottom-8"])}>
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="yes"
                  percentage={proposal.tallyRatio.yes}
                  hightlight={voted === "Yes"}
                />
              </View>
              <View style={style.flatten(["width-12"])} />
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="no"
                  percentage={proposal.tallyRatio.no}
                  hightlight={voted === "No"}
                />
              </View>
            </View>
            <View style={style.flatten(["flex-row"])}>
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="noWithVeto"
                  percentage={proposal.tallyRatio.noWithVeto}
                  hightlight={voted === "NoWithVeto"}
                />
              </View>
              <View style={style.flatten(["width-12"])} />
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="abstain"
                  percentage={proposal.tallyRatio.abstain}
                  hightlight={voted === "Abstain"}
                />
              </View>
            </View>
          </View>
          <CardDivider style={style.flatten(["margin-x-0", "margin-y-16"])} />
          <View style={style.flatten(["flex-row", "margin-bottom-12"])}>
            <View style={style.flatten(["flex-1"])}>
              <Text style={style.flatten(["h7", "color-text-black-medium"])}>
                Voting Start
              </Text>
              <Text style={style.flatten(["body3", "color-text-black-medium"])}>
                {dateToLocalString(intl, proposal.raw.voting_start_time)}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <Text style={style.flatten(["h7", "color-text-black-medium"])}>
                Voting End
              </Text>
              <Text style={style.flatten(["body3", "color-text-black-medium"])}>
                {dateToLocalString(intl, proposal.raw.voting_end_time)}
              </Text>
            </View>
          </View>
          <Text
            style={style.flatten([
              "h7",
              "color-text-black-medium",
              "margin-bottom-4",
            ])}
          >
            Description
          </Text>
          <Text style={style.flatten(["body3", "color-text-black-medium"])}>
            {proposal.description}
          </Text>
        </View>
      ) : (
        <LoadingSpinner
          color={style.flatten(["color-loading-spinner"]).color}
          size={20}
        />
      )}
    </CardBody>
  );
});

export const GovernanceDetailsScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore } = useStore();

  const style = useStyle();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          proposalId: string;
        }
      >,
      string
    >
  >();

  const proposalId = route.params.proposalId;

  const queries = queriesStore.get(chainStore.current.chainId);

  const proposal = queries.cosmos.queryGovernance.getProposal(proposalId);

  const voteEnabled =
    proposal?.proposalStatus === Governance.ProposalStatus.VOTING_PERIOD;

  const voteText = (() => {
    if (!proposal) {
      return "Loading...";
    }
    switch (proposal.proposalStatus) {
      case Governance.ProposalStatus.DEPOSIT_PERIOD:
        return "Vote Not Started";
      case Governance.ProposalStatus.VOTING_PERIOD:
        return "Vote";
      default:
        return "Vote Ended";
    }
  })();

  return (
    <PageWithScrollView
      fixed={
        <View
          style={style.flatten(["flex-1", "padding-12"])}
          pointerEvents="box-none"
        >
          <View style={style.flatten(["flex-1"])} pointerEvents="box-none" />
          <Button text={voteText} size="large" disabled={!voteEnabled} />
        </View>
      }
    >
      <Card style={style.flatten(["margin-bottom-12"])}>
        <GovernanceDetailsCardBody
          proposalId={proposalId}
          containerStyle={{
            marginBottom: style.get("height-button-large").height,
          }}
        />
      </Card>
    </PageWithScrollView>
  );
});
