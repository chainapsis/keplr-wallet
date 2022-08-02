import React from "react";
import { Text } from "@obi-wallet/common";
import {
  Button,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Background from "../components/background";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
//TODO: add background svgs

export default function Create() {
  const safeArea = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Background />
      <TouchableHighlight>
        <FontAwesomeIcon
          icon={faChevronLeft}
          style={{ color: "#7B87A8", top: safeArea.top }}
        />
      </TouchableHighlight>
      <View
        style={{
          flex: 4,
          justifyContent: "flex-start",
          marginTop: safeArea.top,
        }}
      >
        <View style={{ marginTop: 56 }}>
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 24,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Account Details
          </Text>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            Enter Wallet name & profile picture
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 48 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 84,
              backgroundColor: "#2E2C4D",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon icon={faUser} size={30} color="#687599" />
          </View>
          <View style={{ paddingHorizontal: 20, justifyContent: "center" }}>
            <Text style={{ fontSize: 11, fontWeight: "400", color: "#787B9C" }}>
              PROFILE PICTURE (OPTIONAL)
            </Text>
            <TouchableOpacity>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#8877EA" }}
              >
                + Upload Picture
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 3 }}>
        <Text
          style={{
            color: "#787B9C",
            fontSize: 10,
            fontWeight: "400",
            marginBottom: 12,
          }}
        >
          WALLET NAME
        </Text>
        <TextInput
          placeholder="my_wallet"
          placeholderTextColor={"#4B4E6E"}
          style={{
            width: "100%",
            height: 56,
            borderWidth: 1,
            borderColor: "#2F2B4C",
            paddingLeft: 20,
            fontSize: 17,
            fontWeight: "400",
            color: "##4B4E6E",
            borderRadius: 12,
          }}
        />
      </View>
      <View style={{ flex: 3, justifyContent: "flex-end", paddingBottom: 20 }}>
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
            <Text style={{ color: "#040317", fontSize: 16, fontWeight: "700" }}>
              Create Wallet
            </Text>
          </>
        </TouchableHighlight>
      </View>
    </View>
  );
}
