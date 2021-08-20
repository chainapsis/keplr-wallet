import { APP_PORT, Env, MessageSender } from "@keplr-wallet/router";
import { InteractionModalStore } from "../stores/interaction-modal";
import { RNMessageRequesterInternalToUI } from "./requester";

export class RNEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = RNEnv.checkIsInternalMessage(sender);

    return {
      isInternalMsg,
      requestInteraction: async (url, msg) => {
        InteractionModalStore.pushUrl(url);
        return await new RNMessageRequesterInternalToUI().sendMessage(
          APP_PORT,
          msg
        );
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
