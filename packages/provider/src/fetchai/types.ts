export type Method = `wallet.${FetchWalletApiMethod}`;

export type FetchWalletApiMethod =
  | WalletMethod
  | `signing.${WalletSigningMethod}`
  | `networks.${NetworksApiMethod}`
  | `accounts.${AccountsApiMethod}`
  | `addressBook.${AddressBookApiMethods}`;

export type FetchWalletMethod =
  | WalletMethod
  | WalletSigningMethod
  | NetworksApiMethod
  | AccountsApiMethod
  | AddressBookApiMethods;

export type WalletSigningMethod =
  | "getCurrentKey"
  | "signAmino"
  | "signDirect"
  | "signArbitrary"
  | "verifyArbitrary"
  | "getOfflineSigner"
  | "getOfflineDirectSigner"
  | "getOfflineAminoSigner"
  | "signEthereum";

export type WalletMethod =
  | "status"
  | "lockWallet"
  | "unlockWallet"
  | "restoreWallet"
  | "enable"
  | "disable";

export type NetworksApiMethod =
  | "getNetwork"
  | "switchToNetwork"
  | "switchToNetworkByChainId"
  | "listNetworks";

export type AccountsApiMethod =
  | "currentAccount"
  | "switchAccount"
  | "listAccounts"
  | "getAccount";

export type AddressBookApiMethods =
  | "listEntries"
  | "addEntry"
  | "updateEntry"
  | "deleteEntry";
