import { APP_PORT, Env, MessageSender } from "@keplr-wallet/router";

import { MessageRequesterInternalToUi } from "../message-requester";

export function produceEnv(sender: MessageSender): Env {
  return {
    isInternalMsg: isInternalMessage(sender),
    requestInteraction: async (_url, message) => {
      console.log("requesting interaction", message);
      return await new MessageRequesterInternalToUi().sendMessage(
        APP_PORT,
        message
      );
    },
  };
}

function isInternalMessage(sender: MessageSender): boolean {
  return (
    sender.id === "react-native" && sender.url === "react-native://internal"
  );
}
