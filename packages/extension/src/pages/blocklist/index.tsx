import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent } from "react";
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
        <img
          className={style.image}
          src={require("../../public/assets/img/blocklist.svg")}
          alt=""
        />
        <div>
          <h1 className={style.title}>SECURITY ALERT</h1>
          <p className={style.description}>
            Keplr has detected that this domain has been flagged as a phishing
            site. To protect the safety of your assets, we recommend you exit
            this website immediately.
          </p>
          <button className={style.link} onClick={handleMove}>
            Continue to {origin} (unsafe)
          </button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
