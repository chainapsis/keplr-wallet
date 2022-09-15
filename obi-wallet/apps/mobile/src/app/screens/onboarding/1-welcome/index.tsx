import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  View,
} from "react-native";

import { Button } from "../../../button";
import { useStore } from "../../../stores";
import { DemoModeToggle } from "../../components/demo-mode-toggle";
import { StackParamList } from "../stack";
import GetStarted from "./assets/get-started.svg";
import RecoverWallet from "./assets/recover-wallet.svg";

export type WelcomeOnboardingProps = NativeStackScreenProps<
  StackParamList,
  "onboarding1"
>;

export const WelcomeOnboarding = observer<WelcomeOnboardingProps>(
  ({ navigation }) => {
    const { demoStore } = useStore();

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
              Loop, powered by Obi, is the world’s most powerful wallet for
              Web3.
            </Text>
            <Button
              label="Get Started"
              RightIcon={GetStarted}
              flavor="blue"
              style={{
                marginTop: 40,
              }}
              onPress={action(() => {
                demoStore.demoMode = false;
                navigation.navigate("onboarding2");
              })}
            />
            <Button
              label="Enter Demo Mode"
              RightIcon={GetStarted}
              flavor="green"
              style={{
                marginTop: 20,
              }}
              onPress={action(() => {
                demoStore.demoMode = true;
                navigation.navigate("onboarding2");
                Alert.alert(
                  "Demo Mode",
                  "You have entered the app in demo mode. This allows you finish the onboarding process with any."
                );
              })}
            />
            {/*<Button*/}
            {/*  label="Recover Wallet"*/}
            {/*  LeftIcon={RecoverWallet}*/}
            {/*  flavor="purple"*/}
            {/*  style={{*/}
            {/*    marginTop: 20,*/}
            {/*  }}*/}
            {/*  onPress={() => {*/}
            {/*    navigation.navigate("onboarding2");*/}
            {/*  }}*/}
            {/*/>*/}
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }
);
