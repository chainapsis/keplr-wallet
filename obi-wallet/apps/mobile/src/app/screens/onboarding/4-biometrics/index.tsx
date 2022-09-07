import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBiometricsPublicKey } from "../../../biometrics";
import { Button, IconButton } from "../../../button";
import { useStore } from "../../../stores";
import { Background } from "../../components/background";
import { StackParamList } from "../stack";
import FaceScanner from "./assets/face-scanner.svg";
import Scan from "./assets/scan.svg";

export type BiometricsOnboardingProps = NativeStackScreenProps<
  StackParamList,
  "onboarding4"
>;

export const BiometricsOnboarding = observer<BiometricsOnboardingProps>(
  ({ navigation }) => {
    const { multisigStore } = useStore();

    useEffect(() => {
      const { biometrics } = multisigStore.getNextAdmin("");
      if (biometrics) {
        Alert.alert(
          "You already have a biometrics key",
          `Do you want to reuse your existing biometrics key?`,
          [
            {
              text: "Generate a new key",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                navigation.navigate("onboarding5");
              },
            },
          ]
        );
      }
    }, [multisigStore, navigation]);

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
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
              Authenticate Your Keys
            </Text>
            <Text
              style={{
                color: "#999CB6",
                fontSize: 14,
                fontWeight: "400",
                marginTop: 10,
              }}
            >
              With Obi, your Biometrics, iCloud, and phone number work as a
              multi-factor authenticator.
            </Text>
          </View>

          <Button
            label="Scan My Biometrics"
            flavor="blue"
            LeftIcon={Scan}
            onPress={async () => {
              try {
                const publicKey = await getBiometricsPublicKey();
                multisigStore.setBiometricsPublicKey({ publicKey });
                navigation.navigate("onboarding5");
              } catch (e) {
                console.error(e);
                Alert.alert("Error ScanMyBiometrics", e.message);
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
);
