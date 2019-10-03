import React, { FunctionComponent, useEffect, useState } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const [bech32Address, setBech32Address] = useState("");

  useEffect(() => {
    if (!accountStore.isAccountFetching) {
      setBech32Address(accountStore.bech32Address);
    }
  }, [accountStore.isAccountFetching, accountStore.bech32Address]);

  return (
    <div className={styleAccount.containerAccount}>
      <div className={styleAccount.innerContainerAccount}>
        <div className={styleAccount.myAccount}>My acccount</div>
        <div className={styleAccount.address}>
          <Address maxCharacters={22} lineBreakBeforePrefix={true}>
            {bech32Address}
          </Address>
        </div>
      </div>
      <div className={styleAccount.flexEmpty} />
      <div className={styleAccount.innerContainerAccountButton}>test</div>
    </div>
  );
});
