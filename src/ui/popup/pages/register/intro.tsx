import React, { FunctionComponent } from "react";

import { Button } from "../../../components/button";

import style from "./style.module.scss";

import { FormattedMessage } from "react-intl";

export const IntroInPage: FunctionComponent<{
  onRequestNewAccount: () => void;
  onRequestRecoverAccount: () => void;
}> = props => {
  return (
    <div className={style.container}>
      <div style={{ flex: 1 }} />
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
