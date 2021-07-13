import React, { FunctionComponent } from "react";
import {
  Card,
  CardDivider,
  CardHeaderFullButton,
} from "../../../components/staging/card";
import { ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { GovernanceCardBody } from "../../governance/staging";

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
      <GovernanceCardBody proposalId={"1"} />
    </Card>
  );
});
