import React, { FunctionComponent } from "react";

import { Button } from "../../../components/button";
import { Banner } from "../../components/banner";

import style from "./style.module.scss";

import { FormattedMessage } from "react-intl";

export const IntroInPage: FunctionComponent<{
  onRequestNewAccount: () => void;
  onRequestRecoverAccount: () => void;
}> = props => {
  return (
    <div className={style.container}>
      <Banner
        icon={require("../../public/assets/temp-icon.svg")}
        logo={require("../../public/assets/logo-temp.png")}
        subtitle="Wallet for the Interchain"
      />
      <Button
        className={style.button}
        onClick={props.onRequestNewAccount}
        size="medium"
        type="button"
      >
        <FormattedMessage id="register.intro.button.new-account" />
      </Button>
      <Button
        className={style.button}
        onClick={props.onRequestRecoverAccount}
        color="primary"
        size="medium"
      >
        <FormattedMessage id="register.intro.button.import-account" />
      </Button>
    </div>
  );
};
