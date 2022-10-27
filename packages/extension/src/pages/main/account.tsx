import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../components/address";

import styleAccount from "./account.module.scss";

import { WalletStatus } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useNotification } from "../../components/notification";
import { useStore } from "../../stores";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const intl = useIntl();

  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
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
    },
    [accountInfo.walletStatus, notification, intl]
  );

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
        <div
          className={styleAccount.address}
          onClick={() => copyAddress(accountInfo.bech32Address)}
        >
          <Address
            maxCharacters={22}
            lineBreakBeforePrefix={false}
            iconClass="fas fa-copy"
          >
            {accountInfo.walletStatus === WalletStatus.Loaded &&
            accountInfo.bech32Address
              ? accountInfo.bech32Address
              : "..."}
          </Address>
        </div>
        <div style={{ flex: 1 }} />
      </div>
      {accountInfo.hasEvmosHexAddress && (
        <div
          className={styleAccount.containerAccount}
          style={{ marginTop: "2px" }}
        >
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.evmosHexAddress)}
          >
            <Address maxCharacters={22} lineBreakBeforePrefix={false}>
              {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.evmosHexAddress
                ? accountInfo.evmosHexAddress
                : "..."}
            </Address>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
    </div>
  );
});
