import React from "react";
import { Text } from "@obi-wallet/common";
import { Button, TextInput, TouchableHighlight, View } from "react-native";
import PhoneLogo from "./assets/phoneLogo.svg";
import Whatsapp from "./assets/whatsapp.svg";
import MessageDots from "./assets/messageDots.svg";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { faMessage } from "@fortawesome/free-solid-svg-icons/faMessage";
//TODO: chevron back
//TODO: add background svgs
//TODO: change phone logo for opaque one
//TODO: add select for security question

export default function onboarding2() {
  return (
    <View
      style={{ backgroundColor: "#1E1E1E", flex: 1, paddingHorizontal: 20 }}
    >
      <View style={{ flex: 4, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#1E1E1E" }}>
          <PhoneLogo style={{ marginBottom: 41 }} />
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
              Please answer a security question.
            </Text>
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
          SECURITY QUESTION
        </Text>
        <TextInput
          value="IT HAS TO BE A SELECT"
          placeholder="type your answer here"
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

        <Text
          style={{
            color: "#787B9C",
            fontSize: 10,
            fontWeight: "400",
            marginBottom: 12,
            marginTop: 25,
          }}
        >
          ANSWER
        </Text>
        <TextInput
          placeholder="type your answer here"
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
      </View>
      <View style={{ flex: 3 }}>
        <View style={{ flexDirection: "row", flexGrow: 1, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <FontAwesomeIcon
              icon={faInfoCircle}
              style={{
                color: "#7B87A8",
                marginHorizontal: 5,
                position: "absolute",
                margin: 5,
              }}
            />
            <Text style={{ color: "#F6F5FF", marginLeft: 30, opacity: 0.7 }}>
              Now send your encrypted answer to activate your message key
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
              marginVertical: 20,
              borderRadius: 12,
            }}
          >
            <>
              <MessageDots style={{ marginRight: 10 }} />
              <Text
                style={{ color: "#040317", fontSize: 16, fontWeight: "700" }}
              >
                Send Magic SMS
              </Text>
            </>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              backgroundColor: "#48C95F",
              width: "100%",
              height: 56,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              borderRadius: 12,
            }}
          >
            <>
              <Whatsapp style={{ marginRight: 10 }} />
              <Text
                style={{ color: "#040317", fontSize: 16, fontWeight: "700" }}
              >
                Send on Whatsapp
              </Text>
            </>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}
