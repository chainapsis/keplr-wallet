import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  View,
} from "react-native";

import { Button } from "../../../button";
import { LanguagePicker } from "../../../language-picker";
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
    const intl = useIntl();

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
              position: "absolute",
              top: 20,
              left: 20,
            }}
          >
            <LanguagePicker />
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 20,
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
              <FormattedMessage
                id="onboarding1.welcometoloop"
                defaultMessage="Welcome to Loop"
              />
            </Text>
            <Text
              style={{
                color: "#999CB6",
                fontSize: 16,
                fontWeight: "400",
                marginTop: 12,
              }}
            >
              <FormattedMessage
                id="onboarding1.welcomesubtext"
                defaultMessage="Loop, powered by Obi, is the world's most powerful wallet for Web3."
              />
            </Text>
            <Button
              label={intl.formatMessage({ id: "onboarding1.getstarted" })}
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
              label={intl.formatMessage({ id: "demo.enter" })}
              RightIcon={GetStarted}
              flavor="green"
              style={{
                marginTop: 20,
              }}
              onPress={action(() => {
                demoStore.demoMode = true;
                navigation.navigate("onboarding2");
                Alert.alert(
                  intl.formatMessage({ id: "demo.demomode" }),
                  intl.formatMessage({ id: "demo.info" })
                );
              })}
            />
            {/*<Button*/}
            {/*  label={intl.formatMessage({ id: "onboarding1.recoverwallet" })}*/}
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
