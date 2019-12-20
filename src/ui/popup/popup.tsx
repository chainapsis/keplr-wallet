import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import "./styles/global.scss";

import { HashRouter, Route, RouteComponentProps } from "react-router-dom";

import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";
import { SendPage } from "./pages/send";

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

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

const StateRenderer: FunctionComponent<RouteComponentProps> = observer(
  ({ history, location }) => {
    const { keyRingStore } = useStore();

    if (keyRingStore.status === KeyRingStatus.EMPTY) {
      return <RegisterPage />;
    } else if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      return <MainPage history={history} />;
    } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
      return <LockPage location={location} />;
    } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
      return <div>Not yet loaded</div>;
    } else {
      return <div>Unknown status</div>;
    }
  }
);

ReactDOM.render(
  <StoreProvider>
    <NotificationStoreProvider>
      <NotificationProvider>
        <HashRouter>
          <Route exact path="/" component={StateRenderer} />
          <Route exact path="/send" component={SendPage} />
          <Route exact path="/fee/:index" component={FeePage} />
          <Route path="/sign/:index" component={SignPage} />
        </HashRouter>
      </NotificationProvider>
    </NotificationStoreProvider>
  </StoreProvider>,
  document.getElementById("app")
);
