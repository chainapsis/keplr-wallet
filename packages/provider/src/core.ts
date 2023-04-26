import {
  ChainInfo,
  EthSignType,
  Keplr as IKeplr,
  KeplrIntereactionOptions,
  KeplrMode,
  KeplrSignOptions,
  Key,
  BroadcastMode,
  AminoSignResponse,
  StdSignDoc,
  StdTx,
  OfflineAminoSigner,
  StdSignature,
  DirectSignResponse,
  OfflineDirectSigner,
  ICNSAdr36Signatures,
  ChainInfoWithoutEndpoints,
  SecretUtils,
  SettledResponses,
} from "@keplr-wallet/types";
import {
  BACKGROUND_PORT,
  MessageRequester,
  sendSimpleMessage,
} from "@keplr-wallet/router";
import {
  SuggestChainInfoMsg,
  SendTxMsg,
  GetSecret20ViewingKey,
  GetPubkeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
  GetTxEncryptionKeyMsg,
  RequestSignEIP712CosmosTxMsg_v0,
  GetAnalyticsIdMsg,
  RequestICNSAdr36SignaturesMsg,
  GetChainInfosWithoutEndpointsMsg,
  ChangeKeyRingNameMsg,
} from "./types";

import { KeplrEnigmaUtils } from "./enigma";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { Buffer } from "buffer/";
import { KeplrCoreTypes } from "./core-types";

export class Keplr implements IKeplr, KeplrCoreTypes {
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

    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "permission-interactive",
      "enable-access",
      {
        chainIds,
      }
    );
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "permission-interactive",
      "disable-access",
      {
        chainIds: chainIds ?? [],
      }
    );
  }

  async experimentalSuggestChain(
    chainInfo: ChainInfo & {
      // Legacy
      gasPriceStep?: {
        readonly low: number;
        readonly average: number;
        readonly high: number;
      };
    }
  ): Promise<void> {
    if (chainInfo.gasPriceStep) {
      // Gas price step in ChainInfo is legacy format.
      // Try to change the recent format for backward-compatibility.
      const gasPriceStep = { ...chainInfo.gasPriceStep };
      for (const feeCurrency of chainInfo.feeCurrencies) {
        if (!feeCurrency.gasPriceStep) {
          (
            feeCurrency as {
              gasPriceStep?: {
                readonly low: number;
                readonly average: number;
                readonly high: number;
              };
            }
          ).gasPriceStep = gasPriceStep;
        }
      }
      delete chainInfo.gasPriceStep;

      console.warn(
        "The `gasPriceStep` field of the `ChainInfo` has been moved under `feeCurrencies`. This is automatically handled as of right now, but the upcoming update would potentially cause errors."
      );
    }

    if ((chainInfo as any).coinType) {
      console.warn(
        "The `coinType` field of the `ChainInfo` is removed. This is automatically handled as of right now, but the upcoming update would potentially cause errors."
      );
      delete (chainInfo as any).coinType;
    }

    const msg = new SuggestChainInfoMsg(chainInfo);
    await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async getKey(chainId: string): Promise<Key> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "get-cosmos-key",
      {
        chainId,
      }
    );
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "get-cosmos-keys-settled",
      {
        chainIds,
      }
    );
  }

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    const msg = new GetChainInfosWithoutEndpointsMsg();
    return (await this.requester.sendMessage(BACKGROUND_PORT, msg)).chainInfos;
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
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-cosmos-sign-amino",
      {
        chainId,
        signer,
        signDoc,
        signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
      }
    );
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
    const response = await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-cosmos-sign-direct",
      {
        chainId,
        signer,
        signDoc: {
          bodyBytes: signDoc.bodyBytes,
          authInfoBytes: signDoc.authInfoBytes,
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber
            ? signDoc.accountNumber.toString()
            : null,
        },
        signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
      }
    );

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
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-cosmos-sign-amino-adr-36",
      {
        chainId,
        signer,
        data: typeof data === "string" ? Buffer.from(data) : data,
        signOptions: {
          isADR36WithString: typeof data === "string",
        },
      }
    );
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

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "verify-cosmos-sign-amino-adr-36",
      {
        chainId,
        signer,
        data,
        signature,
      }
    );
  }

  async signEthereum(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array,
    _type: EthSignType
  ): Promise<Uint8Array> {
    throw new Error("TODO");
  }

  signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return this.requester.sendMessage(
      BACKGROUND_PORT,
      new RequestICNSAdr36SignaturesMsg(
        chainId,
        contractAddress,
        owner,
        username,
        addressChainIds
      )
    );
  }

  getOfflineSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineAminoSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this);
  }

  async getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineAminoSigner | OfflineDirectSigner> {
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
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "token-cw20",
      "SuggestTokenMsg",
      {
        chainId,
        contractAddress,
        viewingKey,
      }
    );
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

  async experimentalSignEIP712CosmosTx_v0(
    chainId: string,
    signer: string,
    eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    const msg = new RequestSignEIP712CosmosTxMsg_v0(
      chainId,
      signer,
      eip712,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions)
    );
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  __core__getAnalyticsId(): Promise<string> {
    const msg = new GetAnalyticsIdMsg();
    return this.requester.sendMessage(BACKGROUND_PORT, msg);
  }

  async changeKeyRingName({
    defaultName,
    editable = true,
  }: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string> {
    const msg = new ChangeKeyRingNameMsg(defaultName, editable);

    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}
