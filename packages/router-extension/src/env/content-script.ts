import { Env, MessageSender } from "@keplr-wallet/router";

// ContentScriptEnv only checks the id is same as the extension id.
// And, doesn't support the request interaction.
export class ContentScriptEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = sender.id === browser.runtime.id;

    return {
      isInternalMsg,
      requestInteraction: () => {
        throw new Error(
          "ContentScriptEnv doesn't support `requestInteraction`"
        );
      },
    };
  };
}
