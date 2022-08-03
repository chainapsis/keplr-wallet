import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, ImageBackground, SafeAreaView, View } from "react-native";

import { Button } from "../../../button";
import { StackParamList } from "../stack";
import GetStarted from "./assets/get-started.svg";
import RecoverWallet from "./assets/recover-wallet.svg";

export type Onboarding1Props = NativeStackScreenProps<
  StackParamList,
  "onboarding1"
>;

export function Onboarding1({ navigation }: Onboarding1Props) {
  return (
    <ImageBackground
      source={require("./assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: 609 }}
      style={{
        backgroundColor: "#090817",
        flex: 1,
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            paddingHorizontal: 20,
          }}
        >
          <Image source={require("./assets/loop.png")} />
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 32,
              fontWeight: "600",
              marginTop: 32,
            }}
          >
            Welcome to Loop
          </Text>
          <Text
            style={{
              color: "#999CB6",
              fontSize: 16,
              fontWeight: "400",
              marginTop: 12,
            }}
          >
            Loop, powered by Obi, is the world’s most powerful wallet for web3{" "}
          </Text>
          <Button
            style={{
              backgroundColor: "#59D6E6",
              marginTop: 40,
            }}
            onPress={() => {
              navigation.navigate("onboarding2");
            }}
          >
            <Text
              style={{
                color: "#040317",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Get Started
            </Text>
            <GetStarted width={24} height={24} />
          </Button>
          <Button
            style={{
              backgroundColor: "#8877EA",
              marginTop: 20,
            }}
            onPress={() => {
              navigation.navigate("onboarding2");
            }}
          >
            <RecoverWallet width={24} height={24} style={{ marginRight: 8 }} />
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Recover Wallet
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
