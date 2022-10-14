import { MultisigKey, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, SafeAreaView, View } from "react-native";

import { Button } from "../../../button";
import { LanguagePicker } from "../../../language-picker";
import { useStore } from "../../../stores";
import { InitialBackground } from "../../components/initial-background";
import { ObiModeToggle } from "../../components/obi-mode-toggle";
import ObiLogo from "../../settings/assets/obi-logo.svg";
import { OnboardingStackParamList } from "../onboarding-stack";
import GetStarted from "./assets/get-started.svg";

export type WelcomeProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "welcome"
>;

export const Welcome = observer<WelcomeProps>(({ navigation }) => {
  const {
    demoStore,
    multisigStore,
    settingsStore: { isObi },
  } = useStore();
  const intl = useIntl();

  const renderContinueButton = (keyInRecovery: MultisigKey | null) => {
    let navigationUrl: string;
    let labelId: string;
    switch (keyInRecovery) {
      case "phoneNumber":
        navigationUrl = "create-multisig-phone-number";
        labelId = "recovery.continuephone";
        break;
      case "social":
        navigationUrl = "create-multisig-social";
        labelId = "recovery.continuesocial";
        break;
      default:
        navigationUrl = "create-multisig-biometrics";
        labelId = "onboarding1.getstarted";
    }
    return (
      <Button
        label={intl.formatMessage({ id: labelId })}
        RightIcon={GetStarted}
        flavor="green"
        style={{
          marginTop: 40,
        }}
        onPress={action(() => {
          demoStore.demoMode = false;
          navigation.navigate(navigationUrl);
        })}
      />
    );
  };

  return (
    <InitialBackground disabled={isObi}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 20,
            left: 20,
          }}
        >
          <LanguagePicker />
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <ObiModeToggle>
            {isObi ? (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 40,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ObiLogo width={40} height={40} />
              </View>
            ) : (
              <Image source={require("./assets/loop.png")} />
            )}
          </ObiModeToggle>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 32,
              fontWeight: "600",
              marginTop: 32,
            }}
          >
            {multisigStore.getKeyInRecovery === null ? (
              <FormattedMessage
                id={
                  isObi
                    ? "onboarding1.welcometo.obi"
                    : "onboarding1.welcometo.loop"
                }
                defaultMessage="Welcome to Loop"
              />
            ) : (
              <FormattedMessage
                id="recovery.keyupdate"
                defaultMessage="Update Wallet Keys?"
              />
            )}
          </Text>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 16,
              fontWeight: "400",
              marginTop: 12,
            }}
          >
            {multisigStore.getKeyInRecovery === "phoneNumber" ? (
              <FormattedMessage
                id="recovery.phoneupdate"
                defaultMessage="You're updating your multisig wallet's phone number key."
              />
            ) : multisigStore.getKeyInRecovery === "social" ? (
              <FormattedMessage
                id="recovery.socialupdate"
                defaultMessage="You're updating your multisig wallet's social key."
              />
            ) : !isObi ? (
              <FormattedMessage
                id="onboarding1.welcomesubtext"
                defaultMessage="Loop, powered by Obi, is the world's most powerful wallet for Web3."
              />
            ) : (
              <></>
            )}
          </Text>
          {renderContinueButton(multisigStore.getKeyInRecovery)}
          {/*{multisigStore.getKeyInRecovery === null ? (*/}
          {/*  <Button*/}
          {/*    label={intl.formatMessage({ id: "demo.enter" })}*/}
          {/*    RightIcon={GetStarted}*/}
          {/*    flavor="green"*/}
          {/*    style={{*/}
          {/*      marginTop: 20,*/}
          {/*    }}*/}
          {/*    onPress={action(() => {*/}
          {/*      demoStore.demoMode = true;*/}
          {/*      navigation.navigate("create-multisig-biometrics");*/}
          {/*      Alert.alert(*/}
          {/*        intl.formatMessage({ id: "demo.demomode" }),*/}
          {/*        intl.formatMessage({ id: "demo.info" })*/}
          {/*      );*/}
          {/*    })}*/}
          {/*  />*/}
          {/*) : null}*/}
          {multisigStore.getKeyInRecovery === null ? (
            <Button
              label={intl.formatMessage({ id: "onboarding1.recoverwallet" })}
              RightIcon={GetStarted}
              flavor="blue"
              style={{
                marginTop: 20,
              }}
              onPress={() => {
                Alert.alert(
                  "Recover Existing Wallet",
                  "Only use this if you have made a wallet using the Loop app before.",
                  [
                    {
                      text: "Cancel",
                      // eslint-disable-next-line @typescript-eslint/no-empty-function
                      onPress() {},
                    },
                    {
                      text: "Continue",
                      onPress() {
                        multisigStore.cancelRecovery();
                        multisigStore.recover("biometrics");
                        navigation.navigate("create-multisig-biometrics");
                      },
                    },
                  ]
                );
              }}
            />
          ) : null}
          {multisigStore.getKeyInRecovery === null ? (
            <Button
              label={intl.formatMessage({ id: "onboarding1.recoversinglesig" })}
              RightIcon={GetStarted}
              flavor="blue"
              style={{
                marginTop: 20,
              }}
              onPress={action(() => {
                demoStore.demoMode = false;
                navigation.navigate("recover-singlesig");
              })}
            />
          ) : (
            <Button
              label="Cancel"
              RightIcon={GetStarted}
              flavor="blue"
              style={{
                marginTop: 20,
              }}
              onPress={action(() => {
                multisigStore.cancelRecovery();
              })}
            />
          )}
        </View>
      </SafeAreaView>
    </InitialBackground>
  );
});
