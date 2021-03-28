import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button, Text } from "react-native-elements";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

const HomeStack = createStackNavigator();

export const HomeStackScreen: FunctionComponent = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
};

const HomeScreen: FunctionComponent = observer(() => {
  const navigtion = useNavigation();
  const { accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount("secret-2");

  const queries = queriesStore.get("secret-2");

  const delegated = queries
    .getQueryDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries
    .getQueryUnbondingDelegations()
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const stakedSum = delegated.add(unbonding);

  const balances = queries
    .getQueryBalances()
    .getQueryBech32Address(accountInfo.bech32Address);
  const stakable = balances.stakable;

  return (
    <Page>
      <Text h3>Name</Text>
      <Text>{accountInfo.name}</Text>
      <Text h3>Address</Text>
      <Text>{accountInfo.bech32Address}</Text>
      <Text h3>Stakable</Text>
      <Text>{stakable.balance.toString()}</Text>
      <Text h3>Staked</Text>
      <Text>{stakedSum.toString()}</Text>
      <Button
        title="Send"
        onPress={() => {
          navigtion.navigate("Send");
        }}
      />
    </Page>
  );
});
