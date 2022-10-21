import { isAnyMultisigWallet } from "@obi-wallet/common";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import codePush, { LocalPackage } from "react-native-code-push";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

import { RootStack, useRootNavigation } from "../../root-stack";
import { useStore } from "../../stores";
import { Account } from "../account";
import { Create } from "../account/create";
import { isSmallScreenNumber } from "../components/screen-size";
import MultiSigIcon from "./assets/edit.svg";
import HelpAndSupport from "./assets/headset.svg";
import ObiLogo from "./assets/obi-logo.svg";
import LogoutIcon from "./assets/power-red.svg";
import { KeysConfigScreen } from "./keys-config";
import { Seedphrase } from "./seedphrase";

export const SettingsScreen = observer(() => {
  const { walletsStore, settingsStore } = useStore();
  const { isObi } = settingsStore;
  const intl = useIntl();
  const navigation = useRootNavigation();
  const [appMetadata, setAppMetadata] = useState<LocalPackage | null>(null);
  const [timesPressed, setTimesPressed] = useState<number>(0);

  useEffect(() => {
    void (async () => {
      setAppMetadata(await codePush.getUpdateMetadata());
    })();
  }, []);

  const isMultisigWallet = isAnyMultisigWallet(walletsStore.currentWallet);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          marginTop: isSmallScreenNumber(20, 61),
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: isSmallScreenNumber(10, 40),
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            paddingLeft: 0,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 32,
              backgroundColor: "white",
              marginRight: 17,
            }}
            onPress={() => {
              // console.log({ timesPressed, isObi })
              if (timesPressed === 4) {
                settingsStore.toggleObiMode();
                setTimesPressed(0);
                return;
              }
              setTimesPressed((st) => st + 1);
            }}
          >
            <ObiLogo
              style={{
                width: 64,
                height: 64,
              }}
            />
          </TouchableOpacity>

          <View style={{ flexDirection: "column" }}>
            <Text style={styles.heading}>
              Obi {isMultisigWallet ? <>Secure Multisig </> : null}Account
            </Text>
            {/*<Text style={styles.subHeading}>
              Profile picture, name and mail
            </Text>*/}
          </View>
          {/*
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "center", paddingLeft: 20 }}
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              style={styles.chevronRight}
            />
          </TouchableOpacity>
          */}
        </View>
      </View>
      <ScrollView>
        <Setting
          Icon={MultiSigIcon}
          title="Account settings"
          subtitle="Manage accounts & sub-accounts "
          onPress={() => navigation.navigate("AccountsSettings")}
        />

        {isMultisigWallet ? (
          <Setting
            Icon={MultiSigIcon}
            title={intl.formatMessage({
              id: "settings.multigsigsettings",
              defaultMessage: "Key Settings",
            })}
            subtitle={intl.formatMessage({
              id: "settings.multigsigsettings.subtext",
              defaultMessage: "Manage your SMS, social, and other keys.",
            })}
            onPress={() => navigation.navigate("MultiSigSettings")}
          />
        ) : (
          <Setting
            Icon={MultiSigIcon}
            title={intl.formatMessage({
              id: "settings.singlesigsettings",
              defaultMessage: "Seedphrase",
            })}
            subtitle={intl.formatMessage({
              id: "settings.singlesigsettings.subtext",
              defaultMessage: "Export your seedphrase.",
            })}
            onPress={() => navigation.navigate("SingleSigSeedphrase")}
          />
        )}
        <View
          style={[
            styles.flex1,
            styles.separatorContainer,
            { flexDirection: "row" },
          ]}
        >
          <View style={[styles.separator]} />
          <Text style={[styles.separatorText]}>
            <FormattedMessage id="settings.more" defaultMessage="More" />
          </Text>
          <View style={[styles.separator]} />
        </View>
        <Setting
          Icon={HelpAndSupport}
          title={intl.formatMessage({
            id: "settings.helpsupport",
            defaultMessage: "Help & Support",
          })}
          subtitle={intl.formatMessage(
            isObi
              ? {
                id: "settings.helpsupport.subtext.obi",
                defaultMessage: "Contact Obi support.",
              }
              : {
                id: "settings.helpsupport.subtext",
                defaultMessage: "Contact Loop support.",
              }
          )}
          onPress={() =>
            Linking.openURL(
              isObi ? "https://obi.money/contact" : "https://loop.markets/help"
            )
          }
        />

        <Setting
          Icon={LogoutIcon}
          title={intl.formatMessage({
            id: "settings.logout",
            defaultMessage: "Log Out",
          })}
          subtitle={intl.formatMessage({
            id: "settings.logout.subtext",
            defaultMessage: "Save your keys before logging out.",
          })}
          onPress={async () => {
            await walletsStore.logout();
          }}
        />

        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 15,
              }}
            >
              {/*<Text*/}
              {/*  onPress={() => {*/}
              {/*    navigation.navigate("AddSubAccount");*/}
              {/*  }}*/}
              {/*  style={{*/}
              {/*    color: "#F6F5FF",*/}
              {/*    paddingRight: 10,*/}
              {/*    fontSize: 10,*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <FormattedMessage*/}
              {/*    id="settings.terms"*/}
              {/*    defaultMessage="Terms of Service"*/}
              {/*  />*/}
              {/*</Text>*/}
              <Text
                onPress={() => {
                  Linking.openURL("https://mail.loop.onl/privacy-policy/");
                }}
                style={{
                  color: "#F6F5FF",
                  marginLeft: 10,
                  fontSize: 10,
                }}
              >
                <FormattedMessage
                  id="settings.privacy"
                  defaultMessage="Privacy Policy"
                />
              </Text>
            </View>

            <Text
              style={{
                color: "#F6F5FF",
                marginLeft: 10,
                marginBottom: 20,
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Obi {appMetadata?.appVersion} {appMetadata?.label}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

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
    flex: 0,
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
    textTransform: "uppercase",
  },
  heading: {
    color: "#F6F5FF",
    fontSize: isSmallScreenNumber(14, 18),
    fontWeight: "700",
    fontFamily: "Inter",
    paddingBottom: 4,
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
    paddingHorizontal: 10,
  },
});

export const SettingsNavigator = createNativeStackNavigator();

// This can't be a React component because `Stack.Navigator` doesn't want that.
export const settingsScreens = () => {
  return (
    <RootStack.Group>
      <RootStack.Screen
        name="AccountsSettings"
        key="AccountsSettings"
        component={Account}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AddSubAccount"
        key="AddSubAccount"
        component={Create}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MultiSigSettings"
        key="MultiSigSettings"
        component={KeysConfigScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SingleSigSeedphrase"
        key="SingleSigSeedphrase"
        component={Seedphrase}
        options={{ headerShown: false }}
      />
    </RootStack.Group>
  );
};
