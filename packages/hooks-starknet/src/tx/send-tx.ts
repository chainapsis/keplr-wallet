import { ChainGetter } from "@keplr-wallet/stores";
import {
  useFeeConfig,
  useGasConfig,
  useRecipientConfig,
  useSenderConfig,
} from "./index";
import { useAmountConfig } from "./amount";
import { StarknetQueriesStore } from "@keplr-wallet/stores-starknet";

export const useSendTxConfig = (
  chainGetter: ChainGetter,
  starknetQueriesStore: StarknetQueriesStore,
  chainId: string,
  sender: string,
  initialGas: number
) => {
  const senderConfig = useSenderConfig(
    chainGetter,
    starknetQueriesStore,
    chainId,
    sender
  );

  const amountConfig = useAmountConfig(
    chainGetter,
    starknetQueriesStore,
    chainId,
    senderConfig
  );

  const gasConfig = useGasConfig(chainGetter, chainId, initialGas);
  const feeConfig = useFeeConfig(
    chainGetter,
    starknetQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  amountConfig.setFeeConfig(feeConfig);

  const recipientConfig = useRecipientConfig(chainGetter, chainId);

  return {
    senderConfig,
    amountConfig,
    gasConfig,
    feeConfig,
    recipientConfig,
  };
};
