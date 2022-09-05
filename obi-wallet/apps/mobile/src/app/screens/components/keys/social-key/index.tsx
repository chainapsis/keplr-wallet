import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, IconButton, InlineButton } from "../../../../button";
import { useStore } from "../../../../stores";
import { TextInput } from "../../../../text-input";
import {
  parsePublicKeyTextMessageResponse,
  sendPublicKeyTextMessage,
} from "../../../../text-message";
import { Background } from "../../background";
import { KeyboardAvoidingView } from "../../keyboard-avoiding-view";
import { VerifyAndProceedButton } from "../../phone-number/verify-and-proceed-button";
// import { StackParamList } from "../stack";
import InsuranceLogo from "./assets/insurance-logo.svg";

// export type Onboarding3Props = NativeStackScreenProps<
//   StackParamList,
//   "onboarding3"
// >;

// export function SocialKey({ navigation, route }: Onboarding3Props) {
export function SocialKey() {
  // const { params } = route;

  const { multisigStore } = useStore();
  const [key, setKey] = useState("");

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
                // navigation.goBack();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ color: "#7B87A8" }}
              />
            </IconButton>
            <View style={{ justifyContent: "flex-end", marginTop: 43 }}>
              <View>
                <FontAwesomeIcon icon={faUser} style={{ color: "#7B87A8" }} size={40} />
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 24,
                    fontWeight: "600",
                    marginTop: 32,
                  }}
                >
                  Set your Social Key
                </Text>
                <Text
                  style={{
                    color: "#999CB6",
                    fontSize: 14,
                    marginTop: 10,
                  }}
                >
                  Enter the juno address of a trusted friend who can help you recover your account
                </Text>
              </View>
            </View>
            <TextInput
              placeholder="juno1234...."
              textContentType="oneTimeCode"
              keyboardType="number-pad"
              style={{ marginTop: 25 }}
              value={key}
              onChangeText={setKey}
            />

          </View>
          <View>
            <VerifyAndProceedButton
              onPress={async () => {
                // const publicKey = await parsePublicKeyTextMessageResponse(key);
                // if (publicKey) {
                //   multisigStore.setPhoneNumberKey({
                //     publicKey,
                //     phoneNumber: params.phoneNumber,
                //     securityQuestion: params.securityQuestion,
                //   });
                //   navigation.navigate("onboarding4");
                // }
              }}
            />
            <Button flavor={"blue"} label={"Use OBI Default"} style={{ marginTop: 10 }} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
