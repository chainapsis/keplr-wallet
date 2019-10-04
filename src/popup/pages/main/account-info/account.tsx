import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  return (
    <div className={styleAccount.containerAccount}>
      <div className={styleAccount.innerContainerAccount}>
        <div className={styleAccount.myAccount}>My acccount</div>
        <div className={styleAccount.address}>
          <Address maxCharacters={22} lineBreakBeforePrefix={true}>
            {accountStore.isAddressFetching ? "" : accountStore.bech32Address}
          </Address>
        </div>
      </div>
      <div className={styleAccount.flexEmpty} />
      <div className={styleAccount.innerContainerAccountButton}>test</div>
    </div>
  );
});
