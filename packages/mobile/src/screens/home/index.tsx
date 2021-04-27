/* eslint-disable react/display-name */
import React, { FunctionComponent, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button as RNButton, Card } from "react-native-elements";
import { SafeAreaPage } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { AccountView } from "./account";
import { AssetView } from "./asset";
import { TxButtonView } from "./tx-button";
import { GradientBackground } from "../../components/svg";
import { Button } from "../../components/buttons";
const HomeStack = createStackNavigator();

export const HomeStackScreen: FunctionComponent = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{ headerBackground: () => <GradientBackground /> }}
    >
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
        <RNButton
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          icon={<Icon name="menu" size={18} />}
          type="clear"
        />
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaPage>
      <Card>
        <AccountView />
        <AssetView />
        <TxButtonView />
      </Card>
      <Card>
        <Button
          title="Stake"
          onPress={() => {
            navigation.navigate("Stake");
          }}
        />
      </Card>
      <Card>
        <Button
          title="Governance"
          onPress={() => {
            navigation.navigate("Governance");
          }}
        />
      </Card>
    </SafeAreaPage>
  );
});
