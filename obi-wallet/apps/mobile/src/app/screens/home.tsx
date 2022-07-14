import { Home, HomeProps, RootStore } from "@obi-wallet/common";
import React from "react";
import { SafeAreaView } from "react-native";

const stores = new RootStore();

const home: HomeProps = {
  appsStore: stores.appsStore,
  onAppPress() {
    console.warn("onAppPress");
  },
  onAppStorePress() {
    console.warn("onAppStorePress");
  },
};

export function HomeScreen() {
  return (
    <SafeAreaView>
      <Home {...home} />
    </SafeAreaView>
  );
}
