import {
  IBaseAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IMemoConfig,
  IRecipientConfig,
  ISenderConfig,
} from "./types";
import { IIBCChannelConfig } from "../ibc";

// CONTRACT: Use with `observer`
export const useTxConfigsValidate = (configs: {
  senderConfig?: ISenderConfig;
  recipientConfig?: IRecipientConfig;
  gasConfig?: IGasConfig;
  amountConfig?: IBaseAmountConfig;
  feeConfig?: IFeeConfig;
  memoConfig?: IMemoConfig;
  channelConfig?: IIBCChannelConfig;
  gasSimulator?: IGasSimulator;
}) => {
  const interactionBlocked = (() => {
    if (
      configs.senderConfig?.uiProperties.error ||
      configs.recipientConfig?.uiProperties.error ||
      configs.gasConfig?.uiProperties.error ||
      configs.amountConfig?.uiProperties.error ||
      configs.feeConfig?.uiProperties.error ||
      configs.memoConfig?.uiProperties.error ||
      configs.channelConfig?.uiProperties.error ||
      configs.gasSimulator?.uiProperties.error
    ) {
      return true;
    }

    if (
      configs.senderConfig?.uiProperties.loadingState === "loading-block" ||
      configs.recipientConfig?.uiProperties.loadingState === "loading-block" ||
      configs.gasConfig?.uiProperties.loadingState === "loading-block" ||
      configs.amountConfig?.uiProperties.loadingState === "loading-block" ||
      configs.feeConfig?.uiProperties.loadingState === "loading-block" ||
      configs.memoConfig?.uiProperties.loadingState === "loading-block" ||
      configs.channelConfig?.uiProperties.loadingState === "loading-block" ||
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
