import AsyncStorage from "@react-native-async-storage/async-storage";
import WalletConnectClient, { CLIENT_EVENTS } from "@walletconnect/client";
import { SessionTypes } from "@walletconnect/types";

export enum WalletConnectStatus {
  NOT_INIT,
  INITED,
}

export class WalletConnectManager {
  protected client?: WalletConnectClient;

  constructor() {
    this.init();
  }

  async init() {
    this.client = await WalletConnectClient.init({
      controller: true,
      relayProvider: "wss://relay.walletconnect.org",
      storageOptions: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        asyncStorage: AsyncStorage,
      },
    });

    this.client.on(CLIENT_EVENTS.session.proposal, this.onSessionProposal);
  }

  protected readonly onSessionProposal = async (
    proposal: SessionTypes.Proposal
  ) => {
    if (!this.client) {
      throw new Error("Client is null");
    }

    // TODO: Check validity.
    await this.client.approve({
      proposal,
      response: {
        state: {
          accounts: [],
        },
      },
    });
  };

  get status(): WalletConnectStatus {
    if (!this.client) {
      return WalletConnectStatus.NOT_INIT;
    }
  }
}

export class WalletConnectStore {}
