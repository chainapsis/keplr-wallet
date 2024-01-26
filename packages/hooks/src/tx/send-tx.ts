import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
} from "./index";
import { useAmountConfig } from "./amount";
import { QueriesStore } from "./internal";
import { useIBCAmountConfig, useIBCChannelConfig } from "../ibc";
import { useIBCRecipientConfig } from "../ibc/reciepient";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  initialGas: number,
  options: {
    allowHexAddressOnEthermint?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
    };
    computeTerraClassicTax?: boolean;
  } = {}
) => {
  const senderConfig = useSenderConfig(chainGetter, chainId, sender);

  const amountConfig = useAmountConfig(
    chainGetter,
    queriesStore,
    chainId,
    senderConfig
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
    options
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId, options);

  return {
    senderConfig,
    amountConfig,
    memoConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
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
    allowHexAddressOnEthermint?: boolean;
    icns?: {
      chainId: string;
      resolverContractAddress: string;
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
