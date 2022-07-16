import { Text } from "@obi-wallet/common";
import { KeyRingStatus } from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import React from "react";

import { useStore } from "../stores";
import { HomeScreen } from "./home";
import { LockScreen } from "./lock";
import { RegisterScreen } from "./register";

export const StateRendererScreen = observer(() => {
  const { keyRingStore } = useStore();

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
