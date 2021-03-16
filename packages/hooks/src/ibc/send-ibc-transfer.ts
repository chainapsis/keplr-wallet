import { ChainGetter, MsgOpts } from "@keplr-wallet/stores";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
import { useFeeConfig, useMemoConfig, useRecipientConfig } from "../tx";
import { useIBCAmountConfig } from "./amount";
import { useIBCTransferGasConfig } from "./gas";

export const useIBCTransferConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  destinationChainId: string,
  msgOpts: MsgOpts["ibc"]["transfer"],
  sender: string,
  queryBalances: ObservableQueryBalances,
  ensEndpoint?: string
) => {
  const amountConfig = useIBCAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useIBCTransferGasConfig(chainGetter, chainId, msgOpts);
  const feeConfig = useFeeConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    amountConfig,
    gasConfig
  );
  const recipientConfig = useRecipientConfig(
    chainGetter,
    destinationChainId,
    ensEndpoint
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
