import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Alert, Image, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "../../../button";
import { useStore } from "../../../stores";
import { TextInput } from "../../../text-input";
import { sendPublicKeyTextMessage } from "../../../text-message";
import { Background } from "../../components/background";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../../components/phone-number/security-question-input";
import { SendMagicSmsButton } from "../../components/phone-number/send-magic-sms-button";
import { StackParamList } from "../stack";

export type Onboarding2Props = NativeStackScreenProps<
  StackParamList,
  "onboarding2"
>;

export const Onboarding2 = observer<Onboarding2Props>(({ navigation }) => {
  const { multisigStore } = useStore();

  useEffect(() => {
    const { phoneNumber } = multisigStore.getNextAdmin("");
    if (phoneNumber) {
      Alert.alert(
        "You already have a phone number key",
        `Do you want to reuse your existing phone number key for phone number ${phoneNumber.phoneNumber}?`,
        [
          {
            text: "Generate a new key",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              navigation.navigate("onboarding4");
            },
          },
        ]
      );
    }
  }, [multisigStore, navigation]);

  const {
    securityQuestion,
    setSecurityQuestion,
    securityAnswer,
    setSecurityAnswer,
  } = useSecurityQuestionInput();
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Background />
      <KeyboardAwareScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            flexGrow: 1,
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
                <Image source={require("./assets/phone.png")} />
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
                  Please answer a security question.
                </Text>
              </View>
            </View>

            <SecurityQuestionInput
              securityQuestion={securityQuestion}
              onSecurityQuestionChange={setSecurityQuestion}
              securityAnswer={securityAnswer}
              onSecurityAnswerChange={setSecurityAnswer}
            />

            <TextInput
              label="Phone number"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="Type your phone number here"
              style={{ marginTop: 25 }}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <SendMagicSmsButton
            description="Now send your encrypted answer to activate your messaging key."
            onPress={async () => {
              await sendPublicKeyTextMessage({ phoneNumber, securityAnswer });
              navigation.navigate("onboarding3", {
                phoneNumber,
                securityQuestion,
                securityAnswer,
              });
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
});
