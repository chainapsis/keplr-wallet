import { Home } from "@obi-wallet/common";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNavigation } from "../stack";
import { useStore } from "../stores";

export function DappExplorer() {
  const { appsStore } = useStore();
  const navigation = useNavigation();
  const safeArea = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ backgroundColor: "#090817" }}>
      <Home
        appsStore={appsStore}
        onAppPress={(app) => {
          navigation.navigate("web-view", {
            app,
          });
        }}
        onAppStorePress={() => {
          console.warn("onAppStorePress");
        }}
        marginBottom={safeArea.bottom}
      />
    </SafeAreaView>
  );
}
