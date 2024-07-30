import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useSenderConfig,
} from "../tx";
import { useIBCAmountConfig } from "./amount";
import { useIBCChannelConfig } from "./channel";
import { useIBCRecipientConfig } from "./reciepient";

/**
 * useIBCTransferConfig returns the configs for IBC transfer.
 * The recipient config's chain id should be the destination chain id for IBC.
 * But, actually, the recipient config's chain id would be set as the sending chain id if the channel not set.
 * So, you should remember that the recipient config's chain id is equal to the sending chain id, if channel not set.
 * @param chainGetter
 * @param queriesStore
 * @param accountStore
 * @param chainId
 * @param sender
 * @param options
 */
export const useIBCTransferConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  initialGas: number,
  options: {
    allowHexAddressToBech32Address?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
  } = {}
) => {
  const channelConfig = useIBCChannelConfig();

  const senderConfig = useSenderConfig(chainGetter, chainId, sender);

  const amountConfig = useIBCAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    channelConfig,
    true
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useIBCRecipientConfig(
    chainGetter,
    chainId,
    channelConfig,
    options,
    true
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    channelConfig,
    senderConfig,
  };
};

export const useSendMixedIBCTransferConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  initialGas: number,
  isIBCTransfer: boolean,
  options: {
    allowHexAddressToBech32Address?: boolean;
    allowHexAddressOnly?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
    ens?: {
      chainId: string;
    };
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const channelConfig = useIBCChannelConfig(!isIBCTransfer);

  const senderConfig = useSenderConfig(chainGetter, chainId, sender);

  const amountConfig = useIBCAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    channelConfig,
    isIBCTransfer
  );

  const memoConfig = useMemoConfig(chainGetter, chainId);
  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig,
    {
      computeTerraClassicTax: isIBCTransfer
        ? false
        : options.computeTerraClassicTax,
    }
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useIBCRecipientConfig(
    chainGetter,
    chainId,
    channelConfig,
    options,
    isIBCTransfer
  );

  return {
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
    channelConfig,
    senderConfig,
  };
};
