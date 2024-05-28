import React from "react";
import style from "./delete.module.scss";
import { FormattedMessage } from "react-intl";

export const DeleteDescription = () => {
  return (
    <div className={style["innerContainer"]}>
      <img
        className={style["imgLock"]}
        src={require("@assets/png/ic_deletewallet.png")}
        alt="lock"
      />
      <div className={style["heading"]}>Delete Wallet</div>
      <p>
        <FormattedMessage id="setting.clear.warning" />
      </p>
    </div>
  );
};
