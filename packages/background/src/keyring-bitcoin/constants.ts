import { Network } from "@keplr-wallet/types";

export const ROUTE = "keyring-bitcoin";

export const mainnet = {
  id: Network.MAINNET,
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "bc",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

export const testnet = {
  id: Network.TESTNET,
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "tb",
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

export const signet = {
  ...testnet,
  id: Network.SIGNET,
};

export enum BitcoinInscriptionsApiUrl {
  MAINNET = "https://mainnet-btc-inscriptions.keplr.app",
  TESTNET = "https://testnet-btc-inscriptions.keplr.app",
  SIGNET = "https://signet-btc-inscriptions.keplr.app",
}

export const getBitcoinInscriptionsApiUrl = (network: Network) => {
  switch (network) {
    case Network.LIVENET:
    case Network.MAINNET:
      return BitcoinInscriptionsApiUrl.MAINNET;
    case Network.TESTNET:
      return BitcoinInscriptionsApiUrl.TESTNET;
    case Network.SIGNET:
      return BitcoinInscriptionsApiUrl.SIGNET;
  }
};
