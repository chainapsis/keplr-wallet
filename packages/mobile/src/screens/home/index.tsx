import React, { FunctionComponent, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button, Text } from "react-native-elements";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";

const HomeStack = createStackNavigator();

export const HomeStackScreen: FunctionComponent = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
};

const HomeScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/display-name
      headerLeft: () => (
        <Button
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          icon={<Icon name="menu" size={18} />}
          type="clear"
        />
      ),
    });
  }, [navigation]);

  const { chainStore, accountStore, queriesStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const queries = queriesStore.get(chainStore.current.chainId);

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
          navigation.navigate("Send");
        }}
      />
    </Page>
  );
});
