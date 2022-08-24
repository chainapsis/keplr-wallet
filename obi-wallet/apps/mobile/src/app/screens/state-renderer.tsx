import { MultisigState } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { DappExplorer } from "./dapp-explorer";
import { HomeScreen } from "./home";
import { LockScreen } from "./lock";
import { OnboardingScreen } from "./onboarding";

export type StateRendererScreenProps = NativeStackScreenProps<
  StackParamList,
  "state-renderer"
>;

export const StateRendererScreen = observer<StateRendererScreenProps>(() => {
  const { multisigStore } = useStore();
  return <HomeScreen />;
  switch (multisigStore.getState()) {
    case MultisigState.LOADING:
      // TODO: show splash screen
      return null;
    case MultisigState.EMPTY:
      return <OnboardingScreen />;
    case MultisigState.INITIALIZED:
      return <HomeScreen />;
  }
});
