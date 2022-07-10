import { Home } from "@obi-wallet/components";
import React from "react";

import { RootStore } from "../stores";

const store = new RootStore();

export function HomeScreen() {
  return (
    <Home
      appsStore={store.appsStore}
      onAppPress={(_app) => {
        // TODO: smartNavigation.pushSmart("Web.Browser", {
        //   url: app.url,
        //   title: app.label,
        // });
      }}
      onAppStorePress={() => {
        // TODO: smartNavigation.pushSmart("Web.AppStore", {});
      }}
    />
  );
}
