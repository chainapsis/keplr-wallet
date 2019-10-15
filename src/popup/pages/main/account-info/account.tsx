import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { Button } from "../../../components/button";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const copyAddress = async () => {
    await navigator.clipboard.writeText(accountStore.bech32Address);
    // TODO: Show success tooltip.
  };

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
      <div className={styleAccount.innerContainerAccountButton}>
        <Button onClick={copyAddress}>
          <span className="icon is-small">
            <i className="fas fa-paste" />
          </span>
        </Button>
      </div>
    </div>
  );
});
