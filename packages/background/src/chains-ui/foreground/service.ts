import { EnabledChainIdentifiersUpdatedMsg } from "./messages";
import { APP_PORT, MessageRequester } from "@keplr-wallet/router";

export class ChainsUIForegroundService {
  static invokeEnabledChainIdentifiersUpdated(
    eventMsgRequester: MessageRequester,
    valutId: string
  ) {
    eventMsgRequester
      .sendMessage(APP_PORT, new EnabledChainIdentifiersUpdatedMsg(valutId))
      .catch((e) => {
        console.log(e);
        // noop
      });
  }

  constructor(protected handler: (vaultId: string) => void) {}

  invoke(msg: EnabledChainIdentifiersUpdatedMsg): void {
    this.handler(msg.vaultId);
  }
}
