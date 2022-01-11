import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNotification } from "../../components/notification";
import { useIntl } from "react-intl";
import { WalletStatus } from "@keplr-wallet/stores";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, analyticsStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();

  const notification = useNotification();

  const copyAddress = useCallback(async () => {
    if (accountInfo.walletStatus === WalletStatus.Loaded) {
      await navigator.clipboard.writeText(accountInfo.bech32Address);
      analyticsStore.logEvent("Address copied", {
        chainId: chainStore.current.chainId,
        chainName: chainStore.current.chainName,
      });
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 2,
        content: intl.formatMessage({
          id: "main.address.copied",
        }),
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  }, [accountInfo.walletStatus, accountInfo.bech32Address, notification, intl]);

  return (
    <div>
      <div className={styleAccount.containerName}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.name}>
          {accountInfo.walletStatus === WalletStatus.Loaded
            ? accountInfo.name ||
              intl.formatMessage({
                id: "setting.keyring.unnamed-account",
              })
            : "Loading..."}
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div className={styleAccount.containerAccount}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.address} onClick={copyAddress}>
          <Address maxCharacters={22} lineBreakBeforePrefix={false}>
            {accountInfo.walletStatus === WalletStatus.Loaded &&
            accountInfo.bech32Address
              ? accountInfo.bech32Address
              : "..."}
          </Address>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
});
