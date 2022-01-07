import {
  ChainInfo,
  Keplr as IKeplr,
  KeplrIntereactionOptions,
  KeplrMode,
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
  StdSignature,
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
  RequestSignEthereumMsg,
  GetPubkeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
  GetTxEncryptionKeyMsg,
  RequestVerifyADR36AminoSignDoc,
} from "./types";
import { SecretUtils } from "secretjs/types/enigmautils";

import { KeplrEnigmaUtils } from "./enigma";
import { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { Buffer } from "buffer/";

export class Keplr implements IKeplr {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(
    public readonly version: string,
    public readonly mode: KeplrMode,
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
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    const msg = new RequestSignDirectMsg(
      chainId,
      signer,
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: Long.fromString(response.signed.accountNumber),
      },
      signature: response.signature,
    };
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    let isADR36WithString = false;
    if (typeof data === "string") {
      data = Buffer.from(data).toString("base64");
      isADR36WithString = true;
    } else {
      data = Buffer.from(data).toString("base64");
    }

    const signDoc = {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        gas: "0",
        amount: [],
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data,
          },
        },
      ],
      memo: "",
    };

    const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
      isADR36WithString,
    });
    return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).signature;
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    if (typeof data === "string") {
      data = Buffer.from(data);
    }

    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new RequestVerifyADR36AminoSignDoc(chainId, signer, data, signature)
    );
  }

  async signEthereum(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      authInfoBytes?: Uint8Array | null;
      chainId?: string | null;
      accountNumber?: Long | null;
    },
    signOptions: KeplrSignOptions = {}
  ): Promise<DirectSignResponse> {
    // How to access mnemonic to re-generate Eth key...
    // Need to add API to generate Eth key from mnemonic within keyring

    // Forget EvmosAccount, this should work independently

    // We need a way to access either the mnemonic directly, or a new keyring API to generate an Eth key from the mnemonic
    // So this API would be to use Keplr to sign an Eth transaction with the private key within Keplrsl

    // Keep the same API as signDirect, but modify to use Ethsecp256k key, and sign with Eth key
    // Broadcast to existing Keplr node, will work assuming it's connected to Evmos node

    const msg = new RequestSignEthereumMsg(
      chainId,
      signer,
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    const response = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: Long.fromString(response.signed.accountNumber),
      },
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
