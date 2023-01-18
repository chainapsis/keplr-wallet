import SignClient from "@walletconnect/sign-client";
import { autorun, makeObservable, observable } from "mobx";
import { CosmosEvents, CosmosMethods, SessionProposalSchema } from "./schema";
import { KeyRingStore } from "@keplr-wallet/stores";
import { KeyRingStatus } from "@keplr-wallet/background";
import { ChainStore } from "../chain";
import { WCV2MessageRequester } from "./msg-requester";
import { Keplr } from "@keplr-wallet/provider";
import { RNRouterBackground } from "../../router";

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

  @observable.shallow
  protected pendingSessionProposalMetadataMap = new Map<
    string,
    {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    }
  >();

  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
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

  getSessionMetadata(
    topic: string
  ):
    | {
        name?: string;
        description?: string;
        url?: string;
        icons?: string[];
      }
    | undefined {
    if (!this.signClient) {
      return;
    }

    if (this.pendingSessionProposalMetadataMap.has(topic)) {
      return this.pendingSessionProposalMetadataMap.get(topic);
    }

    try {
      return this.signClient.session.get(topic).peer.metadata;
    } catch (e) {
      console.log(e);
      return;
    }
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
      const metadata = proposal.params?.proposer?.metadata;
      if (metadata) {
        this.pendingSessionProposalMetadataMap.set(topic, metadata);
      }

      const chainIds = proposal.params.requiredNamespaces.cosmos.chains.map(
        (chainId: string) => chainId.replace("cosmos:", "")
      );

      const keplr = this.createKeplrAPI(topic);
      await keplr.enable(chainIds);

      const accounts: string[] = [];
      for (const chainId of chainIds) {
        const key = await keplr.getKey(chainId);
        accounts.push(`cosmos:${chainId}:${key.bech32Address}`);
      }

      const { acknowledged } = await signClient.approve({
        id,
        namespaces: {
          cosmos: {
            accounts,
            methods: CosmosMethods,
            events: CosmosEvents,
          },
        },
      });

      await acknowledged();
    } catch (e) {
      await signClient.reject({
        id,
        reason: {
          code: 1,
          message: e.message || e.toString(),
        },
      });
    } finally {
      this.pendingSessionProposalMetadataMap.delete(topic);
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
    await this.waitInitStores();

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

  protected async waitInitStores(): Promise<void> {
    // Wait until the chain store and account store is ready.
    if (this.chainStore.isInitializing) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (!this.chainStore.isInitializing) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }

    if (this.keyRingStore.status !== KeyRingStatus.UNLOCKED) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (this.keyRingStore.status === KeyRingStatus.UNLOCKED) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }
  }

  protected createKeplrAPI(topic: string) {
    return new Keplr(
      // TODO: Set version
      "",
      "core",
      new WCV2MessageRequester(RNRouterBackground.EventEmitter, topic)
    );
  }
}
