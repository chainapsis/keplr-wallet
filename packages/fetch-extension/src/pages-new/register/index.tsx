// Shim ------------
require("setimmediate");
// Shim ------------
import React, { FunctionComponent, useEffect } from "react";

import { EmptyLayout } from "@layouts/empty-layout";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { Button } from "reactstrap";

import { useRegisterConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { NewMnemonicIntro, NewMnemonicPage, TypeNewMnemonic } from "./mnemonic";
import {
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeRecoverMnemonic,
} from "./mnemonic";
import { WelcomePage } from "./welcome";
import { AdditionalSignInPrepend } from "../../config.ui";
import classnames from "classnames";
import { configure } from "mobx";
configure({
  enforceActions: "always", // Make mobx to strict mode.
});
export enum NunWords {
  WORDS12,
  WORDS24,
}

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <div className={style["backButton"]}>
      <Button style={{ padding: "0px" }} color="link" onClick={onClick}>
        <img src={require("@assets/svg/wireframe/back-button.svg")} alt="" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRingStore, analyticsStore } = useStore();

  useEffect(() => {
    analyticsStore.logEvent("Register page");
    document.documentElement.setAttribute("data-register-page", "true");

    return () => {
      document.documentElement.removeAttribute("data-register-page");
    };
  }, []);

  const registerConfig = useRegisterConfig(keyRingStore, [
    ...(AdditionalSignInPrepend ?? []),
    {
      type: TypeNewMnemonic,
      intro: NewMnemonicIntro,
      page: NewMnemonicPage,
    },
    {
      type: TypeRecoverMnemonic,
      intro: RecoverMnemonicIntro,
      page: RecoverMnemonicPage,
    },
  ]);

  return (
    <EmptyLayout
      className={classnames(style["container"], {
        large:
          !registerConfig.isFinalized &&
          registerConfig.type === "recover-mnemonic",
      })}
      style={{ height: "100%", padding: 0 }}
    >
      <div className={style["logoContainer"]}>
        <div
          className={classnames(style["logoInnerContainer"], {
            [style["justifyCenter"]]: registerConfig.isIntro,
          })}
        >
          <img
            className={style["icon"]}
            src={require("@assets/svg/wireframe/logo-small.svg")}
            alt="logo"
          />
        </div>
      </div>
      {registerConfig.render()}
      {registerConfig.isFinalized ? <WelcomePage /> : null}
      <div style={{ flex: 13 }} />
    </EmptyLayout>
  );
});
