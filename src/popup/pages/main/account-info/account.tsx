import React, { FunctionComponent } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useNotification } from "../../../components/notification";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const notification = useNotification();

  const copyAddress = async () => {
    await navigator.clipboard.writeText(accountStore.bech32Address);
    // TODO: Show success tooltip.
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: "Address copied!",
      canDelete: true,
      transition: {
        duration: 0.25
      }
    });
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
          <span className="icon is-medium">
            <i className="fas fa-paste" />
          </span>
        </Button>
      </div>
    </div>
  );
});
