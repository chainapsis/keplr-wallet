import { Text, WalletState } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { HomeScreen } from "./home";
import { OnboardingScreen } from "./onboarding";
import { SplashScreen } from "./splash";

export type StateRendererScreenProps = NativeStackScreenProps<
  StackParamList,
  "state-renderer"
>;

export const StateRendererScreen = observer<StateRendererScreenProps>(() => {
  const { demoStore, walletStore } = useStore();

  return (
    <>
      {demoStore.demoMode ? (
        <View
          style={{
            position: "absolute",
            top: 20,
            left: "40%",
            right: "40%",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
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
    switch (walletStore.state) {
      case WalletState.LOADING:
        return <SplashScreen />;
      case WalletState.EMPTY:
        return <OnboardingScreen />;
      case WalletState.INITIALIZED:
        return <HomeScreen />;
    }
  }
});
