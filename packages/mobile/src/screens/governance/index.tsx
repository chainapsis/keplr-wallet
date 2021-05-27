/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { SafeAreaFixedPage } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { AllProposals } from "./all-proposals";
import { GovernanceDetailsScreeen } from "./governance-details-screeen";
import { GradientBackground } from "../../components/svg";
import { fcHigh, h3, sf } from "../../styles";

const GovernaceStack = createStackNavigator();

export const GovernanceStackScreen: FunctionComponent = () => {
  return (
    <GovernaceStack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerBackTitleVisible: false,
        headerTitleStyle: sf([h3, fcHigh]),
      }}
    >
      <GovernaceStack.Screen name="Governance" component={GovernanceScreen} />
      <GovernaceStack.Screen
        name="Governance Details"
        component={GovernanceDetailsScreeen}
      />
    </GovernaceStack.Navigator>
  );
};

const GovernanceScreen: FunctionComponent = observer(() => {
  return (
    <SafeAreaFixedPage>
      <AllProposals />
    </SafeAreaFixedPage>
  );
});
