import React, { FunctionComponent } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StakeScreen } from "./stake-screen";
// import { ValidatorDetailsScreen } from "./validator-details-screen";

const StakeStack = createStackNavigator();

export const StakeStackScreen: FunctionComponent = () => {
  return (
    <StakeStack.Navigator>
      <StakeStack.Screen name="Stake" component={StakeScreen} />
      {/* <StakeStack.Screen name="Details" component={ValidatorDetailsScreen} /> */}
    </StakeStack.Navigator>
  );
};
