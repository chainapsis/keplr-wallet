import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { useNotification } from "../../../components/notification";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const notification = useNotification();

  const copyAddress = useCallback(async () => {
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
  }, [notification, accountStore.bech32Address]);

  return (
    <div className={styleAccount.containerAccount}>
      <div style={{ flex: 1 }} />
      <div className={styleAccount.address} onClick={copyAddress}>
        <Address maxCharacters={22} lineBreakBeforePrefix={false}>
          {accountStore.isAddressFetching ? "..." : accountStore.bech32Address}
        </Address>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
});
