import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SECURITY_QUESTIONS } from "../../../../config";
import { Button, IconButton } from "../../../button";
import { DropDownPicker } from "../../../drop-down-picker";
import { TextInput } from "../../../text-input";
import { Background } from "../../components/background";
import { StackParamList } from "../stack";
import SMS from "./assets/sms.svg";
import WhatsApp from "./assets/whatsapp.svg";

export type Onboarding2Props = NativeStackScreenProps<
  StackParamList,
  "onboarding2"
>;

export function Onboarding2({ navigation }: Onboarding2Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(SECURITY_QUESTIONS[0].value);
  const [items, setItems] = useState(SECURITY_QUESTIONS);

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
              <Image source={require("./assets/phone.png")} />
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
                Please answer a security question.
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text
            style={{
              color: "#787B9C",
              fontSize: 10,
              textTransform: "uppercase",
              marginBottom: 12,
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

          <TextInput
            label="Answer"
            placeholder="Type your answer here"
            style={{ marginTop: 25 }}
          />
        </View>

        <View>
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
    </SafeAreaView>
  );
}
