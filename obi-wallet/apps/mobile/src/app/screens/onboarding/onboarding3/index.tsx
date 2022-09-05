import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, InlineButton } from "../../../button";
import { useStore } from "../../../stores";
import { TextInput } from "../../../text-input";
import {
  parsePublicKeyTextMessageResponse,
  sendPublicKeyTextMessage,
} from "../../../text-message";
import { Background } from "../../components/background";
import { KeyboardAvoidingView } from "../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../components/phone-number/verify-and-proceed-button";
import { StackParamList } from "../stack";
import InsuranceLogo from "./assets/insurance-logo.svg";

export type Onboarding3Props = NativeStackScreenProps<
  StackParamList,
  "onboarding3"
>;

export function Onboarding3({ navigation, route }: Onboarding3Props) {
  const { params } = route;

  const { multisigStore } = useStore();
  const [key, setKey] = useState("");

  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
  const [verifyButtonDisabledDoubleclick, setVerifyButtonDisabledDoubleclick] =
    useState(false); // Magic Button disable on button-click

  const minInputCharsSMSCode = 8;

  useEffect(() => {
    if (key.length >= minInputCharsSMSCode) {
      setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
    } else {
      setVerifyButtonDisabled(true);
      setVerifyButtonDisabledDoubleclick(false);
    }
  }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
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
            <View style={{ justifyContent: "flex-end", marginTop: 43 }}>
              <View>
                <InsuranceLogo />
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 24,
                    fontWeight: "600",
                    marginTop: 32,
                  }}
                >
                  Authenticate Your Keys
                </Text>
                <Text
                  style={{
                    color: "#999CB6",
                    fontSize: 14,
                    marginTop: 10,
                  }}
                >
                  Paste in the response you received.
                </Text>
              </View>
            </View>
            <TextInput
              placeholder="8-Digits SMS-Code"
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              style={{ marginTop: 25 }}
              value={key}
              onChangeText={setKey}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
                Didn’t receive a response?
              </Text>

              <InlineButton
                label="Resend"
                onPress={async () => {
                  setKey("");
                  await sendPublicKeyTextMessage({
                    phoneNumber: params.phoneNumber,
                    securityAnswer: params.securityAnswer,
                  });
                }}
              />
            </View>
          </View>

          <VerifyAndProceedButton
            onPress={async () => {
              try {
                setVerifyButtonDisabledDoubleclick(true);
                const publicKey = await parsePublicKeyTextMessageResponse(key);
                if (publicKey) {
                  multisigStore.setPhoneNumberKey({
                    publicKey,
                    phoneNumber: params.phoneNumber,
                    securityQuestion: params.securityQuestion,
                  });
                  setVerifyButtonDisabledDoubleclick(false);
                  navigation.navigate("onboarding4");
                } else {
                  setVerifyButtonDisabledDoubleclick(false);
                }
              } catch (e) {
                setVerifyButtonDisabledDoubleclick(false);
                console.error(e);
                Alert.alert("Error VerifyAndProceedButton (2)", e.message);
              }
            }}
            disabled={
              verifyButtonDisabledDoubleclick
                ? verifyButtonDisabledDoubleclick
                : verifyButtonDisabled
            }
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
