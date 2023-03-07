import SignClient from "@walletconnect/sign-client";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { CosmosEvents, CosmosMethods, SessionProposalSchema } from "./schema";
import { KeyRingStore, PermissionStore } from "@keplr-wallet/stores";
import {
  getBasicAccessPermissionType,
  KeyRingStatus,
} from "@keplr-wallet/background";
import { ChainStore } from "../chain";
import { WCV2MessageRequester } from "./msg-requester";
import { Keplr } from "@keplr-wallet/provider";
import { RNRouterBackground } from "../../router";
import { Buffer } from "buffer/";
import { getRandomBytesAsync } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import Long from "long";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

function noop(fn: () => void): void {
  fn();
}

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

  // Used for invoking reaction by force.
  // To match mobx's reactive system and wallet connect library,
  // it needs to invoke reaction when needed (session added, deleted...)
  @observable
  protected _forceReaction: number = 0;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly permissionStore: PermissionStore
  ) {
    makeObservable(this);

    this.init();
  }

  protected async init(): Promise<void> {
    const projectId = process.env["WC_PROJECT_ID"];
    if (!projectId) {
      return;
    }

    const signClient = await SignClient.init({
      projectId: projectId,
      relayerUrl: "wss://relay.walletconnect.com",
      metadata: {
        name: "Keplr",
        description: "Your Wallet for the Interchain",
        url: "https://www.keplr.app",
        icons: ["https://asset-icons.s3.us-west-2.amazonaws.com/keplr_512.png"],
      },
    });

    runInAction(() => {
      this.signClient = signClient;
    });

    signClient.on("session_proposal", this.onSessionProposal.bind(this));
    signClient.on("session_request", this.onSessionRequest.bind(this));
    signClient.on("session_delete", this.onSessionDelete.bind(this));

    this.eventListener.addEventListener(
      "keplr_keystoreunlock",
      this.accountMayChanged.bind(this)
    );
    this.eventListener.addEventListener(
      "keplr_keystorechange",
      this.accountMayChanged.bind(this)
    );
  }

  async getSessionMetadata(
    id: string
  ): Promise<
    | {
        name?: string;
        description?: string;
        url?: string;
        icons?: string[];
      }
    | undefined
  > {
    if (!this.signClient) {
      return;
    }

    if (this.pendingSessionProposalMetadataMap.has(id)) {
      return this.pendingSessionProposalMetadataMap.get(id);
    }

    const topic = await this.getTopicByRandomId(id);
    if (!topic) {
      return;
    }

    noop(() => this._forceReaction);

    try {
      return this.signClient.session.get(topic).peer.metadata;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getSession(
    topic: string
  ):
    | {
        topic: string;
        namespaces: Record<
          string,
          | {
              accounts: string[];
              methods: string[];
              events: string[];
            }
          | undefined
        >;
        peer: {
          metadata: {
            name?: string;
            description?: string;
            url?: string;
            icons?: string[];
          };
        };
      }
    | undefined {
    if (!this.signClient) {
      return;
    }

    try {
      return this.signClient.session.get(topic);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getSessions(): {
    topic: string;
    namespaces: Record<
      string,
      | {
          accounts: string[];
          methods: string[];
          events: string[];
        }
      | undefined
    >;
    peer: {
      metadata: {
        name?: string;
        description?: string;
        url?: string;
        icons?: string[];
      };
    };
  }[] {
    if (!this.signClient) {
      return [];
    }

    noop(() => this._forceReaction);

    return this.signClient.session.getAll() || [];
  }

  async disconnect(topic: string): Promise<void> {
    if (!this.signClient) {
      return;
    }

    await this.signClient.disconnect({
      topic: topic,
      reason: {
        code: 201,
        message: "disconnected",
      },
    });

    this.forceReaction();

    await this.topicDisconnected(topic);
  }

  protected async accountMayChanged(): Promise<void> {
    await this.ensureInit();

    const sessions = this.getSessions();
    for (const session of sessions) {
      // no need to wait
      this.accountMayChangedSession(session.topic);
    }
  }

  /*
    Based on the permissions allowed for each session, check if any changes are required for accounts in existing sessions.
    If change is required, the session is updated and "accountsChanged" event is raised.
   */
  protected async accountMayChangedSession(topic: string): Promise<void> {
    const signClient = await this.ensureInit();

    const session = this.getSession(topic);
    if (session) {
      if (!session.namespaces["cosmos"]) {
        return;
      }

      const namespaceMap: Record<string, string | undefined> = {};
      for (const account of session.namespaces["cosmos"]!.accounts) {
        const split = account.split(":");
        if (split.length !== 3) {
          return;
        }
        if (split[0] !== "cosmos") {
          return;
        }
        const chainId = split[1];
        namespaceMap[ChainIdHelper.parse(chainId).identifier] = split[2];
      }

      const newNamespaces = {
        cosmos: {
          ...session.namespaces["cosmos"],
          accounts: [] as string[],
        },
      };

      const changedInfos: { caip10: string; account: string }[] = [];

      const randomId = await this.getRandomIdByTopic(topic);
      if (randomId) {
        const permittedChains = await this.permissionStore.getOriginPermittedChains(
          WCV2MessageRequester.getVirtualURL(randomId),
          getBasicAccessPermissionType()
        );

        const keplr = this.createKeplrAPI(randomId);

        for (const chain of permittedChains) {
          if (this.chainStore.hasChain(chain)) {
            const key = await keplr.getKey(chain);
            const chainInfo = this.chainStore.getChain(chain);

            const account = `cosmos:${chainInfo.chainId}:${key.bech32Address}`;

            newNamespaces.cosmos.accounts.push(account);

            if (namespaceMap[chain] !== key.bech32Address) {
              changedInfos.push({
                caip10: `cosmos:${chainInfo.chainId}`,
                account,
              });
            }
          }
        }
      }

      if (changedInfos.length > 0) {
        await signClient.update({
          topic,
          namespaces: newNamespaces,
        });

        for (const changedInfo of changedInfos) {
          // No need to wait
          signClient.emit({
            topic,
            event: {
              name: "accountsChanged",
              data: [changedInfo.account],
            },
            chainId: changedInfo.caip10,
          });
        }
      }
    }
  }

  protected async onSessionDelete(event: any) {
    const topic = event.topic;
    if (!topic) {
      console.log("Invalid wc2 request");
      return;
    }

    this.forceReaction();

    await this.topicDisconnected(topic);
  }

  protected async topicDisconnected(topic: string): Promise<void> {
    const id = await this.getRandomIdByTopic(topic);

    if (id) {
      for (const chainInfo of this.chainStore.chainInfos) {
        await this.permissionStore
          .getBasicAccessInfo(chainInfo.chainId)
          .removeOrigin(WCV2MessageRequester.getVirtualURL(id));
      }
    }

    await this.clearTopic(topic);
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

      const randomId = Buffer.from(
        await getRandomBytesAsync(new Uint32Array(10))
      ).toString("hex");

      const metadata = proposal.params?.proposer?.metadata;
      if (metadata) {
        this.pendingSessionProposalMetadataMap.set(randomId, metadata);
      }

      const chainIds = proposal.params.requiredNamespaces.cosmos.chains.map(
        (chainId: string) => chainId.replace("cosmos:", "")
      );

      const keplr = this.createKeplrAPI(randomId);
      await keplr.enable(chainIds);

      const accounts: string[] = [];
      for (const chainId of chainIds) {
        const key = await keplr.getKey(chainId);
        accounts.push(`cosmos:${chainId}:${key.bech32Address}`);
      }

      const { topic: ackTopic, acknowledged } = await signClient.approve({
        id,
        namespaces: {
          cosmos: {
            accounts,
            methods: CosmosMethods,
            events: CosmosEvents,
          },
        },
      });

      await this.saveTopic(randomId, ackTopic);

      await acknowledged();

      this.forceReaction();
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

  protected async onSessionRequest(event: any): Promise<void> {
    const signClient = await this.ensureInit();

    const id = event?.id;
    if (!id) {
      // In this case, nothing to do.
      console.log("Invalid wc2 request");
      return;
    }
    const topic = event?.topic;
    if (!topic) {
      // In this case, nothing to do.
      console.log("Invalid wc2 request");
      return;
    }

    try {
      let chainId = event.params.chainId as string;
      if (!chainId.startsWith("cosmos:")) {
        throw new Error("Only cosmos chain supported");
      }
      chainId = chainId.replace("cosmos:", "");

      const reqId = await this.getRandomIdByTopic(topic);
      if (!reqId) {
        throw new Error("Unregistered topic");
      }

      // Store permitted chains before processing request.
      const permittedChains = await this.permissionStore.getOriginPermittedChains(
        WCV2MessageRequester.getVirtualURL(reqId),
        getBasicAccessPermissionType()
      );

      const keplr = this.createKeplrAPI(reqId);

      const params = event.params.request.params;
      switch (event.params.request.method) {
        case "cosmos_getAccounts": {
          const key = await keplr.getKey(chainId);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: "2.0",
              result: [
                {
                  algo: key.algo,
                  address: key.bech32Address,
                  pubkey: Buffer.from(key.pubKey).toString("base64"),
                },
              ],
            },
          });
          break;
        }
        case "cosmos_signAmino": {
          const res = await keplr.signAmino(
            chainId,
            params.signerAddress,
            params.signDoc
          );
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: "2.0",
              result: {
                signature: res.signature,
                signed: res.signed,
              },
            },
          });
          break;
        }
        case "cosmos_signDirect": {
          const res = await keplr.signDirect(chainId, params.signerAddress, {
            bodyBytes: Buffer.from(params.signDoc.bodyBytes, "base64"),
            authInfoBytes: Buffer.from(params.signDoc.authInfoBytes, "base64"),
            chainId: params.signDoc.chainId,
            accountNumber: Long.fromString(params.signDoc.accountNumber),
          });
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: "2.0",
              result: {
                signature: res.signature,
                signed: {
                  bodyBytes: Buffer.from(res.signed.bodyBytes).toString(
                    "base64"
                  ),
                  authInfoBytes: Buffer.from(res.signed.authInfoBytes).toString(
                    "base64"
                  ),
                  chainId: res.signed.chainId,
                  accountNumber: res.signed.accountNumber.toString(),
                },
              },
            },
          });
          break;
        }
        case "keplr_getKey": {
          const res = await keplr.getKey(params.chainId);
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: "2.0",
              result: {
                name: res.name,
                algo: res.algo,
                pubKey: Buffer.from(res.pubKey).toString("base64"),
                address: Buffer.from(res.address).toString("base64"),
                bech32Address: res.bech32Address,
                isNanoLedger: res.isNanoLedger,
              },
            },
          });
          break;
        }
        default:
          throw new Error("Unknown request method");
      }

      // Keplr asks permission to user according to requests.
      // It is possible that new permission added to session after requests.
      // If changes exists, try to update session and emit event.
      const newPermittedChains = await this.permissionStore.getOriginPermittedChains(
        WCV2MessageRequester.getVirtualURL(reqId),
        getBasicAccessPermissionType()
      );
      if (
        JSON.stringify(permittedChains) !== JSON.stringify(newPermittedChains)
      ) {
        // No need to wait.
        this.accountMayChangedSession(topic);
      }
    } catch (e) {
      console.log(e);
      await signClient.respond({
        topic,
        response: {
          id,
          jsonrpc: "2.0",
          error: {
            code: 1,
            message: e.message || e.toString(),
          },
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

  protected createKeplrAPI(id: string) {
    return new Keplr(
      // TODO: Set version
      "",
      "core",
      new WCV2MessageRequester(RNRouterBackground.EventEmitter, id)
    );
  }

  protected async saveTopic(randomId: string, ackTopic: string): Promise<void> {
    await this.kvStore.set(`id-to-topic:${randomId}`, ackTopic);
    await this.kvStore.set(`topic-to-id:${ackTopic}`, randomId);
  }

  protected async getTopicByRandomId(
    randomId: string
  ): Promise<string | undefined> {
    return await this.kvStore.get(`id-to-topic:${randomId}`);
  }

  protected async getRandomIdByTopic(
    topic: string
  ): Promise<string | undefined> {
    return await this.kvStore.get(`topic-to-id:${topic}`);
  }

  protected async clearTopic(topic: string): Promise<void> {
    const randomId = await this.kvStore.get(`topic-to-id:${topic}`);
    await this.kvStore.set(`topic-to-id:${topic}`, null);
    if (randomId) {
      await this.kvStore.set(`id-to-topic:${randomId}`, null);
    }
  }

  protected async clearTopicByRandomId(randomId: string): Promise<void> {
    const topic = await this.kvStore.get(`id-to-topic:${randomId}`);
    await this.kvStore.set(`id-to-topic:${randomId}`, null);
    if (topic) {
      await this.kvStore.set(`topic-to-id:${topic}`, null);
    }
  }

  @action
  protected forceReaction() {
    this._forceReaction++;
  }
}
