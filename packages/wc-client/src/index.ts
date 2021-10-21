import {
  IConnector,
  IJsonRpcRequest,
  IRequestOptions,
} from "@walletconnect/types";
import {
  ChainInfo,
  Keplr,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  Key,
} from "@keplr-wallet/types";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import {
  AminoSignResponse,
  BroadcastMode,
  OfflineSigner,
  StdSignDoc,
  StdTx,
} from "@cosmjs/launchpad";
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
} from "@keplr-wallet/provider";
import { SecretUtils } from "secretjs/types/enigmautils";
import { payloadId } from "@walletconnect/utils";
import deepmerge from "deepmerge";
import { Buffer } from "buffer/";
import { IndexedDBKVStore, KVStore } from "@keplr-wallet/common";

// VersionFormatRegExp checks if a chainID is in the format required for parsing versions
// The chainID should be in the form: `{identifier}-{version}`
const ChainVersionFormatRegExp = /(.+)-([\d]+)/;

function parseChainId(
  chainId: string
): {
  identifier: string;
  version: number;
} {
  const split = chainId.split(ChainVersionFormatRegExp).filter(Boolean);
  if (split.length !== 2) {
    return {
      identifier: chainId,
      version: 0,
    };
  } else {
    return { identifier: split[0], version: parseInt(split[1]) };
  }
}

export type KeplrGetKeyWalletCoonectV1Response = {
  address: string;
  algo: string;
  bech32Address: string;
  isNanoLedger: boolean;
  name: string;
  pubKey: string;
};

export type KeplrKeystoreMayChangedEventParam = {
  algo: string;
  name: string;
  isNanoLedger: boolean;
  keys: {
    chainIdentifier: string;
    address: string;
    bech32Address: string;
    pubKey: string;
  }[];
};

export class KeplrWalletConnectV1 implements Keplr {
  constructor(
    public readonly connector: IConnector,
    public readonly options: {
      kvStore?: KVStore;
      sendTx?: Keplr["sendTx"];
      onBeforeSendRequest?: (
        request: Partial<IJsonRpcRequest>,
        options?: IRequestOptions
      ) => Promise<void> | void;
      onAfterSendRequest?: (
        response: any,
        request: Partial<IJsonRpcRequest>,
        options?: IRequestOptions
      ) => Promise<void> | void;
    } = {}
  ) {
    if (!options.kvStore) {
      options.kvStore = new IndexedDBKVStore("keplr_wallet_connect");
    }

    connector.on("disconnect", () => {
      this.clearSaved();
    });

    connector.on("call_request", this.onCallReqeust);
  }

  readonly version: string = "0.9.0";

  defaultOptions: KeplrIntereactionOptions = {};

  protected readonly onCallReqeust = async (
    error: Error | null,
    payload: any | null
  ) => {
    if (error) {
      console.log(error);
      return;
    }

    if (!payload) {
      return;
    }

    if (
      payload.method === "keplr_keystore_may_changed_event_wallet_connect_v1"
    ) {
      const param = payload.params[0] as
        | KeplrKeystoreMayChangedEventParam
        | undefined;
      if (!param) {
        return;
      }

      const lastSeenKeys = await this.getAllLastSeenKey();
      if (!lastSeenKeys) {
        return;
      }

      const mayChangedKeyMap: Record<
        string,
        KeplrGetKeyWalletCoonectV1Response
      > = {};
      for (const mayChangedKey of param.keys) {
        mayChangedKeyMap[mayChangedKey.chainIdentifier] = {
          address: mayChangedKey.address,
          algo: param.algo,
          bech32Address: mayChangedKey.bech32Address,
          isNanoLedger: param.isNanoLedger,
          name: param.name,
          pubKey: mayChangedKey.pubKey,
        };
      }

      let hasChanged = false;

      for (const chainId of Object.keys(lastSeenKeys)) {
        const savedKey = lastSeenKeys[chainId];
        if (savedKey) {
          const { identifier } = parseChainId(chainId);
          const mayChangedKey = mayChangedKeyMap[identifier];
          if (mayChangedKey) {
            if (
              mayChangedKey.algo !== savedKey.algo ||
              mayChangedKey.name !== savedKey.name ||
              mayChangedKey.isNanoLedger !== savedKey.isNanoLedger ||
              mayChangedKey.address !== savedKey.address ||
              mayChangedKey.bech32Address !== savedKey.bech32Address ||
              mayChangedKey.pubKey !== savedKey.pubKey
            ) {
              hasChanged = true;

              lastSeenKeys[chainId] = mayChangedKey;
            }
          }
        }
      }

      if (hasChanged) {
        await this.saveAllLastSeenKey(lastSeenKeys);
        window.dispatchEvent(new Event("keplr_keystorechange"));
      }
    }
  };

  protected async clearSaved(): Promise<void> {
    const kvStore = this.options.kvStore!;

    await Promise.all([
      kvStore.set(this.getKeyHasEnabled(), null),
      kvStore.set(this.getKeyLastSeenKey(), null),
    ]);
  }

  protected async sendCustomRequest(
    request: Partial<IJsonRpcRequest>,
    options?: IRequestOptions
  ): Promise<any> {
    if (this.options.onBeforeSendRequest) {
      await this.options.onBeforeSendRequest(request, options);
    }

    const res = await this.connector.sendCustomRequest(request, options);

    if (this.options.onAfterSendRequest) {
      await this.options.onAfterSendRequest(res, request, options);
    }

    return res;
  }

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    const hasEnabledChainIds = await this.getHasEnabledChainIds();
    let allEnabled = true;
    for (const chainId of chainIds) {
      if (hasEnabledChainIds.indexOf(chainId) < 0) {
        allEnabled = false;
        break;
      }
    }

    if (allEnabled) {
      return;
    }

    await this.sendCustomRequest({
      id: payloadId(),
      jsonrpc: "2.0",
      method: "keplr_enable_wallet_connect_v1",
      params: chainIds,
    });

    await this.saveHasEnabledChainIds(chainIds);
  }

  protected getKeyHasEnabled() {
    return `${this.connector.session.handshakeTopic}-enabled`;
  }

  protected async getHasEnabledChainIds(): Promise<string[]> {
    return (
      (await this.options.kvStore!.get<string[]>(this.getKeyHasEnabled())) ?? []
    );
  }

  protected async saveHasEnabledChainIds(chainIds: string[]) {
    const hasEnabledChainIds = await this.getHasEnabledChainIds();
    for (const chainId of chainIds) {
      if (hasEnabledChainIds.indexOf(chainId) < 0) {
        hasEnabledChainIds.push(chainId);
      }
    }
    await this.options.kvStore!.set(
      this.getKeyHasEnabled(),
      hasEnabledChainIds
    );
  }

  enigmaDecrypt(
    _chainId: string,
    _ciphertext: Uint8Array,
    _nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not yet implemented");
  }

  enigmaEncrypt(
    _chainId: string,
    _contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    _msg: object
  ): Promise<Uint8Array> {
    throw new Error("Not yet implemented");
  }

  experimentalSuggestChain(_chainInfo: ChainInfo): Promise<void> {
    throw new Error("Not yet implemented");
  }

  getEnigmaPubKey(_chainId: string): Promise<Uint8Array> {
    throw new Error("Not yet implemented");
  }

  getEnigmaTxEncryptionKey(
    _chainId: string,
    _nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not yet implemented");
  }

  getEnigmaUtils(_chainId: string): SecretUtils {
    throw new Error("Not yet implemented");
  }

  async getKey(chainId: string): Promise<Key> {
    const lastSeenKey = await this.getLastSeenKey(chainId);
    if (lastSeenKey) {
      return {
        address: Buffer.from(lastSeenKey.address, "hex"),
        algo: lastSeenKey.algo,
        bech32Address: lastSeenKey.bech32Address,
        isNanoLedger: lastSeenKey.isNanoLedger,
        name: lastSeenKey.name,
        pubKey: Buffer.from(lastSeenKey.pubKey, "hex"),
      };
    }

    const response = (
      await this.sendCustomRequest({
        id: payloadId(),
        jsonrpc: "2.0",
        method: "keplr_get_key_wallet_connect_v1",
        params: [chainId],
      })
    )[0] as KeplrGetKeyWalletCoonectV1Response;

    await this.saveLastSeenKey(chainId, response);

    return {
      address: Buffer.from(response.address, "hex"),
      algo: response.algo,
      bech32Address: response.bech32Address,
      isNanoLedger: response.isNanoLedger,
      name: response.name,
      pubKey: Buffer.from(response.pubKey, "hex"),
    };
  }

  protected getKeyLastSeenKey() {
    return `${this.connector.session.handshakeTopic}-key`;
  }

  protected async getLastSeenKey(
    chainId: string
  ): Promise<KeplrGetKeyWalletCoonectV1Response | undefined> {
    const saved = await this.getAllLastSeenKey();

    if (!saved) {
      return undefined;
    }

    return saved[chainId];
  }

  protected async getAllLastSeenKey() {
    return await this.options.kvStore!.get<{
      [chainId: string]: KeplrGetKeyWalletCoonectV1Response | undefined;
    }>(this.getKeyLastSeenKey());
  }

  protected async saveAllLastSeenKey(data: {
    [chainId: string]: KeplrGetKeyWalletCoonectV1Response | undefined;
  }) {
    await this.options.kvStore!.set(this.getKeyLastSeenKey(), data);
  }

  protected async saveLastSeenKey(
    chainId: string,
    response: KeplrGetKeyWalletCoonectV1Response
  ) {
    let saved = await this.getAllLastSeenKey();

    if (!saved) {
      saved = {};
    }

    saved[chainId] = response;

    await this.saveAllLastSeenKey(saved);
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  async getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this);
    }
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  getSecret20ViewingKey(
    _chainId: string,
    _contractAddress: string
  ): Promise<string> {
    throw new Error("Not yet implemented");
  }

  /**
   * In the extension environment, this API let the extension to send the tx on behalf of the client.
   * But, in the wallet connect environment, in order to send the tx on behalf of the client, wallet should receive the tx data from remote.
   * However, this approach is not efficient and hard to ensure the stability and `KeplrWalletConnect` should have the informations of rpc and rest endpoints.
   * So, rather than implementing this, just fallback to the client sided implementation or throw error of the client sided implementation is not delivered to the `options`.
   * @param chainId
   * @param stdTx
   * @param mode
   */
  sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    if (this.options.sendTx) {
      return this.options.sendTx(chainId, tx, mode);
    }

    throw new Error("send tx is not delivered by options");
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    return (
      await this.sendCustomRequest({
        id: payloadId(),
        jsonrpc: "2.0",
        method: "keplr_sign_amino_wallet_connect_v1",
        params: [
          chainId,
          signer,
          signDoc,
          deepmerge(this.defaultOptions.sign ?? {}, signOptions),
        ],
      })
    )[0];
  }

  signDirect(
    _chainId: string,
    _signer: string,
    _signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    _signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    throw new Error("Not yet implemented");
  }

  suggestToken(
    _chainId: string,
    _contractAddress: string,
    _viewingKey?: string
  ): Promise<void> {
    throw new Error("Not yet implemented");
  }
}
