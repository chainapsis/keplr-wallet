import { Home } from "@obi-wallet/common";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRootNavigation } from "../root-stack";
import { useStore } from "../stores";

export function DappExplorer() {
  const { appsStore, multisigStore } = useStore();
  const navigation = useRootNavigation();
  const safeArea = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ backgroundColor: "#090817", flex: 1 }}>
      <Home
        appsStore={appsStore}
        multisigStore={multisigStore}
        onAppPress={(app) => {
          navigation.navigate("web-view", {
            app,
          });
        }}
        marginBottom={safeArea.bottom}
      />
    </SafeAreaView>
  );
}
