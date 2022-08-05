import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, IconButton, InlineButton } from "../../../button";
import { TextInput } from "../../../text-input";
import { Background } from "../../components/background";
import { StackParamList } from "../stack";
import InsuranceLogo from "./assets/insurance-logo.svg";
import ShieldCheck from "./assets/shield-check.svg";

export type Onboarding3Props = NativeStackScreenProps<
  StackParamList,
  "onboarding3"
>;

export function Onboarding3({ navigation }: Onboarding3Props) {
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
                Paste in the address you received.
              </Text>
            </View>
          </View>
          <TextInput
            placeholder="juno43293rd943f394d294d34qd9r83f"
            style={{ marginTop: 25 }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
              Didn’t receive address?
            </Text>

            <InlineButton
              label="Resend"
              onPress={() => {
                console.log("Press");
              }}
            />
          </View>
        </View>

        <Button
          label="Verify & Proceed"
          LeftIcon={ShieldCheck}
          flavor="blue"
          onPress={() => {
            navigation.navigate("onboarding4");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
