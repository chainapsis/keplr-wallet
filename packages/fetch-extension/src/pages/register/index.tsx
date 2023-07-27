// Shim ------------
require("setimmediate");
// Shim ------------
import React, { FunctionComponent, useEffect } from "react";

import { EmptyLayout } from "@layouts/empty-layout";

import { observer } from "mobx-react-lite";

import style from "./style.module.scss";

import { Button } from "reactstrap";

import { FormattedMessage } from "react-intl";

import { useRegisterConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { NewMnemonicIntro, NewMnemonicPage, TypeNewMnemonic } from "./mnemonic";
import {
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeRecoverMnemonic,
} from "./mnemonic";
import {
  ImportLedgerIntro,
  ImportLedgerPage,
  TypeImportLedger,
} from "./ledger";
import { WelcomePage } from "./welcome";
import { AdditionalSignInPrepend } from "../../config.ui";
import classnames from "classnames";
import {
  ImportKeystoneIntro,
  ImportKeystonePage,
  TypeImportKeystone,
} from "./keystone";
import {
  MigrateEthereumAddressIntro,
  MigrateEthereumAddressPage,
  TypeMigrateEth,
} from "./migration";
import { AuthIntro, AuthPage } from "./auth";
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
      <Button color="link" onClick={onClick}>
        <i className="fas fa-angle-left" style={{ marginRight: "8px" }} />
        <FormattedMessage id="register.button.back" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  const { keyRingStore, uiConfigStore, analyticsStore } = useStore();

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
      type: "auth",
      intro: AuthIntro,
      page: AuthPage,
    },
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
    // Currently, there is no way to use ledger with keplr on firefox.
    // Temporarily, hide the ledger usage.
    ...(uiConfigStore.platform !== "firefox"
      ? [
          {
            type: TypeImportLedger,
            intro: ImportLedgerIntro,
            page: ImportLedgerPage,
          },
        ]
      : []),
    {
      type: TypeImportKeystone,
      intro: ImportKeystoneIntro,
      page: ImportKeystonePage,
    },
    // TODO: think about moving this into the configuration at some point
    {
      type: TypeMigrateEth,
      intro: MigrateEthereumAddressIntro,
      page: MigrateEthereumAddressPage,
    },
  ]);

  return (
    <EmptyLayout
      className={classnames(style["container"], {
        large:
          !registerConfig.isFinalized &&
          registerConfig.type === "recover-mnemonic",
      })}
      style={{ height: "100%", backgroundColor: "white", padding: 0 }}
    >
      <div style={{ flex: 10 }} />
      <div className={style["logoContainer"]}>
        <div
          className={classnames(style["logoInnerContainer"], {
            [style["justifyCenter"]]: registerConfig.isIntro,
          })}
        >
          <img
            className={style["icon"]}
            src={require("@assets/logo-256.svg")}
            alt="logo"
          />
          <img
            className={style["logo"]}
            src={require("@assets/brand-text.png")}
            alt="logo"
          />
        </div>
      </div>
      {registerConfig.render()}
      {registerConfig.isFinalized ? <WelcomePage /> : null}
      {registerConfig.isIntro ? (
        <div className={style["subContent"]}>
          <FormattedMessage
            id="register.intro.sub-content"
            values={{
              br: <br />,
            }}
          />
        </div>
      ) : null}
      <div style={{ flex: 13 }} />
    </EmptyLayout>
  );
});
