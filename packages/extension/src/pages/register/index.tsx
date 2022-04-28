import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import { AdditionalSignInPrepend } from "../../config.ui";
import { EmptyLayout } from "../../layouts/empty-layout";
import { useStore } from "../../stores";
import {
  ImportLedgerIntro,
  ImportLedgerPage,
  TypeImportLedger,
} from "./ledger";
import {
  NewMnemonicIntro,
  NewMnemonicPage,
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeNewMnemonic,
  TypeRecoverMnemonic,
} from "./mnemonic";
import style from "./style.module.scss";
import { WelcomePage } from "./welcome";

export enum NunWords {
  WORDS12,
  WORDS24,
}

export const registerTypeToWidth: Record<string, number> = {
  [TypeNewMnemonic]: 609,
};

export const BackButton: FunctionComponent<{
  onClick: () => void;
}> = ({ onClick }) => {
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
      style={{
        backgroundColor: "white",
        padding: "40px 0",
        ...(registerConfig.type
          ? {
              width: `${registerTypeToWidth[registerConfig.type]}px`,
              marginLeft: `calc((360px - ${
                registerTypeToWidth[registerConfig.type]
              }px) / 2)`,
            }
          : {
              width: "400px",
              marginLeft: "calc((360px - 400px) / 2)",
              height: "100%",
            }),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: registerConfig.type ? "flex-start" : "center",
          marginBottom: registerConfig.type ? "40px" : "71px",
        }}
      >
        <div className={style.logoContainer}>
          <img
            className={style.logoImage}
            src={require("../../public/assets/keplr-logo.svg")}
            alt="keplr logo image"
          />
          <img
            className={style.logoText}
            src={require("../../public/assets/keplr-logo-text.png")}
            alt="keplr logo text"
          />
        </div>
        {registerConfig.isIntro && (
          <div className={style.paragraph}>The Interchain Wallet</div>
        )}
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
