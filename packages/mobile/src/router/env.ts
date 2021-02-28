import { Env, MessageSender } from "@keplr-wallet/router";

export class RNEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = RNEnv.checkIsInternalMessage(sender);

    return {
      isInternalMsg,
      requestInteraction: () => {
        throw new Error("TODO: Implement me");
      },
    };
  };

  protected static readonly checkIsInternalMessage = (
    sender: MessageSender
  ): boolean => {
    return (
      sender.id === "react-native" && sender.url === "react-native://internal"
    );
  };
}
