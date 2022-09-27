import { pubkeyType } from "@cosmjs/amino";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBiometricsPublicKey } from "../../../../biometrics";
import { Button, IconButton } from "../../../../button";
import { useStore } from "../../../../stores";
import { Background } from "../../../components/background";
import { OnboardingStackParamList } from "../../onboarding-stack";
import FaceScanner from "./assets/face-scanner.svg";
import Scan from "./assets/scan.svg";

export type MultisigBiometricsProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "create-multisig-biometrics"
>;

export const MultisigBiometrics = observer<MultisigBiometricsProps>(
  ({ navigation }) => {
    const { demoStore, multisigStore } = useStore();
    const [scannedBiometrics, setScannedBiometrics] = useState(false);
    const intl = useIntl();

    const scanBiometrics = async () => {
      setButtonDisabledDoubleclick(true);

      try {
        if (!demoStore.demoMode) {
          const publicKey = await getBiometricsPublicKey();

          multisigStore.setBiometricsPublicKey({
            publicKey: {
              type: pubkeyType.secp256k1,
              value: publicKey,
            },
          });
        }
        setScannedBiometrics(true);
        setButtonDisabledDoubleclick(false);
      } catch (e) {
        setScannedBiometrics(false);
        setButtonDisabledDoubleclick(false);
        const error = e as Error;
        console.error(error);
        Alert.alert(
          intl.formatMessage({ id: "general.error" }) + " ScanMyBiometrics",
          error.message
        );
      }
    };

    useEffect(() => {
      if (demoStore.demoMode) return;

      const { biometrics } = multisigStore.nextAdmin;
      if (biometrics && multisigStore.getKeyInRecovery !== "biometrics") {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding4.error.biometrickeyexists.title",
          }),
          intl.formatMessage({
            id: "onboarding4.error.biometrickeyexists.text",
          }),
          [
            {
              text: intl.formatMessage({
                id: "onboarding4.error.biometrickeyexists.newkey",
              }),
              style: "cancel",
              onPress: () => {
                scanBiometrics();
              },
            },
            {
              text: intl.formatMessage({
                id: "onboarding4.error.biometrickeyexists.yes",
              }),
              onPress: () => {
                navigation.navigate("create-multisig-phone-number");
              },
            },
          ]
        );
      } else {
        scanBiometrics();
      }
    }, [demoStore, intl, multisigStore, navigation]);

    const [buttonDisabledDoubleclick, setButtonDisabledDoubleclick] =
      useState(false);

    const isBiometricsKeyInMultisig = Boolean(
      multisigStore.nextAdmin["biometrics"]
    );

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            <IconButton
              style={{
                marginTop: 20,
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ color: "#7B87A8" }}
              />
            </IconButton>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 57,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(86, 84, 141, 0.07)",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 296,
                  height: 296,
                  borderRadius: 296,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(86, 84, 141, 0.17)",
                    width: 224,
                    height: 224,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 224,
                  }}
                >
                  <FaceScanner />
                </View>
              </View>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: "#F6F5FF",
                marginTop: 79,
              }}
            >
              <FormattedMessage
                id="onboarding4.authyourkeys"
                defaultMessage="Authenticate Your Keys"
              />
            </Text>
            <Text
              style={{
                color: "#999CB6",
                fontSize: 14,
                fontWeight: "400",
                marginTop: 10,
              }}
            >
              <FormattedMessage
                id="onboarding4.authyourkeys.subtext"
                defaultMessage="With Obi, your Biometrics, iCloud, and phone number work as a multi-factor authenticator."
              />
            </Text>
          </View>

          <Button
            label={intl.formatMessage({ id: "onboarding4.biometrics.button" })}
            flavor="blue"
            LeftIcon={Scan}
            onPress={() => {
              if (scannedBiometrics) {
                navigation.navigate("create-multisig-phone-number");
              } else {
                scanBiometrics();
              }
            }}
            disabled={buttonDisabledDoubleclick}
            style={{ marginBottom: 20, marginTop: 20 }}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
);
