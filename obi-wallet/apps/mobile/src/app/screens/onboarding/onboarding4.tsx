import React from "react";
import { Text } from "@obi-wallet/common";
import { TextInput, TouchableHighlight, View } from "react-native";
import FaceScaner from "./assets/face-scanner.svg";
import Scan from "./assets/scan.svg";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
//TODO: chevron back
//TODO: add background svgs
//TODO: sheild check icon

export default function onboarding4() {
  return (
    <View
      style={{ backgroundColor: "#1E1E1E", flex: 1, paddingHorizontal: 20 }}
    >
      <View style={{ flex: 5, justifyContent: "center", alignItems: "center" }}>
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
            <FaceScaner />
          </View>
        </View>
      </View>
      <View style={{ flex: 3, justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "600", color: "#F6F5FF" }}>
            Authenticate your keys
          </Text>
          <Text style={{ color: "#999CB6", fontSize: 14, fontWeight: "400" }}>
            With Obi, your face ID, icloud, and phone number work as a
            multi-factor authtnticator
          </Text>
        </View>
        <TouchableHighlight
          style={{
            backgroundColor: "#59D6E6",
            width: "100%",
            height: 56,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            marginVertical: 40,
            borderRadius: 12,
          }}
        >
          <>
            <Scan style={{ marginRight: 10 }} />
            <Text style={{ color: "#040317", fontSize: 16, fontWeight: "700" }}>
              Scan my face
            </Text>
          </>
        </TouchableHighlight>
      </View>
    </View>
  );
}
