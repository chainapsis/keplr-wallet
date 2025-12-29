import { useStore } from "../stores";
import { DenomHelper } from "@keplr-wallet/common";
import { ViewToken } from "../pages/main";

export const useCopyAddress = (viewToken: ViewToken): string | undefined => {
  const { accountStore, chainStore } = useStore();

  const denomHelper = new DenomHelper(
    viewToken.token.currency.coinMinimalDenom
  );
  const account = accountStore.getAccount(viewToken.chainInfo.chainId);

  if ("bitcoin" in viewToken.chainInfo) {
    return account.bitcoinAddress?.bech32Address;
  }

  // only ETH and STRK are supported on Starknet
  if ("starknet" in viewToken.chainInfo) {
    if (denomHelper.type !== "erc20") {
      return undefined;
    }

    const { ethContractAddress, strkContractAddress } =
      viewToken.chainInfo.starknet;
    const isSupportedToken =
      denomHelper.contractAddress === ethContractAddress ||
      denomHelper.contractAddress === strkContractAddress;

    if (!isSupportedToken) {
      return undefined;
    }

    return account.starknetHexAddress;
  }

  const isEVMOnlyChain = chainStore.isEvmOnlyChain(viewToken.chainInfo.chainId);
  if (isEVMOnlyChain) {
    return account.ethereumHexAddress;
  }

  if (
    denomHelper.type !== "native" ||
    viewToken.token.currency.coinMinimalDenom.startsWith("ibc/")
  ) {
    return undefined;
  }

  return account.bech32Address;
};
