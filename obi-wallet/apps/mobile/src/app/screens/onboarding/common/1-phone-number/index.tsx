import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { Alert, Image, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "../../../../button";
import { PhoneInput } from "../../../../phone-input";
import { useStore } from "../../../../stores";
import { sendPublicKeyTextMessage } from "../../../../text-message";
import { Background } from "../../../components/background";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../../../components/phone-number/security-question-input";
import { SendMagicSmsButton } from "../../../components/phone-number/send-magic-sms-button";
import { OnboardingStackParamList } from "../../onboarding-stack";

export type MultisigPhoneNumberProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "create-multisig-phone-number"
>;

export const MultisigPhoneNumber = observer<MultisigPhoneNumberProps>(
  ({ navigation }) => {
    const { demoStore, multisigStore } = useStore();
    const intl = useIntl();

    useEffect(() => {
      if (demoStore.demoMode) return;

      const { phoneNumber } = multisigStore.nextAdmin;
      if (phoneNumber && multisigStore.getKeyInRecovery !== "phoneNumber") {
        Alert.alert(
          intl.formatMessage({ id: "onboarding2.error.phonekeyexists.title" }),
          intl.formatMessage({ id: "onboarding2.error.phonekeyexists.text" }) +
            ` ${phoneNumber.phoneNumber}?`,
          [
            {
              text: intl.formatMessage({
                id: "onboarding2.error.phonekeyexists.generatenew",
              }),
              style: "cancel",
            },
            {
              text: intl.formatMessage({
                id: "onboarding2.error.phonekeyexists.yes",
              }),
              onPress: () => {
                navigation.navigate("create-multisig-biometrics");
              },
            },
          ]
        );
      }
    }, [demoStore, intl, multisigStore, navigation]);

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
      if (!securityAnswer) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.securityanswermissing.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.securityanswermissing.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      if (
        // Check length
        securityAnswer.length < minInputCharsSecurityAnswer
      ) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.securityanswertooshort.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.securityanswertooshort.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      if (
        // Check for whitespaces in beginning and end of string
        securityAnswer.startsWith(" ") ||
        securityAnswer.endsWith(" ")
      ) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.securityanswerwhitespaces.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.securityanswerwhitespaces.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      return true;
    };

    const handlePhoneNumber = () => {
      if (!phoneNumberWithoutCountryCode || !phoneCountryCode || !phoneNumber) {
        Alert.alert(
          intl.formatMessage({ id: "onboarding2.error.phonenrmissing.title" }),
          intl.formatMessage({ id: "onboarding2.error.phonenrmissing.text" })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      // Check if phoneNumber has digits only
      const onlyDigitsInPhoneNumber = /^[0-9]+$/.test(
        phoneNumberWithoutCountryCode
      );
      if (!onlyDigitsInPhoneNumber) {
        Alert.alert(
          intl.formatMessage({
            id: "onboarding2.error.phonenrnospecialchars.title",
          }),
          intl.formatMessage({
            id: "onboarding2.error.phonenrnospecialchars.text",
          })
        );
        setMagicButtonDisabledDoubleclick(false);
        return false;
      }

      return true;
    };

    // Function passed down to child component "PhoneInput" as property
    const handlePhoneNumberCountryCode = (countryCode: string) => {
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
                    {multisigStore.getKeyInRecovery === "phoneNumber" ? (
                      <FormattedMessage
                        id="onboarding2.recovery.authyourkeys"
                        defaultMessage="Create a New Phone Number Key"
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding2.authyourkeys"
                        defaultMessage="Create a Phone Number Key"
                      />
                    )}
                  </Text>
                  <Text
                    style={{
                      color: "#999CB6",
                      fontSize: 14,
                      marginTop: 10,
                    }}
                  >
                    {multisigStore.getKeyInRecovery === "phoneNumber" ? (
                      <FormattedMessage
                        id="onboarding2.recovery.authyourkeyssubtext"
                        defaultMessage="Please answer a security question. It can be the same as your old answer, or different."
                      />
                    ) : (
                      <FormattedMessage
                        id="onboarding2.authyourkeyssubtext"
                        defaultMessage="Please answer a security question."
                      />
                    )}
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
                label={intl.formatMessage({ id: "onboarding2.phonenr" })}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder={intl.formatMessage({
                  id: "onboarding2.phonenrlabel",
                })}
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
              description={intl.formatMessage({ id: "onboarding2.bottominfo" })}
              onPress={async () => {
                setMagicButtonDisabledDoubleclick(true);

                const checkSecurityAnswer = await handleSecurityAnswer();
                const checkPhoneNumber = await handlePhoneNumber();

                if (checkSecurityAnswer && checkPhoneNumber) {
                  try {
                    if (!demoStore.demoMode) {
                      await sendPublicKeyTextMessage({
                        phoneNumber,
                        securityAnswer,
                      });
                    }

                    navigation.navigate(
                      "create-multisig-phone-number-confirm",
                      {
                        phoneNumber,
                        securityQuestion,
                        securityAnswer,
                      }
                    );

                    setMagicButtonDisabledDoubleclick(false);
                  } catch (e) {
                    const error = e as Error;
                    setMagicButtonDisabledDoubleclick(false);
                    console.error(error);
                    Alert.alert(
                      intl.formatMessage({
                        id: "onboarding2.error.sendingsmsfailed",
                      }),
                      error.message
                    );
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
  }
);
