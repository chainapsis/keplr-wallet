import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, SafeAreaView, View } from "react-native";

import { Button } from "../../../button";
import { LanguagePicker } from "../../../language-picker";
import { useStore } from "../../../stores";
import { DemoModeToggle } from "../../components/demo-mode-toggle";
import { InitialBackground } from "../../components/initial-background";
import { OnboardingStackParamList } from "../onboarding-stack";
import GetStarted from "./assets/get-started.svg";

export type WelcomeProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "welcome"
>;

export const Welcome = observer<WelcomeProps>(({ navigation }) => {
  const { demoStore } = useStore();
  const intl = useIntl();

  return (
    <InitialBackground>
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
              navigation.navigate("create-multisig-biometrics");
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
              navigation.navigate("create-multisig-biometrics");
              Alert.alert(
                intl.formatMessage({ id: "demo.demomode" }),
                intl.formatMessage({ id: "demo.info" })
              );
            })}
          />
          <Button
            label="Recover Singlesig"
            RightIcon={GetStarted}
            flavor="blue"
            style={{
              marginTop: 20,
            }}
            onPress={action(() => {
              demoStore.demoMode = false;
              navigation.navigate("recover-singlesig");
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
    </InitialBackground>
  );
});
