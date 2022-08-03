import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { TextInput, TouchableHighlight, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Background from "../components/background";
import InsuranceLogo from "./assets/insuranceLogo.svg";
import ShieldCheck from "./assets/shield-check.svg";
import { StackParamList } from "./stack";

//TODO: add background svgs

export type Onboarding3Props = NativeStackScreenProps<
  StackParamList,
  "onboarding3"
>;

export function Onboarding3({ navigation }: Onboarding3Props) {
  const safeArea = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Background />
      <TouchableHighlight
        style={{ marginTop: safeArea.top }}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
      </TouchableHighlight>
      <View style={{ flex: 4, justifyContent: "flex-end" }}>
        <View style={{}}>
          <InsuranceLogo style={{ marginBottom: 41 }} />
          <View>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 24,
                fontWeight: "600",
                marginBottom: 10,
              }}
            >
              Authenticate Your Keys
            </Text>
            <Text
              style={{
                color: "#999CB6",
                fontSize: 14,
                fontWeight: "400",
                marginBottom: 36,
              }}
            >
              Paste in the address you received.
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 3 }}>
        <TextInput
          placeholder="juno43293rd943f394d294d34qd9r83f"
          placeholderTextColor={"#4B4E6E"}
          style={{
            width: "100%",
            height: 56,
            borderWidth: 1,
            borderColor: "#2F2B4C",
            paddingLeft: 20,
            fontSize: 17,
            fontWeight: "400",
            color: "#F6F5FF",
            borderRadius: 12,
          }}
        />
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 24 }}
        >
          <Text style={{ color: "rgba(246, 245, 255, 0.6);" }}>
            Didn’t receive address?
          </Text>
          <TouchableHighlight
            style={{
              borderColor: "#2F2B4C",
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "#2F2B4C" }}>Resend</Text>
          </TouchableHighlight>
        </View>
      </View>
      <View style={{ flex: 3, justifyContent: "flex-end" }}>
        <TouchableHighlight
          style={{
            backgroundColor: "#59D6E6",
            width: "100%",
            height: 56,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            marginVertical: 20,
            borderRadius: 12,
          }}
          onPress={() => {
            {
              navigation.navigate("onboarding4");
            }
          }}
        >
          <>
            <ShieldCheck style={{ marginRight: 10 }} />
            <Text style={{ color: "#040317", fontSize: 16, fontWeight: "700" }}>
              Verify & proceed
            </Text>
          </>
        </TouchableHighlight>
      </View>
    </View>
  );
}
