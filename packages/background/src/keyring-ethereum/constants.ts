export const ROUTE = "keyring-ethereum";

export const enableAccessSkippedEVMJSONRPCMethods = [
  "keplr_initProviderState",
  "eth_accounts",
];

export const smartAccountSupportedHexChainIds = [
  "0x1", // ethereum
  "0x2105", // base
  "0xa", // optimism
  "0x82", // unichain
  "0xa4b1", // arbitrum
  "0x38", // bnb chain
  "0x138de", // bera chain
  "0xaa36a7", // ethereum sepolia
];
