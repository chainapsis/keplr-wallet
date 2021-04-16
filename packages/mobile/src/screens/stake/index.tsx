import React, { FunctionComponent } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StakeScreen } from "./stake-screen";
import { ValidatorDetailsScreen } from "./validator-details-screen";
import { StakedDetailsScreen } from "./staked-details-screen";

const StakeStack = createStackNavigator();

export const StakeStackScreen: FunctionComponent = () => {
  return (
    <StakeStack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <StakeStack.Screen name="Stake" component={StakeScreen} />
      <StakeStack.Screen
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <StakeStack.Screen
        name="Staking Details"
        component={StakedDetailsScreen}
      />
    </StakeStack.Navigator>
  );
};
