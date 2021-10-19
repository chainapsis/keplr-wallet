import {
  ChainInfo,
  Keplr as IKeplr,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  Key,
} from "@keplr-wallet/types";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import {
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineSigner,
} from "@cosmjs/launchpad";
import {
  EnableAccessMsg,
  SuggestChainInfoMsg,
  GetKeyMsg,
  SuggestTokenMsg,
  SendTxMsg,
  GetSecret20ViewingKey,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  GetPubkeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
  GetTxEncryptionKeyMsg,
} from "@keplr-wallet/background";
import { cosmos } from "@keplr-wallet/cosmos";
import { SecretUtils } from "secretjs/types/enigmautils";

import { KeplrEnigmaUtils } from "./enigma";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";

export class Keplr implements IKeplr {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(
    public readonly version: string,
    protected readonly requester: MessageRequester
  ) {}

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    await this.requester.sendMessage(
      BACKGROUND_PORT,
      new EnableAccessMsg(chainIds)
    );
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    const msg = new SuggestChainInfoMsg(chainInfo);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getKey(chainId: string): Promise<Key> {
    const msg = new GetKeyMsg(chainId);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    const msg = new SendTxMsg(chainId, tx, mode);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignAminoMsg(
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: cosmos.tx.v1beta1.ISignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    const msg = new RequestSignDirectMsg(
      chainId,
      signer,
      cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish(),
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    return {
      signed: cosmos.tx.v1beta1.SignDoc.decode(response.signedBytes),
      signature: response.signature,
    };
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
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

  async suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    const msg = new SuggestTokenMsg(chainId, contractAddress, viewingKey);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    const msg = new GetSecret20ViewingKey(chainId, contractAddress);
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetPubkeyMsg(chainId)
    );
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new GetTxEncryptionKeyMsg(chainId, nonce)
    );
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new ReqeustEncryptMsg(chainId, contractCodeHash, msg)
    );
  }

  async enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!ciphertext || ciphertext.length === 0) {
      return new Uint8Array();
    }

    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new RequestDecryptMsg(chainId, ciphertext, nonce)
    );
  }

  getEnigmaUtils(chainId: string): SecretUtils {
    if (this.enigmaUtils.has(chainId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.enigmaUtils.get(chainId)!;
    }

    const enigmaUtils = new KeplrEnigmaUtils(chainId, this);
    this.enigmaUtils.set(chainId, enigmaUtils);
    return enigmaUtils;
  }
}
