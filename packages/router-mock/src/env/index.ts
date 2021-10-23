import { Env, MessageSender } from "@keplr-wallet/router";
import { ExtensionEnv } from "@keplr-wallet/router-extension";

export class MockEnv {
  constructor(protected readonly id: string, protected readonly url: string) {}

  envProducer(): (sender: MessageSender) => Env {
    return (sender: MessageSender): Env => {
      const isInternalMsg = ExtensionEnv.checkIsInternalMessage(
        sender,
        this.id,
        this.url
      );

      return {
        isInternalMsg,
        requestInteraction: () => {
          throw new Error("TODO: Implement me");
        },
      };
    };
  }
}
