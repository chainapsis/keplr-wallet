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
import { PhoneInput } from "../../../phone-input";
import { useStore } from "../../../stores";
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
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] =
    useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    phoneCountryCode + phoneNumberWithoutCountryCode
  );
  const [magicButtonDisabled, setMagicButtonDisabled] = useState(true); // Magic Button disabled by default
  const [magicButtonDisabledDoubleclick, setMagicButtonDisabledDoubleclick] =
    useState(false); // Magic Button disabled on button-click to prevent double-click

  const minInputCharsSecurityAnswer = 3;
  const minInputCharsPhoneNumber = 6;

  useEffect(() => {
    if (
      securityAnswer.length >= minInputCharsSecurityAnswer &&
      phoneNumber.length >= minInputCharsPhoneNumber
    ) {
      setMagicButtonDisabled(false); // Enable Magic Button if checks are okay
    } else {
      setMagicButtonDisabled(true);
    }
  }, [
    magicButtonDisabled,
    setMagicButtonDisabled,
    securityAnswer,
    phoneNumber,
  ]);

  const handleSecurityAnswer = () => {
    if (
      // Check lenght
      securityAnswer.length === 0 ||
      securityAnswer === undefined ||
      securityAnswer === null
    ) {
      Alert.alert(
        "Security answer missing",
        `Please enter your security answer.`
      );
      setMagicButtonDisabledDoubleclick(false);
      return false;
    } else if (
      // Check lenght
      securityAnswer.length < minInputCharsSecurityAnswer
    ) {
      Alert.alert(
        "Security answer too short",
        `Your security answer needs to have at least ${minInputCharsSecurityAnswer} characters.`
      );
      setMagicButtonDisabledDoubleclick(false);
      return false;
    } else if (
      // Check for whitespaces in begging and end of string
      securityAnswer.startsWith(" ") ||
      securityAnswer.endsWith(" ")
    ) {
      Alert.alert(
        "Security answer error",
        `Please remove the whitespaces in the beggining and end of your security answer.`
      );
      setMagicButtonDisabledDoubleclick(false);
      return false;
    } else {
      return true;
    }
  };

  const handlePhoneNumber = () => {
    const onlyDigitsInPhoneNumber = /^[0-9]+$/.test(
      phoneNumberWithoutCountryCode
    );

    if (
      // Check lenght
      phoneNumberWithoutCountryCode.length === 0 ||
      phoneNumberWithoutCountryCode === undefined ||
      phoneNumberWithoutCountryCode === null ||
      phoneCountryCode.length === 0 ||
      phoneCountryCode === undefined ||
      phoneCountryCode === null ||
      phoneNumber.length === 0 ||
      phoneNumber === undefined ||
      phoneNumber === null
    ) {
      Alert.alert("Phone number missing", `Please enter a valid phone number.`);
      setMagicButtonDisabledDoubleclick(false);
      return false;
    } else if (
      // Check if phoneNumber has digits only
      !onlyDigitsInPhoneNumber
    ) {
      Alert.alert(
        "Phone number error",
        `Please enter a valid phone number (international format).`
      );
      setMagicButtonDisabledDoubleclick(false);
      return false;
    } else {
      return true;
    }
  };

  // Function passed down to child component "PhoneInput" as property
  const handlePhoneNumberCountryCode = (countryCode) => {
    setPhoneCountryCode(countryCode);
    setPhoneNumber(phoneCountryCode + phoneNumberWithoutCountryCode);
  };

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

            <PhoneInput
              label="Phone number"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="Type your phone number here"
              style={{ marginTop: 25 }}
              value={phoneNumberWithoutCountryCode}
              onChangeText={(e) => {
                setPhoneNumberWithoutCountryCode(e);
                setPhoneNumber(
                  phoneCountryCode + phoneNumberWithoutCountryCode
                );
              }}
              handlePhoneNumberCountryCode={handlePhoneNumberCountryCode}
            />
          </View>

          <SendMagicSmsButton
            description="Now send your encrypted answer to activate your messaging key."
            onPress={async () => {
              setMagicButtonDisabledDoubleclick(true);

              const checkSecurityAnswer = await handleSecurityAnswer();
              const checkPhoneNumber = await handlePhoneNumber();

              if (checkSecurityAnswer && checkPhoneNumber) {
                try {
                  await sendPublicKeyTextMessage({
                    phoneNumber,
                    securityAnswer,
                  });

                  navigation.navigate("onboarding3", {
                    phoneNumber,
                    securityQuestion,
                    securityAnswer,
                  });

                  setMagicButtonDisabledDoubleclick(false);
                } catch (e) {
                  setMagicButtonDisabledDoubleclick(false);
                  console.error(e);
                  Alert.alert("Sending SMS failed.", e.message);
                }
              } else {
                setMagicButtonDisabledDoubleclick(false);
              }
            }}
            disabled={
              magicButtonDisabledDoubleclick
                ? magicButtonDisabledDoubleclick
                : magicButtonDisabled
            }
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
});
