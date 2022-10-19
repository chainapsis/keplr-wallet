import { pubkeyType } from "@cosmjs/amino";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { isMultisigDemoWallet, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton, InlineButton } from "../../../../button";
import { useMultisigWallet } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import {
  parsePublicKeyTextMessageResponse,
  sendPublicKeyTextMessage,
} from "../../../../text-message";
import { Background } from "../../../components/background";
import { KeyboardAvoidingView } from "../../../components/keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../../components/phone-number/verify-and-proceed-button";
import { OnboardingStackParamList } from "../../onboarding-stack";
import InsuranceLogo from "./assets/insurance-logo.svg";

export type MultisigPhoneNumberConfirmProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "create-multisig-phone-number-confirm"
>;

export function MultisigPhoneNumberConfirm({
  navigation,
  route,
}: MultisigPhoneNumberConfirmProps) {
  const { params } = route;

  const wallet = useMultisigWallet();
  const [key, setKey] = useState("");

  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
  const [verifyButtonDisabledDoubleclick, setVerifyButtonDisabledDoubleclick] =
    useState(false); // Magic Button disable on button-click

  const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
  const [resendCounter, setResendCounter] = useState(0);
  const [resendButtonHit, setResendButtonHit] = useState(false);

  useEffect(() => {
    if (resendCounter > 0) {
      setResendButtonDisabled(true);
      setTimeout(() => {
        setResendCounter((counter) => counter - 1);
      }, 1000);
    } else {
      setResendButtonDisabled(false);
    }
  }, [resendCounter]);

  const minInputCharsSMSCode = 8;

  useEffect(() => {
    if (key.length >= minInputCharsSMSCode) {
      setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
    } else {
      setVerifyButtonDisabled(true);
      setVerifyButtonDisabledDoubleclick(false);
    }
  }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

  const intl = useIntl();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
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
                  {wallet.keyInRecovery === "phoneNumber" ? (
                    <FormattedMessage
                      id="onboarding2.recovery.authyourkeys"
                      defaultMessage="Create a Replacement Phone Number Key"
                    />
                  ) : wallet.keyInRecovery === "biometrics" ? (
                    <FormattedMessage
                      id="onboarding2.recovery.phonenumber"
                      defaultMessage="Recover your Phone Number Key"
                    />
                  ) : (
                    <FormattedMessage
                      id="onboarding3.authyourkeys"
                      defaultMessage="Authenticate Your Keys"
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
                  <FormattedMessage
                    id="onboarding3.pastereponse"
                    defaultMessage="Paste in the response you received."
                  />
                </Text>
              </View>
            </View>
            <TextInput
              placeholder={intl.formatMessage({
                id: "onboarding3.smscodelabel",
              })}
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              style={{ marginTop: 25 }}
              value={key}
              onChangeText={(e) => {
                const reg = /^\d+$/;
                if (reg.test(e)) {
                  setKey(e);
                }
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
                <FormattedMessage
                  id="onboarding3.noresponselabel"
                  defaultMessage="Didn’t receive a response?"
                />
              </Text>

              <InlineButton
                label={intl.formatMessage({ id: "onboarding3.sendagain" })}
                onPress={async () => {
                  setResendCounter(20);
                  setResendButtonHit(true);

                  setKey("");
                  await sendPublicKeyTextMessage({
                    phoneNumber: params.phoneNumber,
                    securityAnswer: params.securityAnswer,
                    demoMode: isMultisigDemoWallet(wallet),
                  });
                }}
                disabled={resendButtonDisabled}
              />
            </View>

            {resendButtonDisabled && (
              <Text
                style={{
                  color: "rgba(246, 245, 255, 0.6)",
                  fontSize: 12,
                  marginVertical: 10,
                }}
              >
                <FormattedMessage
                  id="onboarding3.sendagain.info.counter"
                  defaultMessage="Your Magic SMS has been resent! Give it some time to arrive. You can try again in "
                />
                &nbsp;{resendCounter} {resendCounter > 0 ? "seconds" : "second"}
                .
              </Text>
            )}

            {resendButtonHit && (
              <Text
                style={{
                  color: "rgba(246, 245, 255, 0.6)",
                  fontSize: 12,
                  marginVertical: 10,
                }}
              >
                <FormattedMessage
                  id="onboarding3.sendagain.info.checknumber"
                  defaultMessage="If you haven't received the SMS please check if your phone number is correct:"
                />
                &nbsp;
                {params.phoneNumber}.
              </Text>
            )}
          </View>
          <View style={{ marginVertical: 20 }}>
            <VerifyAndProceedButton
              onPress={async () => {
                try {
                  setVerifyButtonDisabledDoubleclick(true);
                  const publicKey = await parsePublicKeyTextMessageResponse({
                    key,
                    demoMode: isMultisigDemoWallet(wallet),
                  });
                  if (publicKey) {
                    await wallet.setPhoneNumberKey({
                      publicKey: {
                        type: pubkeyType.secp256k1,
                        value: publicKey,
                      },
                      phoneNumber: params.phoneNumber,
                      securityQuestion: params.securityQuestion,
                    });
                    setVerifyButtonDisabledDoubleclick(false);
                    switch (wallet.keyInRecovery) {
                      case "biometrics":
                        navigation.navigate("lookup-proxy-wallets");
                        break;
                      case "phoneNumber":
                        navigation.navigate("replace-multisig");
                        break;
                      default:
                        navigation.navigate("create-multisig-social");
                    }
                  } else {
                    setVerifyButtonDisabledDoubleclick(false);
                  }
                } catch (e) {
                  const error = e as Error;
                  setVerifyButtonDisabledDoubleclick(false);
                  console.error(error);
                  Alert.alert(
                    "Error VerifyAndProceedButton (2)",
                    error.message
                  );
                }
              }}
              disabled={
                verifyButtonDisabledDoubleclick
                  ? verifyButtonDisabledDoubleclick
                  : verifyButtonDisabled
              }
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
