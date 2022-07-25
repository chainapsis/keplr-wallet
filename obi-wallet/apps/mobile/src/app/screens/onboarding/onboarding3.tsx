import React from "react";
import { Text } from "@obi-wallet/common";
import { Button, TextInput, TouchableHighlight, View } from "react-native";
import InsuranceLogo from "./assets/insuranceLogo.svg";
import ShieldCheck from "./assets/shield-check.svg";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
//TODO: add background svgs
//TODO: chevron back
export default function onboarding3() {
  return (
    <View
      style={{ backgroundColor: "#1E1E1E", flex: 1, paddingHorizontal: 20 }}
    >
      <View style={{ flex: 4, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#1E1E1E" }}>
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
