import { APP_PORT, Env, Message, MessageSender } from "@keplr-wallet/router";
import { InteractionModalStore } from "../stores/interaction-modal";
import { RNMessageRequester } from "./requester";

export class RNEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = RNEnv.checkIsInternalMessage(sender);

    return {
      isInternalMsg,
      requestInteraction: async (url: string, msg: Message<unknown>) => {
        InteractionModalStore.pushUrl(url);
        return await new RNMessageRequester().sendMessage(APP_PORT, msg);
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
