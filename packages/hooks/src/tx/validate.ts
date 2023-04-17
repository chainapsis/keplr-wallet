import {
  IBaseAmountConfig,
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  ISenderConfig,
} from "./types";

// CONTRACT: Use with `observer`
export const useTxConfigsValidate = (configs: {
  senderConfig?: ISenderConfig;
  gasConfig?: IGasConfig;
  amountConfig?: IBaseAmountConfig;
  feeConfig?: IFeeConfig;
  memoConfig?: IMemoConfig;
}) => {
  const interactionBlocked = (() => {
    if (
      configs.senderConfig?.uiProperties.error ||
      configs.gasConfig?.uiProperties.error ||
      configs.amountConfig?.uiProperties.error ||
      configs.feeConfig?.uiProperties.error ||
      configs.memoConfig?.uiProperties.error
    ) {
      return true;
    }

    if (
      configs.senderConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasConfig?.uiProperties.loadingState === "loading-block" ||
      configs.amountConfig?.uiProperties.loadingState === "loading-block" ||
      configs.feeConfig?.uiProperties.loadingState === "loading-block" ||
      configs.memoConfig?.uiProperties.loadingState === "loading-block"
    ) {
      return true;
    }

    return false;
  })();

  return {
    interactionBlocked,
  };
};
