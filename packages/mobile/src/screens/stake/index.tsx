/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ValidatorListScreen } from "./validator-list";
import { ValidatorDetailsScreen } from "./validator-details";
import { StakedListScreen } from "./staked-list";
import { DelegateScreen } from "./delegate";
import { GradientBackground } from "../../components/svg";
import { UndelegateScreen } from "./undelegate";
import { RedelegateScreen, RedelegateValidatorScreen } from "./redelegate";

const StakeStack = createStackNavigator();

export const StakeStackScreen: FunctionComponent = () => {
  return (
    <StakeStack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerBackTitleVisible: false,
      }}
    >
      <StakeStack.Screen
        name="Validator List"
        component={ValidatorListScreen}
      />
      <StakeStack.Screen
        name="Validator Details"
        component={ValidatorDetailsScreen}
      />
      <StakeStack.Screen name="Staked List" component={StakedListScreen} />
      <StakeStack.Screen name="Delegate" component={DelegateScreen} />
      <StakeStack.Screen name="Undelegate" component={UndelegateScreen} />
      <StakeStack.Screen name="Redelegate" component={RedelegateScreen} />
      <StakeStack.Screen
        name="Redelegate Validator"
        component={RedelegateValidatorScreen}
      />
    </StakeStack.Navigator>
  );
};
