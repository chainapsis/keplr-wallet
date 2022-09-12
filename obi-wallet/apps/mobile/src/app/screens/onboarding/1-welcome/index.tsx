import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, ImageBackground, SafeAreaView, View } from "react-native";

import { Button } from "../../../button";
import { DemoModeToggle } from "../../components/demo-mode-toggle";
import { StackParamList } from "../stack";
import GetStarted from "./assets/get-started.svg";
import RecoverWallet from "./assets/recover-wallet.svg";

export type WelcomeOnboardingProps = NativeStackScreenProps<
  StackParamList,
  "onboarding1"
>;

export function WelcomeOnboarding({ navigation }: WelcomeOnboardingProps) {
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
          <DemoModeToggle>
            <Image source={require("./assets/loop.png")} />
          </DemoModeToggle>
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
            Loop, powered by Obi, is the world’s most powerful wallet for Web3.
          </Text>
          <Button
            label="Get Started"
            RightIcon={GetStarted}
            flavor="blue"
            style={{
              marginTop: 40,
            }}
            onPress={() => {
              navigation.navigate("onboarding2");
            }}
          />
          <Button
            label="Recover Wallet"
            LeftIcon={RecoverWallet}
            flavor="purple"
            style={{
              marginTop: 20,
            }}
            onPress={() => {
              navigation.navigate("onboarding2");
            }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
