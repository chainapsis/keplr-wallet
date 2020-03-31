import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./language";

import "./styles/global.scss";

import { HashRouter, Route, RouteComponentProps } from "react-router-dom";

import { AccessPage } from "./pages/access";
import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";
import { SendPage } from "./pages/send";

import { Banner } from "./components/banner";

import {
  NotificationProvider,
  NotificationStoreProvider
} from "../components/notification";

import { configure } from "mobx";
import { observer } from "mobx-react";

import { StoreProvider, useStore } from "./stores";
import { KeyRingStatus } from "./stores/keyring";
import { SignPage } from "./pages/sign";
import { FeePage } from "./pages/fee";
import Modal from "react-modal";
import { SettingPage } from "./pages/setting";
import { SettingLanguagePage } from "./pages/setting/language";
import { SettingConnectionsPage } from "./pages/setting/connections";

// Make sure that icon file will be included in bundle
require("./public/assets/temp-icon.svg");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)"
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay
  }
};

const StateRenderer: FunctionComponent<RouteComponentProps> = observer(
  ({ location }) => {
    const { keyRingStore } = useStore();

    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      return <MainPage />;
    } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
      return <LockPage location={location} />;
    } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
      browser.tabs.create({
        url: "/popup.html#/register"
      });
      window.close();
      return (
        <div style={{ height: "100%" }}>
          <Banner
            icon={require("./public/assets/temp-icon.svg")}
            logo={require("./public/assets/logo-temp.png")}
            subtitle="Wallet for the Interchain"
          />
        </div>
      );
    } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
      return (
        <div style={{ height: "100%" }}>
          <Banner
            icon={require("./public/assets/temp-icon.svg")}
            logo={require("./public/assets/logo-temp.png")}
            subtitle="Wallet for the Interchain"
          />
        </div>
      );
    } else {
      return <div>Unknown status</div>;
    }
  }
);

ReactDOM.render(
  <AppIntlProvider>
    <StoreProvider>
      <NotificationStoreProvider>
        <NotificationProvider>
          <HashRouter>
            <Route exact path="/" component={StateRenderer} />
            <Route exact path="/access" component={AccessPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/send" component={SendPage} />
            <Route exact path="/fee/:id" component={FeePage} />
            <Route exact path="/setting" component={SettingPage} />
            <Route
              exact
              path="/setting/language"
              component={SettingLanguagePage}
            />
            <Route
              exact
              path="/setting/connections"
              component={SettingConnectionsPage}
            />
            <Route path="/sign/:id" component={SignPage} />
          </HashRouter>
        </NotificationProvider>
      </NotificationStoreProvider>
    </StoreProvider>
  </AppIntlProvider>,
  document.getElementById("app")
);
