import {
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IRecipientConfig,
  ISenderConfig,
} from "./types";

// CONTRACT: Use with `observer`
export const useTxConfigsValidate = (configs: {
  senderConfig?: ISenderConfig;
  recipientConfig?: IRecipientConfig;
  gasConfig?: IGasConfig;
  feeConfig?: IFeeConfig;
  gasSimulator?: IGasSimulator;
}) => {
  const interactionBlocked = (() => {
    if (
      configs.senderConfig?.uiProperties.error ||
      configs.recipientConfig?.uiProperties.error ||
      configs.gasConfig?.uiProperties.error ||
      configs.feeConfig?.uiProperties.error ||
      configs.gasSimulator?.uiProperties.error
    ) {
      return true;
    }

    if (
      configs.senderConfig?.uiProperties.loadingState === "loading-block" ||
      configs.recipientConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasConfig?.uiProperties.loadingState === "loading-block" ||
      configs.feeConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasSimulator?.uiProperties.loadingState === "loading-block"
    ) {
      return true;
    }

    return false;
  })();

  return {
    interactionBlocked,
  };
};
