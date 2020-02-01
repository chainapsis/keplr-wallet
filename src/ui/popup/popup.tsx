import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./language";

import "./styles/global.scss";

import { HashRouter, Route, RouteComponentProps } from "react-router-dom";

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
  ({ history, location }) => {
    const { keyRingStore } = useStore();

    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      return <MainPage history={history} />;
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
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/send" component={SendPage} />
            <Route exact path="/fee/:index" component={FeePage} />
            <Route path="/sign/:index" component={SignPage} />
          </HashRouter>
        </NotificationProvider>
      </NotificationStoreProvider>
    </StoreProvider>
  </AppIntlProvider>,
  document.getElementById("app")
);
