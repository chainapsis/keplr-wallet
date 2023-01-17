import SignClient from "@walletconnect/sign-client";
import { autorun, makeObservable, observable } from "mobx";
import { SessionProposalSchema } from "./schema";

export class WalletConnectV2Store {
  // This field is null until init
  @observable.ref
  signClient: SignClient | undefined = undefined;

  protected sessionProposalResolverMap = new Map<
    string,
    {
      resolve: () => void;
      reject: (e: Error) => void;
    }
  >();

  constructor() {
    makeObservable(this);

    this.init();
  }

  protected async init(): Promise<void> {
    this.signClient = await SignClient.init({
      projectId: "649c7f2209d1d1c8b6b9c2686fadd03e",
      relayerUrl: "wss://relay.walletconnect.com",
    });

    this.signClient.on("session_proposal", this.onSessionProposal.bind(this));
  }

  protected async onSessionProposal(event: any) {
    const signClient = await this.ensureInit();

    const id = event?.id;
    if (!id) {
      // In this case, nothing to do.
      console.log("Invalid wc2 request");
      return;
    }
    const topic = event?.params?.pairingTopic;
    if (!topic) {
      // In typing, they say that pairingTopic can be null.
      // However, in that case, we can't do anything.
      await signClient.reject({
        id,
        reason: {
          code: 1,
          message: "there is no pairing topic",
        },
      });
      return;
    }

    const resolver = this.sessionProposalResolverMap.get(topic);
    if (resolver) {
      resolver.resolve();
      this.sessionProposalResolverMap.delete(topic);
    }

    try {
      const proposal = await SessionProposalSchema.validateAsync(event);
      console.log(JSON.stringify(proposal));
    } catch (e) {
      await signClient.reject({
        id,
        reason: {
          code: 1,
          message: e.message || e.toString(),
        },
      });
    }
  }

  async pair(uri: string) {
    const topic = (() => {
      let str = uri.replace("wc:", "");
      const i = str.indexOf("?");
      if (i >= 0) {
        str = str.slice(0, i);
      }
      str = str.replace("@2", "");
      return str;
    })();

    const signClient = await this.ensureInit();

    return new Promise<void>((resolve, reject) => {
      this.sessionProposalResolverMap.set(topic, {
        resolve,
        reject,
      });

      signClient.pair({ uri });

      setTimeout(() => {
        reject(new Error("Timeout"));

        this.sessionProposalResolverMap.delete(topic);
      }, 10000);
    });
  }

  protected async ensureInit(): Promise<SignClient> {
    if (this.signClient) {
      return this.signClient;
    }

    return new Promise((resolve) => {
      const disposal = autorun(() => {
        if (this.signClient) {
          resolve(this.signClient);

          if (disposal) {
            disposal();
          }
        }
      });
    });
  }
}
