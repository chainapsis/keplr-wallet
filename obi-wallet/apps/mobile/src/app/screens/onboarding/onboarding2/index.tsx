import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, TextInput, TouchableHighlight, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Background } from "../../components/background";
import { StackParamList } from "../stack";
import SMS from "./assets/sms.svg";
import WhatsApp from "./assets/whatsapp.svg";
import { Button } from "../../../button";

//TODO: add select for security question

export type Onboarding2Props = NativeStackScreenProps<
  StackParamList,
  "onboarding2"
>;

export function Onboarding2({ navigation }: Onboarding2Props) {
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
        <View>
          <Image
            source={require("./assets/phone.png")}
            style={{ width: 66, height: 79, marginBottom: 41 }}
          />
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

        {/* <TextInput
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
                /> */}

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
          <Button
            label="Send Magic SMS"
            LeftIcon={SMS}
            flavor="blue"
            style={{
              marginVertical: 20,
            }}
            onPress={() => {
              navigation.navigate("onboarding3");
            }}
          />
          <Button
            label="Send on WhatsApp"
            LeftIcon={WhatsApp}
            flavor="green"
            onPress={() => {
              navigation.navigate("onboarding3");
            }}
          />
        </View>
      </View>
    </View>
  );
}
