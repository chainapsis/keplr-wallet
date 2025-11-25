import { IChainStore } from "@keplr-wallet/stores";

export function normalizeDenom(
  chainStore: IChainStore,
  chainId: string,
  denom: string
): string {
  denom = denom.toLowerCase();
  if (denom.startsWith("erc20:")) {
    return denom.replace("erc20:", "");
  }

  if (chainStore.hasChain(chainId) && chainId.startsWith("eip155:")) {
    const currencies = chainStore.getChain(chainId).currencies;
    if (currencies.length > 0 && currencies[0].coinMinimalDenom === denom) {
      return "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
  }

  return denom;
}

export function normalizeChainId(chainId: string): string {
  if (chainId.startsWith("eip155:")) {
    return chainId.replace("eip155:", "");
  }
  return chainId;
}
