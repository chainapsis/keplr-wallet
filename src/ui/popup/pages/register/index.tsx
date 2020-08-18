import React, { FunctionComponent, useEffect } from "react";

import { EmptyLayout } from "../../layouts/empty-layout";

import { observer } from "mobx-react";

import style from "./style.module.scss";

import { Button } from "reactstrap";

import { WelcomeInPage } from "./welcome";
import { FormattedMessage } from "react-intl";
import {
  RegisterMode,
  RegisterStatus,
  useRegisterState,
  withRegisterStateProvider
} from "../../../contexts/register";

import { NewMnemonicPage } from "./new-mnemonic";
import { VerifyMnemonicPage } from "./verify-mnemonic";

import { useLocation } from "react-router";
import queryString from "query-string";
import { RecoverMnemonicPage } from "./recover-mnemonic";

export enum NunWords {
  WORDS12,
  WORDS24
}

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick
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

export const RegisterPage: FunctionComponent = withRegisterStateProvider(
  observer(() => {
    const registerState = useRegisterState();

    useEffect(() => {
      document.body.setAttribute("data-centered", "true");

      return () => {
        document.body.removeAttribute("data-centered");
      };
    }, []);

    const location = useLocation();
    const query = queryString.parse(location.search);

    useEffect(() => {
      if (query.mode === "add") {
        registerState.setMode(RegisterMode.ADD);
      } else {
        registerState.setMode(RegisterMode.CREATE);
      }
    }, [query.mode, registerState]);

    return (
      <EmptyLayout
        className={style.container}
        style={{ height: "100%", backgroundColor: "white", padding: 0 }}
      >
        <div className={style.logoContainer}>
          <img
            className={style.icon}
            src={require("../../public/assets/temp-icon.svg")}
            alt="logo"
          />
          <div className={style.logoInnerContainer}>
            <img
              className={style.logo}
              src={require("../../public/assets/logo-temp.png")}
              alt="logo"
            />
            <div className={style.paragraph}>Wallet for the Interchain</div>
          </div>
        </div>
        {registerState.status === RegisterStatus.COMPLETE ? (
          <WelcomeInPage />
        ) : null}
        <NewMnemonicPage />
        <RecoverMnemonicPage />
        <VerifyMnemonicPage />
        {registerState.status === RegisterStatus.INIT ? (
          <div className={style.subContent}>
            <FormattedMessage
              id="register.intro.sub-content"
              values={{
                br: <br />
              }}
            />
          </div>
        ) : null}
      </EmptyLayout>
    );
  })
);
