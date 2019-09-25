import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import "./styles/global.scss";
import "purecss/build/pure.css";
import { RegisterPage } from "./pages/register";
import { MainPage } from "./pages/main";
import { LockPage } from "./pages/lock";

import { configure } from "mobx";
import { observer } from "mobx-react";

import { StoreProvider, useStore } from "./stores";
import { KeyRing, KeyRingStatus } from "./stores/keyring";

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

const keyRing = new KeyRing();
keyRing.restore();

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRing } = useStore();

  if (keyRing.status === KeyRingStatus.EMPTY) {
    return <RegisterPage />;
  } else if (keyRing.status === KeyRingStatus.UNLOCKED) {
    return <MainPage />;
  } else if (keyRing.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else {
    return <div>Unknown status</div>;
  }
});

ReactDOM.render(
  <StoreProvider keyRing={keyRing}>
    <StateRenderer />
  </StoreProvider>,
  document.getElementById("app")
);
