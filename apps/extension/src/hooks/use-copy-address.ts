import { useStore } from "../stores";
import { DenomHelper } from "@keplr-wallet/common";
import { ViewToken } from "../pages/main";

export const useCopyAddress = (viewToken: ViewToken): string | undefined => {
  const { accountStore, chainStore } = useStore();

  if (
    new DenomHelper(viewToken.token.currency.coinMinimalDenom).type !==
      "native" ||
    viewToken.token.currency.coinMinimalDenom.startsWith("ibc/")
  ) {
    return undefined;
  }

  const account = accountStore.getAccount(viewToken.chainInfo.chainId);

  if ("bitcoin" in viewToken.chainInfo) {
    return account.bitcoinAddress?.bech32Address;
  }

  if ("starknet" in viewToken.chainInfo) {
    return account.starknetHexAddress;
  }

  const isEVMOnlyChain = chainStore.isEvmOnlyChain(viewToken.chainInfo.chainId);
  return isEVMOnlyChain ? account.ethereumHexAddress : account.bech32Address;
};
