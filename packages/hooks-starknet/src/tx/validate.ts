import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IRecipientConfig,
  ISenderConfig,
} from "./types";

// CONTRACT: Use with `observer`
export const useTxConfigsValidate = (configs: {
  amountConfig?: IAmountConfig;
  senderConfig?: ISenderConfig;
  recipientConfig?: IRecipientConfig;
  gasConfig?: IGasConfig;
  feeConfig?: IFeeConfig;
  gasSimulator?: IGasSimulator;
}) => {
  const interactionBlocked = (() => {
    /*
     * XXX: 밑의 예시같은 식으로 처리하면 안된다...
     *      그러면 또는(||)에 의해서 앞에꺼에서 true가 나오면 뒤에꺼가 실행도 안되는 문제가 있다.
     *      mobx observable의 특성상 이렇게 처리되면 의도에 맞지 않는다.
     *  if (
          configs.amountConfig?.uiProperties.error ||
          configs.senderConfig?.uiProperties.error ||
          configs.recipientConfig?.uiProperties.error ||
          configs.gasConfig?.uiProperties.error ||
          configs.feeConfig?.uiProperties.error ||
          configs.gasSimulator?.uiProperties.error
        ) {
          return true;
        }
     */
    const amountConfigUIProperties = configs.amountConfig?.uiProperties;
    const senderConfigUIProperties = configs.senderConfig?.uiProperties;
    const recipientConfigUIProperties = configs.recipientConfig?.uiProperties;
    const gasConfigUIProperties = configs.gasConfig?.uiProperties;
    const feeConfigUIProperties = configs.feeConfig?.uiProperties;
    const gasSimulatorUIProperties = configs.gasSimulator?.uiProperties;

    if (
      amountConfigUIProperties?.error ||
      senderConfigUIProperties?.error ||
      recipientConfigUIProperties?.error ||
      gasConfigUIProperties?.error ||
      feeConfigUIProperties?.error ||
      gasSimulatorUIProperties?.error
    ) {
      return true;
    }

    if (
      amountConfigUIProperties?.loadingState === "loading-block" ||
      senderConfigUIProperties?.loadingState === "loading-block" ||
      recipientConfigUIProperties?.loadingState === "loading-block" ||
      gasConfigUIProperties?.loadingState === "loading-block" ||
      feeConfigUIProperties?.loadingState === "loading-block" ||
      gasSimulatorUIProperties?.loadingState === "loading-block"
    ) {
      return true;
    }

    return false;
  })();

  return {
    interactionBlocked,
  };
};
