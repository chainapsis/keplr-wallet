import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent, useMemo } from "react";
import { URLTempAllowMsg } from "@keplr-wallet/background";
import ReactDOM from "react-dom";
import style from "./style.module.scss";

export const BlocklistPage: FunctionComponent = () => {
  const origin =
    new URLSearchParams(location.hash.slice(2)).get("origin") || "";

  const handleMove = () =>
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new URLTempAllowMsg(origin))
      .then(() => {
        console.log(origin);
        location.replace(origin);
      });

  return (
    <div className={style.container}>
      <div className={style.inner}>
        <h1>SECURITY ALERT</h1>
        <p>
          Keplr has detected that this domain has been flagged as a phishing
          site. To protect the safety of your assets, we recommend you exit this
          website immediately.
        </p>
        <button onClick={handleMove}>Continue to {origin} (unsafe)</button>
      </div>
    </div>
  );
};

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
