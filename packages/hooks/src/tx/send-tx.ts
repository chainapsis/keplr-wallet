import { ChainGetter } from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useMemoConfig,
  useRecipientConfig,
  useSenderConfig,
} from "./index";
import { useAmountConfig } from "./amount";
import { QueriesStore } from "./internal";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  chainId: string,
  sender: string,
  initialGas: number,
  options: {
    allowHexAddressToBech32Address?: boolean;
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
