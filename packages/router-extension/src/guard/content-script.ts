import { Env, Guard, MessageSender, Message } from "@keplr-wallet/router";

export class ContentScriptGuards {
  // Router in content script will reject all messages that can be sent from the external.
  static readonly checkMessageIsInternal: Guard = (
    env: Omit<Env, "requestInteraction">,
    msg: Message<unknown>,
    sender: MessageSender
  ): Promise<void> => {
    if (!env.isInternalMsg || msg.approveExternal(env, sender)) {
      throw new Error(
        "Content script can't handle the message that is able to be sent from external"
      );
    }

    return Promise.resolve();
  };
}
