import React, { FunctionComponent, useCallback } from "react";

import { Address } from "../../components/address";

import styleAccount from "./account.module.scss";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useNotification } from "../../components/notification";
import { ToolTip } from "../../components/tooltip";
import { useIntl } from "react-intl";
import { WalletStatus } from "@keplr-wallet/stores";
import { KeplrError } from "@keplr-wallet/router";

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
            : accountInfo.walletStatus === WalletStatus.Rejected
            ? accountInfo.rejectionReason &&
              accountInfo.rejectionReason instanceof KeplrError &&
              accountInfo.rejectionReason.code === 153
              ? "Connect with Ledger"
              : "Unable to Load Key"
            : "Loading..."}
        </div>
        <div style={{ flex: 1 }} />
      </div>
      {accountInfo.walletStatus === WalletStatus.Rejected && (
        <ToolTip
          tooltip={(() => {
            if (
              accountInfo.rejectionReason &&
              accountInfo.rejectionReason instanceof KeplrError &&
              accountInfo.rejectionReason.module === "keyring"
            ) {
              if (accountInfo.rejectionReason.code === 152) {
                // Return unsupported device message
                return "Ledger is not supported for this chain";
              } else if (accountInfo.rejectionReason.code === 153) {
                // Return Ledger app rejection message
                return accountInfo.rejectionReason.message;
              }
            }

            let result = "Failed to load account by unknown reason";
            if (accountInfo.rejectionReason) {
              result += `: ${accountInfo.rejectionReason.toString()}`;
            }

            return result;
          })()}
          theme="dark"
          trigger="hover"
          options={{
            placement: "top",
          }}
        >
          <i
            className={`fas fa-exclamation-triangle text-danger ${styleAccount.unsupportedKeyIcon}`}
          />
        </ToolTip>
      )}
      {accountInfo.walletStatus !== WalletStatus.Rejected && (
        <div className={styleAccount.containerAccount}>
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.bech32Address)}
          >
            <Address maxCharacters={22} lineBreakBeforePrefix={false}>
              {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.bech32Address
                ? accountInfo.bech32Address
                : "..."}
            </Address>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
      {accountInfo.hasEthereumHexAddress && (
        <div
          className={styleAccount.containerAccount}
          style={{ marginTop: "2px" }}
        >
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.ethereumHexAddress)}
          >
            <Address
              isRaw={true}
              tooltipAddress={accountInfo.ethereumHexAddress}
            >
              {accountInfo.walletStatus === WalletStatus.Loaded &&
              accountInfo.ethereumHexAddress
                ? accountInfo.ethereumHexAddress.length === 42
                  ? `${accountInfo.ethereumHexAddress.slice(
                      0,
                      10
                    )}...${accountInfo.ethereumHexAddress.slice(-8)}`
                  : accountInfo.ethereumHexAddress
                : "..."}
            </Address>
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
    </div>
  );
});
