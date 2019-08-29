import React, { FunctionComponent } from "react";

import styleAccount from "./account.scss";

export const AccountView: FunctionComponent = () => {
  return (
    <div className={styleAccount.containerAccount}>
      <div className={styleAccount.innerContainerAccount}>
        <div className={styleAccount.myAccount}>My acccount</div>
        <div className={styleAccount.address}>cosmos1nynns8ex9fq6s</div>
      </div>
      <div className={styleAccount.flexEmpty} />
      <div className={styleAccount.innerContainerAccountButton}>test</div>
    </div>
  );
};
