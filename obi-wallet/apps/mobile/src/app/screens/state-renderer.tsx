import { KeyRingStatus } from "@keplr-wallet/background";
import { Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { HomeScreen } from "./home";
import { LockScreen } from "./lock";
import { OnboardingScreen } from "./onboarding";

export type StateRendererScreenProps = NativeStackScreenProps<
  StackParamList,
  "state-renderer"
>;

export const StateRendererScreen = observer<StateRendererScreenProps>(() => {
  const { keyRingStore } = useStore();

  switch (keyRingStore.status) {
    case KeyRingStatus.NOTLOADED:
      return <Text>Not Loaded</Text>;
    case KeyRingStatus.EMPTY:
      return <OnboardingScreen />;
    case KeyRingStatus.LOCKED:
      return <LockScreen />;
    case KeyRingStatus.UNLOCKED:
      return <HomeScreen />;
  }
});
