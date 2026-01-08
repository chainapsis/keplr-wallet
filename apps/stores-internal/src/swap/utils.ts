import { IChainStore } from "@keplr-wallet/stores";

/**
 * Normalize denom for swap API requests.
 *
 * @param preserveCase - If true, preserves the original case of Cosmos denoms.
 *   This is required for tx and route requests because the skip server
 *   handles Cosmos denoms in a case-sensitive manner.
 *   (e.g., "factory/.../allETH" must not become "factory/.../alleth")
 */
export function normalizeDenom(
  chainStore: IChainStore,
  chainId: string,
  denom: string,
  preserveCase: boolean = false
): string {
  const lowerCaseDenom = denom.toLowerCase();
  if (lowerCaseDenom.startsWith("erc20:")) {
    return lowerCaseDenom.replace("erc20:", "");
  }

  if (chainStore.hasChain(chainId) && chainId.startsWith("eip155:")) {
    const currencies = chainStore.getChain(chainId).currencies;
    if (
      currencies.length > 0 &&
      currencies[0].coinMinimalDenom === lowerCaseDenom
    ) {
      return "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
  }

  if (preserveCase) {
    return denom;
  }

  return lowerCaseDenom;
}

export function normalizeChainId(chainId: string): string {
  if (chainId.startsWith("eip155:")) {
    return chainId.replace("eip155:", "");
  }
  return chainId;
}
