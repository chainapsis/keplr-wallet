import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text, TextInput } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SECURITY_QUESTIONS } from "../../../../config";
import { Button, IconButton } from "../../../button";
import { DropDownPicker } from "../../../drop-down-picker";
import { Background } from "../../components/background";
import { StackParamList } from "../stack";
import SMS from "./assets/sms.svg";
import WhatsApp from "./assets/whatsapp.svg";

export type Onboarding2Props = NativeStackScreenProps<
  StackParamList,
  "onboarding2"
>;

export function Onboarding2({ navigation }: Onboarding2Props) {
  const safeArea = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(SECURITY_QUESTIONS[0].value);
  const [items, setItems] = useState(SECURITY_QUESTIONS);

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Background />
      <IconButton
        style={{
          marginTop: safeArea.top,
          marginLeft: -5,
          padding: 5,
          width: 25,
        }}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} style={{ color: "#7B87A8" }} />
      </IconButton>
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
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          Security Question
        </Text>

        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
        />
        <Text
          style={{
            color: "#787B9C",
            fontSize: 10,
            marginBottom: 12,
            marginTop: 25,
            textTransform: "uppercase",
          }}
        >
          Answer
        </Text>
        <TextInput
          placeholder="type your answer here"
          style={{
            width: "100%",
            height: 56,
            borderWidth: 1,
            borderColor: "#2F2B4C",
            paddingLeft: 20,
            fontSize: 14,
            fontWeight: "500",
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
            <Text
              style={{
                color: "#F6F5FF",
                marginLeft: 30,
                opacity: 0.7,
                fontSize: 12,
              }}
            >
              Now send your encrypted answer to activate your messaging key.
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
