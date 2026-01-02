import { ModularChainInfo } from "@keplr-wallet/types";
import { ChainStore } from "@keplr-wallet/stores";

export const determineLedgerApp = (
  chainStore: ChainStore,
  info: ModularChainInfo,
  cid: string
): string => {
  if (chainStore.isEvmOrEthermintLikeChain(cid)) {
    return "Ethereum";
  }

  if ("starknet" in info) {
    return "Starknet";
  }
  if ("bitcoin" in info) {
    const coinType = info.bitcoin.bip44.coinType;
    return coinType === 1 ? "Bitcoin Test" : "Bitcoin";
  }

  return "Cosmos";
};
