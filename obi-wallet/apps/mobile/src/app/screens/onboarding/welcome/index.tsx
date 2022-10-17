import { isMultisigWallet, MultisigKey, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, SafeAreaView, View } from "react-native";

import { Button } from "../../../button";
import { LanguagePicker } from "../../../language-picker";
import { useStore } from "../../../stores";
import {
  AccountPickerModal,
  useAccountPickerModalProps,
} from "../../account-picker-modal";
import { DemoModeToggle } from "../../components/demo-mode-toggle";
import { InitialBackground } from "../../components/initial-background";
import { OnboardingStackParamList } from "../onboarding-stack";
import GetStarted from "./assets/get-started.svg";

export type WelcomeProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "welcome"
>;

export const Welcome = observer<WelcomeProps>(({ navigation }) => {
  const { demoStore, walletsStore } = useStore();
  const wallet = walletsStore.currentWallet;
  const multisigWallet = isMultisigWallet(wallet) ? wallet : null;
  const intl = useIntl();

  const isInRecovery =
    isMultisigWallet(wallet) && wallet.keyInRecovery !== null;

  const accountPickerModalProps = useAccountPickerModalProps();

  return (
    <InitialBackground>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 65,
            left: 20,
          }}
        >
          <LanguagePicker />
        </View>
        <AccountPickerModal {...accountPickerModalProps} />

        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <DemoModeToggle>
            <Image source={require("./assets/loop.png")} />
          </DemoModeToggle>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 32,
              fontWeight: "600",
              marginTop: 32,
            }}
          >
            {renderTitle()}
          </Text>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 16,
              fontWeight: "400",
              marginTop: 12,
            }}
          >
            {renderSubTitle()}
          </Text>
          {renderContinueButton(multisigWallet?.keyInRecovery)}
          {isInRecovery ? null : (
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
                      async onPress() {
                        const wallet =
                          multisigWallet ??
                          (await walletsStore.addMultisigWallet());
                        wallet.cancelRecovery();
                        wallet.recover("biometrics");
                        navigation.navigate("create-multisig-biometrics");
                      },
                    },
                  ]
                );
              }}
            />
          )}
          {isInRecovery ? (
            <Button
              label="Cancel"
              RightIcon={GetStarted}
              flavor="blue"
              style={{
                marginTop: 20,
              }}
              onPress={action(() => {
                multisigWallet?.cancelRecovery();
              })}
            />
          ) : (
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
          )}
        </View>
      </SafeAreaView>
    </InitialBackground>
  );

  function renderTitle() {
    if (isInRecovery) {
      return (
        <FormattedMessage
          id="recovery.keyupdate"
          defaultMessage="Update Wallet Keys?"
        />
      );
    } else {
      return (
        <FormattedMessage
          id="onboarding1.welcometoloop"
          defaultMessage="Welcome to Loop"
        />
      );
    }
  }

  function renderSubTitle() {
    switch (multisigWallet?.keyInRecovery) {
      case "phoneNumber":
        return (
          <FormattedMessage
            id="recovery.phoneupdate"
            defaultMessage="You're updating your multisig wallet's phone number key."
          />
        );
      case "social":
        return (
          <FormattedMessage
            id="recovery.socialupdate"
            defaultMessage="You're updating your multisig wallet's social key."
          />
        );
      default:
        return (
          <FormattedMessage
            id="onboarding1.welcomesubtext"
            defaultMessage="Loop, powered by Obi, is the world's most powerful wallet for Web3."
          />
        );
    }
  }

  function renderContinueButton(keyInRecovery?: MultisigKey | null) {
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
      <View style={{ marginTop: 40 }}>
        {!keyInRecovery && walletsStore.wallets.length > 0 ? (
          <Button
            label={intl.formatMessage({
              id: "onboarding1.login",
              defaultMessage: "Login",
            })}
            RightIcon={GetStarted}
            flavor="green"
            onPress={() => {
              accountPickerModalProps.open();
            }}
          />
        ) : null}
        <Button
          label={intl.formatMessage({ id: labelId })}
          RightIcon={GetStarted}
          flavor="green"
          style={{
            marginTop: 20,
          }}
          onPress={action(async () => {
            if (!multisigWallet) {
              await walletsStore.addMultisigWallet();
            }
            demoStore.demoMode = false;
            navigation.navigate(navigationUrl);
          })}
        />
      </View>
    );
  }
});
