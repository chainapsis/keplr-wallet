import { Text } from "@obi-wallet/common";
import { KeyRingStatus } from "@keplr-wallet/background";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import React from "react";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { HomeScreen } from "./home";
import { LockScreen } from "./lock";
import { RegisterScreen } from "./register";
import Onboarding from "./onboarding/onboarding4";

export type StateRendererScreenProps = NativeStackScreenProps<
  StackParamList,
  "state-renderer"
>;

export const StateRendererScreen = observer<StateRendererScreenProps>(() => {
  const { keyRingStore } = useStore();
  return <Onboarding />;
  switch (keyRingStore.status) {
    case KeyRingStatus.NOTLOADED:
      return <Text>Not Loaded</Text>;
    case KeyRingStatus.EMPTY:
      return <RegisterScreen />;
    case KeyRingStatus.LOCKED:
      return <LockScreen />;
    case KeyRingStatus.UNLOCKED:
      return <HomeScreen />;
  }
});
