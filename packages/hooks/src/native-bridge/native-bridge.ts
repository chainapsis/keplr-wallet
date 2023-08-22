import { ChainGetter } from "@keplr-wallet/stores";
import { useFeeConfig, useGasConfig, useMemoConfig } from "../tx";
import { useNativeBridgeAmountConfig } from "./amount";
import { useNativeBridgeRecipientConfig } from "./reciepient";
import { QueriesStore } from "../tx/internal";

/**
 * useIBCTransferConfig returns the configs for IBC transfer.
 * The recipient config's chain id should be the destination chain id for IBC.
 * But, actually, the recipient config's chain id would be set as the sending chain id if the channel not set.
 * So, you should remember that the recipient config's chain id is equalt to the sending chain id, if channel not set.
 * @param chainGetter
 * @param queriesStore
 * @param accountStore
 * @param chainId
 * @param sender
 * @param options
 */
export const useNativeBridgeConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string
) => {
  const amountConfig = useNativeBridgeAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    sender,
    amountConfig,
    gasConfig
  );
  // Due to the circular references between the amount config and gas/fee configs,
  // set the fee config of the amount config after initing the gas/fee configs.
  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useNativeBridgeRecipientConfig(chainGetter, chainId);

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
