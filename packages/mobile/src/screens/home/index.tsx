import React, { FunctionComponent, useLayoutEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button, Card } from "react-native-elements";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { AccountView } from "./account";
import { AssetView } from "./asset";
import { TxButtonView } from "./tx-button";
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

  return (
    <Page>
      <Card>
        <AccountView />
        <AssetView />
        <TxButtonView />
      </Card>
    </Page>
  );
});
