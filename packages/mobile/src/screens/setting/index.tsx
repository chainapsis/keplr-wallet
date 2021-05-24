/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FullFixedPageWithoutPadding } from "../../components/page";
import { mr2 } from "../../styles";
import { GradientBackground } from "../../components/svg";
import { SettingBox, SettingTitle } from "./setting-box";
import FeatherIcon from "react-native-vector-icons/Feather";
import SimpleLineIconsIcon from "react-native-vector-icons/SimpleLineIcons";
import { useStore } from "../../stores";
import { ExportScreen } from "./export-screen";
import { SetKeyRingScreen } from "./key-ring-screen";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { EnrollLockScreen } from "./enroll-lock";
import { useBioAuth } from "../../hooks/bio-auth";

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
            <RectButton
              style={mr2}
              onPress={() => {
                navigation.navigate("Register");
              }}
            >
              <View accessible>
                <FeatherIcon name="plus" size={30} />
              </View>
            </RectButton>
          ),
        }}
        component={SetKeyRingScreen}
      />
      <SettingStack.Screen name="Enroll Lock" component={EnrollLockScreen} />
    </SettingStack.Navigator>
  );
};

export const SettingScreen: FunctionComponent = observer(() => {
  const navigation = useNavigation();
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const bioAuth = useBioAuth();

  return (
    <FullFixedPageWithoutPadding>
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
      <SettingBox
        label="App Lock"
        subText={bioAuth?.usingBioAuth ? "Enrolled" : "Not Enrolled"}
        rightIcon={<SimpleLineIconsIcon name="arrow-right" size={18} />}
        onPress={() => {
          navigation.navigate("Enroll Lock");
        }}
      />
    </FullFixedPageWithoutPadding>
  );
});
