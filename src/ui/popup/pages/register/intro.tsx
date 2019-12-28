import React, { FunctionComponent } from "react";

import { Button } from "../../../components/button";

import style from "./style.module.scss";

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
        New Account
      </Button>
      <Button
        className={style.button}
        onClick={props.onRequestRecoverAccount}
        color="primary"
        size="medium"
      >
        Import Account
      </Button>
    </div>
  );
};
