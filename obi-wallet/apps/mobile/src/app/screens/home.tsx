import { Home } from "@obi-wallet/common";
import React from "react";
import { SafeAreaView } from "react-native";

import { useStore } from "../stores";

export function HomeScreen() {
  const { appsStore } = useStore();
  return (
    <SafeAreaView>
      <Home
        appsStore={appsStore}
        onAppPress={() => {
          console.warn("onAppPress");
        }}
        onAppStorePress={() => {
          console.warn("onAppStorePress");
        }}
      />
    </SafeAreaView>
  );
}
