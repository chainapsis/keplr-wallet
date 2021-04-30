/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FullPageWithoutPadding } from "../../components/page";
import { mr2 } from "../../styles";
import { GradientBackground } from "../../components/svg";
import { SettingBox, SettingTitle } from "./setting-box";
import FeatherIcon from "react-native-vector-icons/Feather";
import SimpleLineIconsIcon from "react-native-vector-icons/SimpleLineIcons";
import { useStore } from "../../stores";
import { ExportScreen } from "./export-screen";
import { SetKeyRingScreen } from "./key-ring-screen";
import { Button } from "react-native-elements";

const SettingStack = createStackNavigator();

export const SettingStackScreen: FunctionComponent = () => {
  const navigation = useNavigation();

  return (
    <SettingStack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerBackground: () => <GradientBackground />,
      }}
    >
      <SettingStack.Screen name="Setting" component={SettingScreen} />
      <SettingStack.Screen name="Private Key" component={ExportScreen} />
      <SettingStack.Screen
        name="Select Account"
        options={{
          headerRight: () => (
            <Button onPress={() => navigation.navigate("Register")} title="+" />
          ),
        }}
        s
        component={SetKeyRingScreen}
      />
    </SettingStack.Navigator>
  );
};

export const SettingScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  return (
    <FullPageWithoutPadding>
      <SettingBox
        isTop
        leftIcon={<FeatherIcon name="user" style={mr2} size={18} />}
        label={accountInfo.name}
        onPress={() => {
          navigation.navigate("Select Account");
        }}
        rightIcon={<SimpleLineIconsIcon name="arrow-right" size={18} />}
      />
      <SettingTitle title="GENERAL" />
      <SettingBox label="Language" subText="English" isTop />
      <SettingBox label="Currency" subText="USD" />
      <SettingTitle title="SECURITY" />
      <SettingBox
        isTop
        label="View Mnemonic Seed"
        rightIcon={<SimpleLineIconsIcon name="arrow-right" size={18} />}
        onPress={() => {
          navigation.navigate("Private Key");
        }}
      />
    </FullPageWithoutPadding>
  );
});
