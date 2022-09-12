import { MultisigState, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { HomeScreen } from "./home";
import { OnboardingScreen } from "./onboarding";

export type StateRendererScreenProps = NativeStackScreenProps<
  StackParamList,
  "state-renderer"
>;

export const StateRendererScreen = observer<StateRendererScreenProps>(() => {
  const { demoStore, multisigStore } = useStore();
  const state = demoStore.demoMode ? demoStore.demoState : multisigStore.state;

  return (
    <>
      {demoStore.demoMode ? (
        <View
          style={{
            position: "absolute",
            top: 40,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#fff",
            }}
          >
            Demo
          </Text>
        </View>
      ) : null}
      {getChildren()}
    </>
  );

  function getChildren() {
    switch (state) {
      case MultisigState.LOADING:
        // TODO: show splash screen
        return null;
      case MultisigState.EMPTY:
        return <OnboardingScreen />;
      case MultisigState.READY:
        return <OnboardingScreen initialRouteName="onboarding6" />;
      case MultisigState.OUTDATED:
        // TODO: show a migration screen
        console.log("Outdated proxy");
        return null;
      case MultisigState.INITIALIZED:
        return <HomeScreen />;
    }
  }
});
