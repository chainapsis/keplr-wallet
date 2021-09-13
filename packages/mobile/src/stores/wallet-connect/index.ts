import WalletConnect from "@walletconnect/client";
import {
  AccountSetBase,
  AccountStore,
  KeyRingStore,
  PermissionStore,
} from "@keplr-wallet/stores";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainStore } from "../chain";
import { Keplr } from "@keplr-wallet/provider";
import { Buffer } from "buffer/";
import { KVStore } from "@keplr-wallet/common";
import { WCMessageRequester } from "./msg-requester";
import { RNRouterBackground } from "../../router";
import { KeyRingStatus } from "@keplr-wallet/background";

export interface WalletConnectV1SessionRequest {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: [
    {
      peerId: string;
      peerMeta?: {
        name?: string;
        description?: string;
        icons?: string[];
        url?: string;
      };
    }
  ];
}

// Wallet connect v1.0 is not suitable for handling multiple chains.
// When the session requested, you cannot receive information from multiple chains,
// so open a session unconditionally and manage permissions through custom requests.
// Frontend should request the "keplr_enable_wallet_connect_V1" method with "chains" params.
// "chains" params should be in form of https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export interface SessionRequestApproval {
  key: string;
  peerMeta: WalletConnectV1SessionRequest["params"][0]["peerMeta"];
  params: [
    {
      chains: string[];
    }
  ];
  resolve: () => void;
  reject: () => void;
}

export abstract class WalletConnectManager {
  @observable.shallow
  protected clientMap: Map<string, WalletConnect> = new Map();

  @observable.shallow
  protected pendingClientMap: Map<string, WalletConnect> = new Map();

  protected constructor(
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<AccountSetBase<any, any>>,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);
  }

  hasClient(uri: string): boolean {
    return this.clientMap.has(uri);
  }

  getClient(uri: string): WalletConnect | undefined {
    return this.clientMap.get(uri);
  }

  async restoreClient(session: WalletConnect["session"]) {
    const client = new WalletConnect({
      // TODO: Set metadata properly.
      clientMeta: {
        name: "Keplr",
        description: "Wallet for interchain",
        url: "#",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
      },
      session,
    });

    client.on("call_request", (error, payload) => {
      this.onCallRequest(client, error, payload);
    });

    client.on("disconnect", (error) => {
      if (error) {
        console.log(error);
        return;
      }
      this.onSessionDisconnected(session);
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

  async initClient(uri: string): Promise<WalletConnect> {
    await this.waitInitStores();

    if (this.clientMap.has(uri)) {
      throw new Error("Client already initialized");
    }

    if (this.pendingClientMap.has(uri)) {
      throw new Error("Client is waiting session");
    }

    const client = new WalletConnect({
      uri,
      // TODO: Set metadata properly.
      clientMeta: {
        name: "Keplr",
        description: "Wallet for interchain",
        url: "#",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
      },
    });

    runInAction(() => {
      this.pendingClientMap.set(uri, client);
    });

    let resolver: () => void;
    let rejector: (e: Error) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    const timeout = setTimeout(() => {
      rejector(new Error("Timeout"));
    }, 10000);

    const handler = (error: Error | null) => {
      if (error) {
        console.log(error);
        return;
      }

      client.on("disconnect", (error) => {
        if (error) {
          console.log(error);
          return;
        }

        this.onSessionDisconnected(client.session);
      });

      if (!client.peerMeta?.url) {
        client.rejectSession({
          message: "Should provide the peer url",
        });
        resolver();
        return;
      }

      client.approveSession({
        // Unfortunately, wallet connect 1.0 cannot deliver the chain ids in the form we want,
        // so we temporarily set the chain id to 99999 and send it.
        // And, wallet connect v1.0 is not suitable for handling multiple chains.
        // When the session requested, you cannot receive information from multiple chains,
        // so open a session unconditionally and manage permissions through custom requests.
        chainId: 99999,
        accounts: [],
      });
      resolver();
    };

    client.on("session_request", handler);

    try {
      await promise;

      client.off("session_request");

      runInAction(() => {
        this.clientMap.set(uri, client);
      });

      client.on("call_request", (error, payload) => {
        this.onCallRequest(client, error, payload);
      });

      return client;
    } finally {
      runInAction(() => {
        this.pendingClientMap.delete(uri);
      });
      clearTimeout(timeout);
    }
  }

  protected readonly onCallRequest = async (
    client: WalletConnect,
    error: Error | null,
    payload: any
  ) => {
    if (error) {
      console.log(error);
      return;
    }

    const id = payload.id;
    if (!id) {
      console.log("Payload's id is empty", payload);
      return;
    }

    await this.waitInitStores();

    try {
      switch (payload.method) {
        case "keplr_enable_wallet_connect_V1": {
          if (payload.params.length !== 1) {
            throw new Error("Invalid parmas");
          }
          if (
            !payload.params[0].chains ||
            payload.params[0].chains.length === 0
          ) {
            throw new Error("Params have no chains");
          }

          const capiChainIds = payload.params[0].chains;
          const chainIds: string[] = [];
          for (const capiChainId of capiChainIds) {
            const { namespace, chainId } = this.parseCAIPChainId(capiChainId);
            if (namespace !== "cosmos") {
              throw new Error(`namespace (${namespace}) is not supported`);
            }

            if (!this.chainStore.hasChain(chainId)) {
              throw new Error(`chain id (${chainId}) is not supported`);
            }

            chainIds.push(chainId);
          }

          const accounts: string[] = [];
          for (const capiChainId of capiChainIds) {
            const { chainId } = this.parseCAIPChainId(capiChainId);

            accounts.push(
              this.formatCAIPAccountId(
                "cosmos",
                chainId,
                await this.getAddressFromAccountStore(chainId)
              )
            );
          }

          try {
            await this.requestSessionProposalApproval(client, payload.params);
            client.approveRequest({
              id,
              result: {
                accounts,
              },
            });
            await this.onSessionConnected(chainIds, client.session);
          } catch (e) {
            console.log(e);
            await client.killSession();
          }
          break;
        }
        case "cosmos_getAccounts": {
          if (payload.params.length !== 1) {
            throw new Error("Invalid parmas");
          }
          if (!payload.params[0].chainId) {
            throw new Error("Chain id is empty");
          }

          const keplr = new Keplr(
            "",
            new WCMessageRequester(
              RNRouterBackground.EventEmitter,
              client.session.key
            )
          );

          const chainId = payload.params[0].chainId;
          const key = await keplr.getKey(chainId);
          client.approveRequest({
            id,
            result: [
              {
                algo: key.algo,
                address: key.bech32Address,
                pubkey: Buffer.from(key.pubKey).toString("hex"),
              },
            ],
          });
          break;
        }
        case "cosmos_signAmino": {
          if (payload.params.length !== 1) {
            throw new Error("Invalid parmas");
          }

          const keplr = new Keplr(
            "",
            new WCMessageRequester(
              RNRouterBackground.EventEmitter,
              client.session.key
            )
          );

          const param = payload.params[0];
          const result = await keplr.signAmino(
            param.signDoc["chain_id"],
            param.signerAddress,
            param.signDoc
          );
          client.approveRequest({
            id,
            result: [
              {
                signature: Buffer.from(
                  result.signature.signature,
                  "base64"
                ).toString("hex"),
                signed: result.signed,
              },
            ],
          });
          break;
        }
        default:
          throw new Error(`Unknown method (${payload.method})`);
      }
    } catch (e) {
      client.rejectRequest({
        id,
        error: {
          message: e.message,
        },
      });
    }
  };

  protected abstract requestSessionProposalApproval(
    client: WalletConnect,
    params: SessionRequestApproval["params"]
  ): Promise<void>;
  protected abstract onSessionConnected(
    chainIds: string[],
    session: WalletConnect["session"]
  ): Promise<void>;
  protected abstract onSessionDisconnected(
    session: WalletConnect["session"]
  ): Promise<void>;

  // The address in the account store is the observable property,
  // and it is not fetched until the account is actually used.
  // Thus, just getting the bech32Address is not enough and it can be just the empty string.
  // So, you need to observe the bech32Address before actually it is fetched.
  protected async getAddressFromAccountStore(chainId: string): Promise<string> {
    if (!this.chainStore.hasChain(chainId)) {
      throw new Error(`chain id (${chainId}) is not supported`);
    }

    const account = this.accountStore.getAccount(chainId);
    if (account.bech32Address) {
      return account.bech32Address;
    }

    return new Promise<string>((resolve) => {
      const disposer = autorun(() => {
        if (account.bech32Address) {
          resolve(account.bech32Address);
          if (disposer) {
            disposer();
          }
        }
      });
    });
  }

  protected parseCAIPChainId(
    caipChainId: string
  ): {
    namespace: string;
    chainId: string;
  } {
    const [namespace, chainId] = caipChainId.split(":");
    return {
      namespace,
      chainId,
    };
  }

  protected formatCAIPChainId(namespace: string, chainId: string) {
    return `${namespace}:${chainId}`;
  }

  protected formatCAIPAccountId(
    namespace: string,
    chainId: string,
    address: string
  ) {
    return `${namespace}:${chainId}:${address}`;
  }

  protected parseCAIPAccountId(
    caipAccount: string
  ): { namespace: string; chainId: string; address: string } {
    const [namespace, chainId, address] = caipAccount.split(":");
    return { namespace, chainId, address };
  }
}

export class WalletConnectStore extends WalletConnectManager {
  @observable.shallow
  protected _pendingSessionRequestApprovals: SessionRequestApproval[] = [];

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<AccountSetBase<any, any>>,
    protected readonly keyRingStore: KeyRingStore,
    protected readonly permissionStore: PermissionStore
  ) {
    super(chainStore, accountStore, keyRingStore);

    makeObservable(this);

    this.restore();
  }

  protected async restore(): Promise<void> {
    const persistentSessions = await this.getPersistentSessions();
    for (const session of persistentSessions) {
      this.restoreClient(session);
    }
  }

  get pendingSessionRequestApprovals(): SessionRequestApproval[] {
    return this._pendingSessionRequestApprovals;
  }

  protected requestSessionProposalApproval(
    client: WalletConnect,
    params: SessionRequestApproval["params"]
  ): Promise<void> {
    let resolver: () => void;
    let rejector: (e: Error) => void;
    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    const key = this.pendingSessionRequestApprovals.length.toString();

    const approval: SessionRequestApproval = {
      key,
      peerMeta: client.peerMeta ? client.peerMeta : undefined,
      params,
      resolve: () => {
        resolver();
        this.removeProposalApproval(key);
      },
      reject: () => {
        rejector(new Error("Rejected"));
        this.removeProposalApproval(key);
      },
    };

    this.pushProposalApproval(approval);

    return promise;
  }

  @action
  protected pushProposalApproval(approval: SessionRequestApproval) {
    if (
      !this._pendingSessionRequestApprovals.find(
        (pending) => pending.key === approval.key
      )
    ) {
      this._pendingSessionRequestApprovals.push(approval);
    }
  }

  @action
  protected removeProposalApproval(key: string) {
    const index = this._pendingSessionRequestApprovals.findIndex(
      (pending) => pending.key === key
    );
    if (index >= 0) {
      this._pendingSessionRequestApprovals.splice(index, 1);
    }
  }

  protected async getPersistentSessions(): Promise<WalletConnect["session"][]> {
    const result = await this.kvStore.get<WalletConnect["session"][]>(
      "persistent_session_v1"
    );
    if (!result) {
      return [];
    }
    return result;
  }

  protected async setPersistentSessions(
    value: WalletConnect["session"][]
  ): Promise<void> {
    await this.kvStore.set("persistent_session_v1", value);
  }

  protected async onSessionConnected(
    chainIds: string[],
    session: WalletConnect["session"]
  ): Promise<void> {
    const persistentSessions = await this.getPersistentSessions();

    if (
      !persistentSessions.find((persistent) => persistent.key === session.key)
    ) {
      persistentSessions.push(session);
      await this.setPersistentSessions(persistentSessions);

      for (const chainId of chainIds) {
        await this.permissionStore
          .getBasicAccessInfo(chainId)
          .addOrigin(WCMessageRequester.getVirtualSessionURL(session.key));
      }
    }
  }

  protected async onSessionDisconnected(
    session: WalletConnect["session"]
  ): Promise<void> {
    const persistentSessions = await this.getPersistentSessions();
    persistentSessions.filter((persistent) => persistent.key !== session.key);
    await this.setPersistentSessions(persistentSessions);

    for (const chainInfo of this.chainStore.chainInfos) {
      await this.permissionStore
        .getBasicAccessInfo(chainInfo.chainId)
        .removeOrigin(WCMessageRequester.getVirtualSessionURL(session.key));
    }
  }
}
