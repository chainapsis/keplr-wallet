import React, { FunctionComponent, useCallback } from "react";

import { Address } from "@components/address";

import styleAccount from "./account.module.scss";

import { WalletStatus } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { ToolTip } from "@components/tooltip";
import { useIntl } from "react-intl";
import { useNotification } from "@components/notification";
import { useStore } from "../../stores";
import { KeplrError } from "@keplr-wallet/router";

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, uiConfigStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const icnsPrimaryName = (() => {
    if (
      uiConfigStore.icnsInfo &&
      chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
    ) {
      const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
      const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
        uiConfigStore.icnsInfo.resolverContractAddress,
        accountStore.getAccount(chainStore.current.chainId).bech32Address
      );

      return icnsQuery.primaryName;
    }
  })();

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
          {(() => {
            if (accountInfo.walletStatus === WalletStatus.Loaded) {
              if (icnsPrimaryName) {
                return icnsPrimaryName;
              }

              if (accountInfo.name) {
                return accountInfo.name;
              }
              return intl.formatMessage({
                id: "setting.keyring.unnamed-account",
              });
            } else if (accountInfo.walletStatus === WalletStatus.Rejected) {
              return "Unable to Load Key";
            } else {
              return "Loading...";
            }
          })()}
        </div>
        {icnsPrimaryName ? (
          <div style={{ display: "flex", alignItems: "center", height: "1px" }}>
            <img
              style={{
                width: "24px",
                height: "24px",
                marginLeft: "2px",
              }}
              src={require("../../public/assets/img/icns-mark.png")}
              alt="icns-registered"
            />
          </div>
        ) : null}
        <div style={{ flex: 1 }} />
      </div>
      {accountInfo.walletStatus === WalletStatus.Rejected && (
        <ToolTip
          tooltip={(() => {
            if (
              accountInfo.rejectionReason &&
              accountInfo.rejectionReason instanceof KeplrError &&
              accountInfo.rejectionReason.module === "keyring" &&
              accountInfo.rejectionReason.code === 152
            ) {
              // Return unsupported device message
              return "Ledger is not supported for this chain";
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
