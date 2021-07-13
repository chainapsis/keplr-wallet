import React, { FunctionComponent } from "react";
import {
  Card,
  CardBody,
  CardDivider,
  CardHeaderFullButton,
} from "../../../components/staging/card";
import { Text, View, ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { Chip } from "../../../components/staging/chip";
import { useStyle } from "../../../styles";
import { useStore } from "../../../stores";
import { LoadingSpinner } from "../../../components/staging/spinner";
import { Governance } from "@keplr-wallet/stores";
import { RectButton } from "react-native-gesture-handler";

// TODO: Move this to the governance screen folder.
export const GovernanceCardBody: FunctionComponent<{
  proposalId: number;
}> = observer(({ proposalId }) => {
  const { chainStore, queriesStore } = useStore();

  const style = useStyle();

  const queries = queriesStore.get(chainStore.current.chainId);
  const queryGovernance = queries.cosmos.queryGovernance;
  const proposal = queryGovernance.getProposal(proposalId.toString());

  const renderChip = (status: Governance.ProposalStatus) => {
    switch (status) {
      case Governance.ProposalStatus.DEPOSIT_PERIOD:
        return <Chip text="Deposit period" color="primary" mode="outline" />;
      case Governance.ProposalStatus.VOTING_PERIOD:
        return <Chip text="Voting period" color="primary" mode="highlight" />;
      case Governance.ProposalStatus.PASSED:
        return <Chip text="Passed" color="primary" mode="fill" />;
      case Governance.ProposalStatus.REJECTED:
        return <Chip text="Passed" color="danger" mode="fill" />;
      case Governance.ProposalStatus.FAILED:
        return <Chip text="Failed" color="danger" mode="highlight" />;
      default:
        return <Chip text="Unspecified" color="danger" mode="highlight" />;
    }
  };

  return (
    <CardBody
      style={style.flatten([
        "padding-0",
        "overflow-hidden",
        "border-radius-bottom-left-8",
        "border-radius-bottom-right-8",
      ])}
    >
      {proposal ? (
        <RectButton style={style.flatten(["padding-16"])}>
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
            {renderChip(proposal.proposalStatus)}
          </View>
          <View style={style.flatten(["margin-bottom-8"])}>
            <Text style={style.flatten(["h6", "color-text-black-high"])}>
              {proposal.title}
            </Text>
          </View>
          {/* TODO: Show the voting end time */}
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

export const GovernanceCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const navigation = useNavigation();

  return (
    <Card style={containerStyle}>
      <CardHeaderFullButton
        title="Governance"
        buttonText="View All"
        onPress={() => {
          navigation.navigate("Others", { screen: "Governance" });
        }}
      />
      <CardDivider />
      <GovernanceCardBody proposalId={1} />
    </Card>
  );
});
