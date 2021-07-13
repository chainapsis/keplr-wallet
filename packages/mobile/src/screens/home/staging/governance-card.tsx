import React, { FunctionComponent } from "react";
import {
  Card,
  CardBody,
  CardDivider,
  CardHeaderFullButton,
} from "../../../components/staging/card";
import { ViewStyle } from "react-native";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";

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
      <CardBody></CardBody>
    </Card>
  );
});
