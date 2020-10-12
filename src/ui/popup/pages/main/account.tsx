import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { useNotification } from "../../../components/notification";
import { useIntl } from "react-intl";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, keyRingStore } = useStore();
  const intl = useIntl();

  const notification = useNotification();

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(accountStore.bech32Address);
    // TODO: Show success tooltip.
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied"
      }),
      canDelete: true,
      transition: {
        duration: 0.25
      }
    });
  }, [notification, accountStore.bech32Address]);

  const selectedKeyStore = keyRingStore.multiKeyStoreInfo.find(
    keyStore => keyStore.selected
  );

  const selectedKeyStoreName =
    selectedKeyStore?.meta?.name ??
    intl.formatMessage({
      id: "setting.keyring.unnamed-account"
    });

  return (
    <div>
      <div className={styleAccount.containerName}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.name}>{selectedKeyStoreName}</div>
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleAccount.containerAccount}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.address} onClick={copyAddress}>
          <Address maxCharacters={22} lineBreakBeforePrefix={false}>
            {accountStore.isAddressFetching
              ? "..."
              : accountStore.bech32Address}
          </Address>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
});
