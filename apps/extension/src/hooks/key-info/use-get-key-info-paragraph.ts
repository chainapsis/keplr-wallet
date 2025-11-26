import { KeyInfo } from "@keplr-wallet/background";
import { useMemo } from "react";
import { App, AppCoinType } from "@keplr-wallet/ledger-cosmos";
import { useIntl } from "react-intl";
export const useGetKeyInfoParagraph = (
  keyInfo: KeyInfo,
  whenHardwareAlwaysShowBip44Path: boolean = false
) => {
  const intl = useIntl();

  const paragraph = useMemo(() => {
    if (keyInfo.insensitive["bip44Path"]) {
      const bip44Path = keyInfo.insensitive["bip44Path"] as any;

      // -1 means it can be multiple coin type.
      let coinType = -1;
      if (keyInfo.type === "ledger") {
        const ledgerAppCandidate: (
          | App
          | "Ethereum"
          | "Starknet"
          | "Bitcoin"
          | "Bitcoin Test"
        )[] = [
          "Cosmos",
          "Terra",
          "Secret",
          "THORChain",
          "Ethereum",
          "Starknet",
          "Bitcoin",
          "Bitcoin Test",
        ];

        const app: (
          | App
          | "Ethereum"
          | "Starknet"
          | "Bitcoin"
          | "Bitcoin Test"
        )[] = [];
        for (const ledgerApp of ledgerAppCandidate) {
          if (keyInfo.insensitive[ledgerApp] != null) {
            app.push(ledgerApp);
          }
        }

        if (app.length === 0 || app.length >= 2) {
          coinType = -1;
        } else if (app[0] === "Ethereum") {
          coinType = 60;
        } else if (app[0] === "Starknet") {
          coinType = 9004;
        } else if (app[0] === "Bitcoin") {
          coinType = 0;
        } else if (app[0] === "Bitcoin Test") {
          coinType = 1;
        } else {
          const c = AppCoinType[app[0]];
          if (c != null) {
            coinType = c;
          } else {
            coinType = -1;
          }
        }

        if (
          app.length === 1 &&
          app.includes("Cosmos") &&
          bip44Path.account === 0 &&
          bip44Path.change === 0 &&
          bip44Path.addressIndex === 0 &&
          !whenHardwareAlwaysShowBip44Path
        ) {
          return;
        }

        return `m/-'/${coinType >= 0 ? coinType : "-"}'/${bip44Path.account}'/${
          bip44Path.change
        }/${bip44Path.addressIndex}${(() => {
          if (app.length === 1) {
            if (
              app[0] !== "Cosmos" &&
              app[0] !== "Ethereum" &&
              app[0] !== "Starknet" &&
              app[0] !== "Bitcoin" &&
              app[0] !== "Bitcoin Test"
            ) {
              return ` ${intl.formatMessage({
                id: `page.wallet.keyring-item.bip44-path-${app[0]}-text`,
              })}`;
            }
          }

          return "";
        })()}`;
      }

      if (
        bip44Path.account === 0 &&
        bip44Path.change === 0 &&
        bip44Path.addressIndex === 0
      ) {
        return;
      }

      return `m/-'/${coinType >= 0 ? coinType : "-"}'/${bip44Path.account}'/${
        bip44Path.change
      }/${bip44Path.addressIndex}`;
    }

    if (
      keyInfo.type === "private-key" &&
      typeof keyInfo.insensitive === "object" &&
      keyInfo.insensitive["keyRingMeta"] &&
      typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
      keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
      typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
    ) {
      const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
      if (
        web3Auth["type"] &&
        web3Auth["email"] &&
        typeof web3Auth["type"] === "string" &&
        typeof web3Auth["email"] === "string"
      ) {
        return web3Auth["email"];
      }
    }
  }, [intl, keyInfo.insensitive, keyInfo.type]);

  return paragraph;
};
