import { ChainGetter, CosmosMsgOpts } from "@keplr-wallet/stores";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
import { useFeeConfig, useMemoConfig } from "../tx";
import { useIBCAmountConfig } from "./amount";
import { useIBCTransferGasConfig } from "./gas";
import { useIBCChannelConfig } from "./channel";
import { useIBCRecipientConfig } from "./reciepient";

/**
 * useIBCTransferConfig returns the configs for IBC transfer.
 * The recipient config's chain id should be the destination chain id for IBC.
 * But, actually, the recipient config's chain id would be set as the sending chain id if the channel not set.
 * So, you should remember that the recipient config's chain id is equalt to the sending chain id, if channel not set.
 * @param chainGetter
 * @param chainId
 * @param msgOpts
 * @param sender
 * @param queryBalances
 * @param ensEndpoint
 */
export const useIBCTransferConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  msgOpts: CosmosMsgOpts["ibcTransfer"],
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
  // Due to the circular references between the amount config and gas/fee configs,
  // set the fee config of the amount config after initing the gas/fee configs.
  amountConfig.setFeeConfig(feeConfig);

  const channelConfig = useIBCChannelConfig();

  const recipientConfig = useIBCRecipientConfig(
    chainGetter,
    chainId,
    channelConfig,
    ensEndpoint
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    channelConfig,
  };
};
