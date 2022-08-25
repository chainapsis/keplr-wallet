import {
  coins,
  pubkeyToAddress,
  pubkeyType,
  Secp256k1Wallet,
} from "@cosmjs/amino";
import { SigningStargateClient } from "@cosmjs/stargate";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FC } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

import { getBiometricsKeyPair } from "../../biometrics";
import { useStore } from "../../stores";
import { Account } from "../account";
import { Create } from "../account/create";
import { useNavigation } from "../onboarding/stack";
import AccountSettingsIcon from "./assets/banksettings.svg";
import MultiSigIcon from "./assets/edit.svg";
import HelpAndSupport from "./assets/headset.svg";
import LogoutIcon from "./assets/power-red.svg";
import UserImage from "./assets/user.svg";
import { KeysConfigScreen } from "./keys-config";
import { Stack } from "./stack";

export function SettingsScreen() {
  const navigation = useNavigation();
  const { multisigStore } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={
          {
            marginTop: 61,
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10
          }
        }
      >
        <UserImage />
        <View style={{ flex: 1, paddingLeft: 10, justifyContent: "center" }}>
          <Text style={styles.heading}>Farzad morris</Text>
          <Text style={styles.subHeading}>Profile picture, name and mail</Text>
        </View>
        <View>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", paddingLeft: 20 }}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              style={styles.chevronRight}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Setting
        Icon={AccountSettingsIcon}
        title="Account settings"
        subtitle="Manage accounts & sub-accounts "
        onPress={() => navigation.navigate("AccountsSettings")}
      />
      <Setting
        Icon={MultiSigIcon}
        title="Multisig settings"
        subtitle="Manage email, face-id, sms key etc."
        onPress={() => navigation.navigate("MultiSigSettings")}
      />
      <View
        style={[
          styles.flex1,
          styles.separatorContainer,
          { flexDirection: "row" },
        ]}
      >
        <View style={[styles.separator]} />
        <Text style={[styles.separatorText]}>MORE</Text>
        <View style={[styles.separator]} />
      </View>
      <Setting
        Icon={HelpAndSupport}
        title="Help & support"
        subtitle="Any question. We are happy to help "
        onPress={() => Linking.openURL("https://loop.markets/help")}
      />

      <Setting
        Icon={LogoutIcon}
        title="Log out"
        subtitle="Save your keys before logging out"
      />

      <Setting
        Icon={HelpAndSupport}
        title="Fund proxy wallet"
        subtitle="Send some funds from your biometrics wallet"
        onPress={async () => {
          const rcp = "https://rpc.uni.junonetwork.io/";
          const { publicKey, privateKey } = await getBiometricsKeyPair();
          const wallet = await Secp256k1Wallet.fromKey(
            new Uint8Array(Buffer.from(privateKey, "base64")),
            "juno"
          );
          const biometricsAddress = pubkeyToAddress(
            {
              type: pubkeyType.secp256k1,
              value: publicKey,
            },
            "juno"
          );
          const client = await SigningStargateClient.connectWithSigner(
            rcp,
            wallet
          );

          const fee = {
            amount: coins(6000, "ujunox"),
            gas: "200000",
          };

          const result = await client.sendTokens(
            biometricsAddress,
            multisigStore.getProxyAddress(),
            coins(100000, "ujunox"),
            fee,
            ""
          );
          console.log({ result });

          const result2 = await client.sendTokens(
            biometricsAddress,
            multisigStore.getCurrentAdmin("juno").multisig.address,
            coins(100000, "ujunox"),
            fee,
            ""
          );
          console.log({ result2 });
        }}
      />

      <View style={[styles.flex1]}></View>
      <View style={[styles.flex1]}></View>
    </SafeAreaView>
  );
}

interface SettingProps {
  Icon: FC<SvgProps>;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

function Setting({ Icon, title, subtitle, onPress }: SettingProps) {
  return (
    <TouchableOpacity
      style={[styles.flex1, styles.setting]}
      onPress={() => onPress && onPress()}
    >
      <View
        style={{
          padding: 10,
          backgroundColor: "#1D1C37",
          alignSelf: "flex-start",
          borderRadius: 12,
        }}
      >
        <Icon />
      </View>
      <View style={styles.titlesContainer}>
        <Text style={[styles.heading, { fontSize: 14 }]}>{title}</Text>
        <Text style={styles.subHeading}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090817",
    paddingHorizontal: 20,
  },
  setting: {
    backgroundColor: "#111023",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
    marginBottom: 20,
  },
  text: {
    color: "#fff",
  },
  separatorContainer: {
    alignItems: "center",
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#16152B",
    flex: 1,
  },
  separatorText: {
    color: "#787B9C",
    marginHorizontal: 35,
  },
  heading: {
    color: "#F6F5FF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  subHeading: {
    color: "#F6F5FF",
    opacity: 0.6,
    fontSize: 12,
  },
  chevronRight: {
    color: "#3D4661",
  },
  titlesContainer: {
    paddingLeft: 10,
  },
});

export const SettingsNavigator = createNativeStackNavigator();

// This can't be a React component because `Stack.Navigator` doesn't want that.
export const settingsScreens = () => [
  <Stack.Screen
    name="AccountsSettings"
    key="AccountsSettings"
    component={Account}
    options={{ headerShown: false }}
  />,
  <Stack.Screen
    name="AddSubAccount"
    key="AddSubAccount"
    component={Create}
    options={{ headerShown: false }}
  />,
  <Stack.Screen
    name="MultiSigSettings"
    key="MultiSigSettings"
    component={KeysConfigScreen}
    options={{ headerShown: false }}
  />,
];
