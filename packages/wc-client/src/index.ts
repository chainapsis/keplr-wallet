import { IConnector } from "@walletconnect/types";
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

export type KeplrGetKeyWalletCoonectV1Response = {
  address: string;
  algo: string;
  bech32Address: string;
  isNanoLedger: boolean;
  name: string;
  pubKey: string;
};

export class KeplrWalletConnect implements Keplr {
  constructor(
    public readonly connector: IConnector,
    public readonly options: {
      kvStore?: KVStore;
      sendTx?: Keplr["sendTx"];
    } = {}
  ) {
    if (!options.kvStore) {
      options.kvStore = new IndexedDBKVStore("keplr_wallet_connect");
    }

    connector.on("disconnect", () => {
      this.clearSaved();
    });
  }

  readonly version: string = "0.9.0";

  defaultOptions: KeplrIntereactionOptions = {};

  protected async clearSaved(): Promise<void> {
    const kvStore = this.options.kvStore!;

    await Promise.all([
      kvStore.set(this.getKeyHasEnabled(), null),
      kvStore.set(this.getKeyLastSeenKey(), null),
    ]);
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

    await this.connector.sendCustomRequest({
      id: payloadId(),
      jsonrpc: "2.0",
      method: "keplr_enable_wallet_connect_v1",
      params: chainIds,
    });

    await this.saveHasEnabledChainIds(chainIds);
  }

  protected getKeyHasEnabled() {
    return `${this.connector.session.key}-enabled`;
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
      await this.connector.sendCustomRequest({
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
    return `${this.connector.session.key}-key`;
  }

  protected async getLastSeenKey(
    chainId: string
  ): Promise<KeplrGetKeyWalletCoonectV1Response | undefined> {
    const saved = await this.options.kvStore!.get<{
      [chainId: string]: KeplrGetKeyWalletCoonectV1Response | undefined;
    }>(this.getKeyLastSeenKey());

    if (!saved) {
      return undefined;
    }

    return saved[chainId];
  }

  protected async saveLastSeenKey(
    chainId: string,
    response: KeplrGetKeyWalletCoonectV1Response
  ) {
    let saved = await this.options.kvStore!.get<{
      [chainId: string]: KeplrGetKeyWalletCoonectV1Response | undefined;
    }>(this.getKeyLastSeenKey());

    if (!saved) {
      saved = {};
    }

    saved[chainId] = response;

    await this.options.kvStore!.set(this.getKeyLastSeenKey(), saved);
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
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    if (this.options.sendTx) {
      return this.options.sendTx(chainId, stdTx, mode);
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
      await this.connector.sendCustomRequest({
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
