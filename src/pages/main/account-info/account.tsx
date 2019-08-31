import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.scss";

export const AccountView: FunctionComponent = () => {
  return (
    <div className={styleAccount.containerAccount}>
      <div className={styleAccount.innerContainerAccount}>
        <div className={styleAccount.myAccount}>My acccount</div>
        <div className={styleAccount.address}>
          <Address maxCharacters={22} lineBreakBeforePrefix={true}>
            cosmos17arhk35ch59txp727ljuxgp9xqwnjz7lmmnmzh
          </Address>
        </div>
      </div>
      <div className={styleAccount.flexEmpty} />
      <div className={styleAccount.innerContainerAccountButton}>test</div>
    </div>
  );
};
