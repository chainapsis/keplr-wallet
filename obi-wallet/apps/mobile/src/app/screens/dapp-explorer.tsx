import { Home } from "@obi-wallet/common";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRootNavigation } from "../root-stack";
import { useStore } from "../stores";

export function DappExplorer() {
  const { appsStore, walletStore } = useStore();
  const navigation = useRootNavigation();
  const safeArea = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ backgroundColor: "#090817", flex: 1 }}>
      <Home
        appsStore={appsStore}
        walletStore={walletStore}
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
