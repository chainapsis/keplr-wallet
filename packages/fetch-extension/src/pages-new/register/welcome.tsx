import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
// import { Button } from "reactstrap";
import { ButtonV2 } from "@components-v2/buttons/button";

export const WelcomePage: FunctionComponent = () => {
  return (
    <div style={{ paddingTop: "20px", marginLeft: "-27px" }}>
      <img
        className={styleWelcome["pinWalletArrow"]}
        src={require("@assets/svg/wireframe/pin-arrow.svg")}
        alt=""
      />
      <img
        className={styleWelcome["pinWallet"]}
        src={require("@assets/svg/wireframe/welcome-frame.svg")}
        alt=""
      />
      <div className={styleWelcome["content"]}>
        <img
          src={require("@assets/svg/wireframe/welcome-content.svg")}
          alt=""
        />
      </div>
      <ButtonV2
        onClick={() => {
          if (typeof browser !== "undefined") {
            browser.tabs.getCurrent().then((tab) => {
              if (tab.id) {
                browser.tabs.remove(tab.id);
              } else {
                window.close();
              }
            });
          } else {
            window.close();
          }
        }}
        text={""}
      >
        Start using your wallet
      </ButtonV2>
    </div>
  );
};
