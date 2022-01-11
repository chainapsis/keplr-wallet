import { APP_PORT, Env, MessageSender } from "@keplr-wallet/router";
import { RNMessageRequesterInternalToUI } from "./requester";

export class RNEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = RNEnv.checkIsInternalMessage(sender);

    return {
      isInternalMsg,
      requestInteraction: async (_, msg) => {
        // Url is not used in the mobile envirment.
        // Url is neccessary to open the popup to interact with user in the extension environment.
        // But, in mobile environment, the background and frontend are running in the same proccess.
        // So, there is no need to open the popup from background.
        // The interaction should be handled via the interaction stores.
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
