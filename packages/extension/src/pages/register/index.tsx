import React, { FunctionComponent, useEffect } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

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

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <div className={style.backButton}>
      <Button color="link" onClick={onClick}>
        <i className="fas fa-angle-left" style={{ marginRight: "8px" }} />
        <FormattedMessage id="register.button.back" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  useEffect(() => {
    document.documentElement.setAttribute("data-register-page", "true");

    return () => {
      document.documentElement.removeAttribute("data-register-page");
    };
  }, []);

  const { keyRingStore } = useStore();

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
    {
      type: TypeImportLedger,
      intro: ImportLedgerIntro,
      page: ImportLedgerPage,
    },
  ]);

  return (
    <EmptyLayout
      className={classnames(style.container, {
        large: registerConfig.type === "recover-mnemonic",
      })}
      style={{ height: "100%", backgroundColor: "white", padding: 0 }}
    >
      <div style={{ flex: 10 }} />
      <div className={style.logoContainer}>
        <div
          className={classnames(style.logoInnerContainer, {
            [style.justifyCenter]: registerConfig.isIntro,
          })}
        >
          <img
            className={style.icon}
            src={require("../../public/assets/logo-256.png")}
            alt="logo"
          />
          <img
            className={style.brandText}
            src={require("../../public/assets/brand-text-fit-logo-height.png")}
            alt="logo"
          />
        </div>
        {registerConfig.isIntro ? (
          <div className={style.introBrandSubTextContainer}>
            <img
              className={style.introBrandSubText}
              src={require("../../public/assets/brand-sub-text.png")}
              alt="The Interchain Wallet"
            />
          </div>
        ) : null}
      </div>
      {registerConfig.render()}
      {registerConfig.isFinalized ? <WelcomePage /> : null}
      {registerConfig.isIntro ? (
        <div className={style.subContent}>
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
