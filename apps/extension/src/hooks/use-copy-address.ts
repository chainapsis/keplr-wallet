import { useStore } from "../stores";
import { DenomHelper } from "@keplr-wallet/common";
import { ViewToken } from "../pages/main";

export const useCopyAddress = (viewToken: ViewToken): string | undefined => {
  const { accountStore, chainStore } = useStore();

  const denomHelper = new DenomHelper(
    viewToken.token.currency.coinMinimalDenom
  );
  const account = accountStore.getAccount(viewToken.chainInfo.chainId);

  if (denomHelper.type === "erc20" && "starknet" in viewToken.chainInfo) {
    const isETH =
      denomHelper.contractAddress ===
      viewToken.chainInfo.starknet.ethContractAddress;
    const isSTRK =
      denomHelper.contractAddress ===
      viewToken.chainInfo.starknet.strkContractAddress;
    if (isETH || isSTRK) {
      return account.starknetHexAddress;
    }
  }

  if (
    denomHelper.type !== "native" ||
    viewToken.token.currency.coinMinimalDenom.startsWith("ibc/")
  ) {
    return undefined;
  }

  if ("bitcoin" in viewToken.chainInfo) {
    return account.bitcoinAddress?.bech32Address;
  }

  const isEVMOnlyChain = chainStore.isEvmOnlyChain(viewToken.chainInfo.chainId);
  return isEVMOnlyChain ? account.ethereumHexAddress : account.bech32Address;
};
