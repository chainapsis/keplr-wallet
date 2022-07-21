import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../components/page";
import { Platform, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Card, CardBody } from "../../components/card";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { useRoute, RouteProp } from "@react-navigation/native";
import { LoadingSpinner } from "../../components/spinner";
import { Governance } from "@keplr-wallet/stores";
import { GovernanceProposalStatusChip } from "./card";
import { IntPretty } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { dateToLocalString } from "./utils";
import { registerModal } from "../../modals/base";
import { RectButton } from "../../components/rect-button";
import { useSmartNavigation } from "../../navigation";

export const TallyVoteInfoView: FunctionComponent<{
  vote: "yes" | "no" | "abstain" | "noWithVeto";
  percentage: IntPretty;
  highlight?: boolean;
}> = ({ vote, percentage, highlight = false }) => {
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
        return "No with veto";
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
          "border-color-gray-50",
          "dark:border-color-platinum-500",
        ],
        [
          highlight && "background-color-blue-50",
          highlight && "border-color-blue-50",
          highlight && "dark:background-color-platinum-700",
          highlight && "dark:border-color-platinum-700",
        ]
      )}
    >
      <View style={style.flatten(["flex-row", "height-full"])}>
        <View
          style={style.flatten(
            [
              "width-4",
              "background-color-blue-100",
              "dark:background-color-platinum-500",
              "margin-right-8",
            ],
            [highlight && "background-color-blue-400"]
          )}
        />
        <View style={style.flatten(["justify-center"])}>
          <Text
            style={style.flatten(
              ["text-caption1", "color-text-low", "margin-bottom-2"],
              [highlight && "color-text-high"]
            )}
          >
            {text}
          </Text>
          <Text
            style={style.flatten(["text-button3", "color-text-middle"])}
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
              style={style.flatten(["h6", "color-text-high"])}
            >{`#${proposal.id}`}</Text>
            <View style={style.flatten(["flex-1"])} />
            <GovernanceProposalStatusChip status={proposal.proposalStatus} />
          </View>
          <Text
            style={style.flatten(["h6", "color-text-high", "margin-bottom-16"])}
            // Text selection is only supported well in android.
            // In IOS, the whole text would be selected, this process is somewhat strange, so it is disabled in IOS.
            selectable={Platform.OS === "android"}
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
              <Text style={style.flatten(["h7", "color-text-middle"])}>
                Turnout
              </Text>
              <View style={style.flatten(["flex-1"])} />
              <Text
                style={style.flatten(["body3", "color-text-middle"])}
              >{`${proposal.turnout
                .trim(true)
                .maxDecimals(1)
                .toString()}%`}</Text>
            </View>
            <View
              style={style.flatten([
                "height-8",
                "background-color-gray-50",
                "dark:background-color-platinum-500",
                "border-radius-32",
                "overflow-hidden",
              ])}
            >
              <View
                style={StyleSheet.flatten([
                  style.flatten([
                    "height-8",
                    "background-color-blue-400",
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
          <View style={style.flatten(["margin-bottom-24"])}>
            <View style={style.flatten(["flex-row", "margin-bottom-8"])}>
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="yes"
                  percentage={proposal.tallyRatio.yes}
                  highlight={voted === "Yes"}
                />
              </View>
              <View style={style.flatten(["width-12"])} />
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="no"
                  percentage={proposal.tallyRatio.no}
                  highlight={voted === "No"}
                />
              </View>
            </View>
            <View style={style.flatten(["flex-row"])}>
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="noWithVeto"
                  percentage={proposal.tallyRatio.noWithVeto}
                  highlight={voted === "NoWithVeto"}
                />
              </View>
              <View style={style.flatten(["width-12"])} />
              <View style={style.flatten(["flex-1"])}>
                <TallyVoteInfoView
                  vote="abstain"
                  percentage={proposal.tallyRatio.abstain}
                  highlight={voted === "Abstain"}
                />
              </View>
            </View>
          </View>
          <View style={style.flatten(["flex-row", "margin-bottom-24"])}>
            <View style={style.flatten(["flex-1"])}>
              <Text style={style.flatten(["h7", "color-text-middle"])}>
                Voting Start
              </Text>
              <Text
                style={style.flatten([
                  "body3",
                  "color-text-middle",
                  "dark:color-platinum-200",
                ])}
              >
                {dateToLocalString(intl, proposal.raw.voting_start_time)}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <Text style={style.flatten(["h7", "color-text-middle"])}>
                Voting End
              </Text>
              <Text
                style={style.flatten([
                  "body3",
                  "color-text-middle",
                  "dark:color-platinum-200",
                ])}
              >
                {dateToLocalString(intl, proposal.raw.voting_end_time)}
              </Text>
            </View>
          </View>
          <Text
            style={style.flatten([
              "h7",
              "color-text-middle",
              "margin-bottom-4",
            ])}
          >
            Description
          </Text>
          <Text
            style={style.flatten([
              "body3",
              "color-text-middle",
              "dark:color-platinum-200",
            ])}
            // Text selection is only supported well in android.
            // In IOS, the whole text would be selected, this process is somewhat strange, so it is disabled in IOS.
            selectable={Platform.OS === "android"}
          >
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

export const GovernanceVoteModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  proposalId: string;

  // Modal can't use the `useSmartNavigation` hook directly.
  // So need to get the props from the parent.
  smartNavigation: ReturnType<typeof useSmartNavigation>;
}> = registerModal(
  observer(({ proposalId, close, smartNavigation }) => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      analyticsStore,
    } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    const proposal = queries.cosmos.queryGovernance.getProposal(proposalId);

    const style = useStyle();

    const [vote, setVote] = useState<
      "Yes" | "No" | "NoWithVeto" | "Abstain" | "Unspecified"
    >("Unspecified");

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-blue-400",
              "dark:background-color-blue-300",
              "items-center",
              "justify-center",
            ])}
          >
            <View
              style={style.flatten([
                "width-12",
                "height-12",
                "border-radius-32",
                "background-color-white",
              ])}
            />
          </View>
        );
      } else {
        return (
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "border-radius-32",
              "background-color-white",
              "dark:background-color-platinum-600",
              "border-width-1",
              "border-color-gray-100",
              "dark:border-color-platinum-300",
            ])}
          />
        );
      }
    };

    return (
      <View style={style.flatten(["padding-page"])}>
        <View
          style={style.flatten([
            "border-radius-8",
            "overflow-hidden",
            "background-color-white",
            "dark:background-color-platinum-600",
          ])}
        >
          <RectButton
            style={style.flatten(
              [
                "height-64",
                "padding-left-36",
                "padding-right-28",
                "flex-row",
                "items-center",
                "justify-between",
              ],
              [
                vote === "Yes" && "background-color-blue-50",
                vote === "Yes" && "dark:background-color-platinum-500",
              ]
            )}
            onPress={() => setVote("Yes")}
          >
            <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
              Yes
            </Text>
            {renderBall(vote === "Yes")}
          </RectButton>
          <RectButton
            style={style.flatten(
              [
                "height-64",
                "padding-left-36",
                "padding-right-28",
                "flex-row",
                "items-center",
                "justify-between",
              ],
              [
                vote === "No" && "background-color-blue-50",
                vote === "No" && "dark:background-color-platinum-500",
              ]
            )}
            onPress={() => setVote("No")}
          >
            <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
              No
            </Text>
            {renderBall(vote === "No")}
          </RectButton>
          <RectButton
            style={style.flatten(
              [
                "height-64",
                "padding-left-36",
                "padding-right-28",
                "flex-row",
                "items-center",
                "justify-between",
              ],
              [
                vote === "NoWithVeto" && "background-color-blue-50",
                vote === "NoWithVeto" && "dark:background-color-platinum-500",
              ]
            )}
            onPress={() => setVote("NoWithVeto")}
          >
            <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
              No with veto
            </Text>
            {renderBall(vote === "NoWithVeto")}
          </RectButton>
          <RectButton
            style={style.flatten(
              [
                "height-64",
                "padding-left-36",
                "padding-right-28",
                "flex-row",
                "items-center",
                "justify-between",
              ],
              [
                vote === "Abstain" && "background-color-blue-50",
                vote === "Abstain" && "dark:background-color-platinum-500",
              ]
            )}
            onPress={() => setVote("Abstain")}
          >
            <Text style={style.flatten(["subtitle1", "color-text-middle"])}>
              Abstain
            </Text>
            {renderBall(vote === "Abstain")}
          </RectButton>
        </View>
        <Button
          containerStyle={style.flatten(["margin-top-12"])}
          text="Vote"
          size="large"
          disabled={vote === "Unspecified" || !account.isReadyToSendMsgs}
          loading={account.isSendingMsg === "govVote"}
          onPress={async () => {
            if (vote !== "Unspecified" && account.isReadyToSendMsgs) {
              try {
                await account.cosmos.sendGovVoteMsg(
                  proposalId,
                  vote,
                  "",
                  {},
                  {},
                  {
                    onBroadcasted: (txHash) => {
                      analyticsStore.logEvent("Vote tx broadcasted", {
                        chainId: chainStore.current.chainId,
                        chainName: chainStore.current.chainName,
                        proposalId,
                        proposalTitle: proposal?.title,
                      });
                      smartNavigation.pushSmart("TxPendingResult", {
                        txHash: Buffer.from(txHash).toString("hex"),
                      });
                    },
                  }
                );
                close();
              } catch (e) {
                if (e?.message === "Request rejected") {
                  return;
                }
                console.log(e);
                smartNavigation.navigateSmart("Home", {});
              }
            }
          }}
        />
      </View>
    );
  })
);

export const GovernanceDetailsScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

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
  const account = accountStore.getAccount(chainStore.current.chainId);

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageWithScrollView
      backgroundMode="gradient"
      fixed={
        <View
          style={style.flatten(["flex-1", "padding-page"])}
          pointerEvents="box-none"
        >
          <View style={style.flatten(["flex-1"])} pointerEvents="box-none" />
          {!isModalOpen ? (
            <Button
              text={voteText}
              size="large"
              disabled={!voteEnabled || !account.isReadyToSendMsgs}
              onPress={() => {
                setIsModalOpen(true);
              }}
            />
          ) : null}
        </View>
      }
    >
      <GovernanceVoteModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        proposalId={proposalId}
        smartNavigation={smartNavigation}
      />
      <Card style={style.flatten(["margin-top-card-gap"])}>
        <GovernanceDetailsCardBody
          proposalId={proposalId}
          containerStyle={(() => {
            let marginBottom = 0;

            const buttonHeight = style.get("height-button-large").height;
            if (typeof buttonHeight === "string") {
              marginBottom += parseFloat(buttonHeight);
            } else {
              marginBottom += buttonHeight;
            }

            const padding = style.get("padding-page").paddingBottom;
            if (typeof padding === "string") {
              marginBottom += parseFloat(padding);
            } else {
              marginBottom += padding;
            }

            return {
              marginBottom,
            };
          })()}
        />
      </Card>
    </PageWithScrollView>
  );
});
