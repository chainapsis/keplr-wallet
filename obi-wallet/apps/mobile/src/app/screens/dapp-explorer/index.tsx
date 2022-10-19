import { Home } from "@obi-wallet/common";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRootNavigation } from "../../root-stack";
import { useStore } from "../../stores";
import BuyCryptoIcon from "./assets/buy_crypto.svg";
import CosmicPartyIcon from "./assets/cosmic_party.svg";
import GetTicketsIcon from "./assets/get_tickets.svg";
import HistoryIcon from "./assets/history.svg";
import MyTicketsIcon from "./assets/my_tickets.svg";

const icons = [
  BuyCryptoIcon,
  CosmicPartyIcon,
  GetTicketsIcon,
  MyTicketsIcon,
  HistoryIcon,
];

export function DappExplorer() {
  const { appsStore, walletsStore, settingsStore } = useStore();
  const navigation = useRootNavigation();
  const safeArea = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ backgroundColor: "#090817", flex: 1 }}>
      <Home
        appsStore={appsStore}
        walletsStore={walletsStore}
        settingsStore={settingsStore}
        onAppPress={(app) => {
          navigation.navigate("web-view", {
            app,
          });
        }}
        icons={icons}
        marginBottom={safeArea.bottom}
      />
    </SafeAreaView>
  );
}
