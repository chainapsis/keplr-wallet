import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";

export function convertChainInfoToModularChainInfo(
  chainInfo: ChainInfo | ModularChainInfo,
  isNative: boolean
): ModularChainInfo {
  // evm chain
  const chainIdLikeCAIP2 = chainInfo.chainId.split(":");

  if (
    "evm" in chainInfo &&
    chainInfo.evm &&
    "currencies" in chainInfo &&
    chainIdLikeCAIP2.length === 2 &&
    chainIdLikeCAIP2[0] === "eip155"
  ) {
    return {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
      isTestnet: chainInfo.isTestnet,
      isNative,
      evm: {
        ...chainInfo.evm,
        currencies: chainInfo.currencies,
        feeCurrencies: chainInfo.feeCurrencies,
        bip44: chainInfo.bip44,
        features: chainInfo.features,
      },
    };
  }

  // cosmos chain
  if ("currencies" in chainInfo) {
    return {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
      isNative,
      cosmos: chainInfo,
      ...(chainInfo.evm && {
        evm: {
          ...chainInfo.evm,
          currencies: chainInfo.currencies,
          bip44: chainInfo.bip44,
        },
      }),
    };
  }

  // other chain types
  return chainInfo;
}

export function convertModularChainInfoToChainInfo(
  modularChainInfo: ModularChainInfo
): ChainInfo | undefined {
  if ("cosmos" in modularChainInfo) {
    return {
      ...modularChainInfo.cosmos,
      ...("evm" in modularChainInfo && { evm: modularChainInfo.evm }),
    };
  }

  if ("evm" in modularChainInfo) {
    return {
      chainId: modularChainInfo.chainId,
      chainName: modularChainInfo.chainName,
      chainSymbolImageUrl: modularChainInfo.chainSymbolImageUrl,
      rpc: modularChainInfo.evm.rpc,
      rest: modularChainInfo.evm.rpc, // NOTE: When adding a suggested chain, the 'rest' field must not be empty, so we use 'rpc' instead.
      bip44: modularChainInfo.evm.bip44,
      currencies: modularChainInfo.evm.currencies,
      feeCurrencies: modularChainInfo.evm.feeCurrencies,
      features: modularChainInfo.evm.features,
      isTestnet: modularChainInfo.isTestnet,
      evm: modularChainInfo.evm,
      beta: !modularChainInfo.isNative,
    };
  }
}
