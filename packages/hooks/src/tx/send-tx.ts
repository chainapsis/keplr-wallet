import { ChainGetter, MsgOpts } from "@keplr/stores";
import { ObservableQueryBalances } from "@keplr/stores/build/query/balances";
import { useFeeConfig, useMemoConfig, useRecipientConfig } from "./index";
import { useSendGasConfig } from "./send-gas";
import { useAmountConfig } from "./amount";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sendMsgOpts: MsgOpts["send"],
  sender: string,
  queryBalances: ObservableQueryBalances,
  ensEndpoint?: string
) => {
  const amountConfig = useAmountConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useSendGasConfig(
    chainGetter,
    chainId,
    amountConfig,
    sendMsgOpts
  );
  const feeConfig = useFeeConfig(
    chainGetter,
    chainId,
    sender,
    queryBalances,
    amountConfig,
    gasConfig
  );
  const recipientConfig = useRecipientConfig(chainGetter, chainId, ensEndpoint);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
