/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { Text } from "react-native-elements";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FullPage } from "../../components/page";
import { Button, WhiteButton } from "../../components/buttons";
import {
  alignItemsCenter,
  flex1,
  h1,
  justifyContentCenter,
  sf,
} from "../../styles";
import { View } from "react-native";
import { GradientBackground } from "../../components/svg";
import {
  GenerateMnemonicScreen,
  VerifyMnemonicScreen,
  RecoverMnemonicScreen,
} from "./mnemonic";

const RegisterStack = createStackNavigator();

export const RegisterStackScreen: FunctionComponent = () => {
  return (
    <RegisterStack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerTitle: "",
        headerBackground: () => <GradientBackground />,
      }}
    >
      <RegisterStack.Screen name="Register" component={RegisterScreen} />
      <RegisterStack.Screen name="Sign in" component={RecoverMnemonicScreen} />
      <RegisterStack.Screen
        name="New account"
        component={GenerateMnemonicScreen}
      />
      <RegisterStack.Screen
        name="Verify account"
        component={VerifyMnemonicScreen}
      />
    </RegisterStack.Navigator>
  );
};

export const RegisterScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  return (
    <FullPage>
      <View style={flex1} />
      <View style={sf([flex1, justifyContentCenter, alignItemsCenter])}>
        <Text style={h1}>Keplr</Text>
      </View>
      <View style={flex1} />
      <View style={flex1} />
      <View style={flex1} />
      <View style={flex1} />
      <View style={flex1}>
        <WhiteButton
          title="Import Existing Account"
          onPress={() => {
            navigation.navigate("Sign in");
          }}
        />
        <Button
          title="Create New Account"
          onPress={() => {
            navigation.navigate("New account");
          }}
        />
      </View>
      <View style={flex1} />
      <View style={flex1} />
    </FullPage>
  );
});
