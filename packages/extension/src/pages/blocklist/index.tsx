import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import React, { FunctionComponent, useState } from "react";
import { URLTempAllowMsg } from "@keplr-wallet/background";
import ReactDOM from "react-dom";
import style from "./style.module.scss";

export const BlocklistPage: FunctionComponent = () => {
  const origin =
    new URLSearchParams(window.location.search).get("origin") || "";

  const handleMove = () =>
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, new URLTempAllowMsg(origin))
      .then(() => {
        window.location.replace(origin);
      });

  const [isAdvancedClicked, setIsAdvancedClicked] = useState(false);

  return (
    <div className={style.container}>
      <div className={style.inner}>
        <div>
          <img
            className={style.image}
            src={require("../../public/assets/img/blocklist-warning.svg")}
            alt=""
          />
          <h1 className={style.title}>SECURITY ALERT</h1>
          <p className={style.description}>
            Keplr has detected that this domain has been flagged as a phishing
            site. To protect the safety of your assets, we recommend you exit
            this website immediately.
          </p>
          {isAdvancedClicked ? (
            <button className={style.link} onClick={handleMove}>
              Continue to {origin} (unsafe)
            </button>
          ) : (
            <button
              className={style.advanced}
              onClick={() => setIsAdvancedClicked(true)}
            >
              ADVANCED
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<BlocklistPage />, document.getElementById("app"));
