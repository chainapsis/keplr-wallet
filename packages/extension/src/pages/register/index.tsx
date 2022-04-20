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

export enum NunWords {
  WORDS12,
  WORDS24,
}

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
    document.body.setAttribute("data-centered", "true");

    return () => {
      document.body.removeAttribute("data-centered");
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
      className={style.container}
      style={{ height: "100%", backgroundColor: "white", padding: 0 }}
    >
      <div className={style.logoContainer}>
        <img
          className={style.icon}
          src={require("../../public/assets/keplr-logo.svg")}
          alt="logo"
        />
        <div className={style.logoInnerContainer}>
          <img
            className={style.logo}
            src={require("../../public/assets/keplr-logo-text.png")}
            alt="logo"
          />
          <div className={style.paragraph}>Wallet for the Interchain</div>
        </div>
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
    </EmptyLayout>
  );
});
