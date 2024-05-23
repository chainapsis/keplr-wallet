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
  OfflineAminoSigner,
  StdSignature,
  StdTx,
  DirectSignResponse,
  OfflineDirectSigner,
  ICNSAdr36Signatures,
  ChainInfoWithoutEndpoints,
  SecretUtils,
  SettledResponses,
  DirectAuxSignResponse,
} from "@keplr-wallet/types";
import { JSONUint8Array } from "./uint8-array";
import deepmerge from "deepmerge";
import Long from "long";
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import { KeplrEnigmaUtils } from "./enigma";
import { BUILD_VERSION } from "./version";

export interface ProxyRequest {
  type: "proxy-request";
  id: string;
  method: keyof IKeplr;
  args: any[];
}

export interface Result {
  /**
   * NOTE: If `error` is of type `{ module:string; code: number; message: string }`,
   * it should be considered and processed as `KeplrError`.
   */
  error?: string | { module: string; code: number; message: string };
  return?: any;
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

export class Keplr implements IKeplr {
  protected requestMethod(method: keyof IKeplr, args: any[]): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        window.removeEventListener("message", receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return);
      };

      window.addEventListener("message", receiveResponse);

      window.postMessage(proxyMessage, window.location.origin);
    });
  }

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public readonly version: string = BUILD_VERSION;
  public readonly mode: KeplrMode = "extension";

  public defaultOptions: KeplrIntereactionOptions = {};

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod("enable", [chainIds]);
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    await this.requestMethod("disable", [chainIds]);
  }

  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    if (chainInfo.hideInUI) {
      throw new Error("hideInUI is not allowed");
    }

    if (
      chainInfo.features?.includes("stargate") ||
      chainInfo.features?.includes("no-legacy-stdTx")
    ) {
      console.warn(
        "“stargate”, “no-legacy-stdTx” feature has been deprecated. The launchpad is no longer supported, thus works without the two features. We would keep the aforementioned two feature for a while, but the upcoming update would potentially cause errors. Remove the two feature."
      );
    }

    await this.requestMethod("experimentalSuggestChain", [chainInfo]);
  }

  async getKey(chainId: string): Promise<Key> {
    return await this.requestMethod("getKey", [chainId]);
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return await this.requestMethod("getKeysSettled", [chainIds]);
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    if (!("length" in tx)) {
      console.warn(
        "Do not send legacy std tx via `sendTx` API. We now only support protobuf tx. The usage of legeacy std tx would throw an error in the near future."
      );
    }

    return await this.requestMethod("sendTx", [chainId, tx, mode]);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("signAmino", [
      chainId,
      signer,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
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
    const result = await this.requestMethod("signDirect", [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);

    const signed: {
      bodyBytes: Uint8Array;
      authInfoBytes: Uint8Array;
      chainId: string;
      accountNumber: string;
    } = result.signed;

    return {
      signed: {
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        chainId: signed.chainId,
        // We can't send the `Long` with remaing the type.
        // Sender should change the `Long` to `string`.
        accountNumber: Long.fromString(signed.accountNumber),
      },
      signature: result.signature,
    };
  }

  async signDirectAux(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId?: string | null;
      accountNumber?: Long | null;
      sequence?: Long | null;
    },
    signOptions: Exclude<
      KeplrSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    > = {}
  ): Promise<DirectAuxSignResponse> {
    const result = await this.requestMethod("signDirectAux", [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        publicKey: signDoc.publicKey,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
        sequence: signDoc.sequence ? signDoc.sequence.toString() : null,
      },
      deepmerge(
        {
          preferNoSetMemo: this.defaultOptions.sign?.preferNoSetMemo,
        },
        signOptions
      ),
    ]);

    const signed: {
      bodyBytes: Uint8Array;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId: string;
      accountNumber: string;
      sequence: string;
    } = result.signed;

    return {
      signed: {
        bodyBytes: signed.bodyBytes,
        publicKey: signed.publicKey || undefined,
        chainId: signed.chainId,
        // We can't send the `Long` with remaing the type.
        // Sender should change the `Long` to `string`.
        accountNumber: Long.fromString(signed.accountNumber),
        sequence: Long.fromString(signed.sequence),
      },
      signature: result.signature,
    };
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return await this.requestMethod("signArbitrary", [chainId, signer, data]);
  }

  signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return this.requestMethod("signICNSAdr36", [
      chainId,
      contractAddress,
      owner,
      username,
      addressChainIds,
    ]);
  }

  async verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return await this.requestMethod("verifyArbitrary", [
      chainId,
      signer,
      data,
      signature,
    ]);
  }

  async signEthereum(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    type: EthSignType
  ): Promise<Uint8Array> {
    return await this.requestMethod("signEthereum", [
      chainId,
      signer,
      data,
      type,
    ]);
  }

  getOfflineSigner(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this, signOptions);
  }

  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this, signOptions);
  }

  async getOfflineSignerAuto(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    const key = await this.getKey(chainId);
    if (key.isNanoLedger) {
      return new CosmJSOfflineSignerOnlyAmino(chainId, this, signOptions);
    }
    return new CosmJSOfflineSigner(chainId, this, signOptions);
  }

  async suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    return await this.requestMethod("suggestToken", [
      chainId,
      contractAddress,
      viewingKey,
    ]);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return await this.requestMethod("getSecret20ViewingKey", [
      chainId,
      contractAddress,
    ]);
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaPubKey", [chainId]);
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod("getEnigmaTxEncryptionKey", [
      chainId,
      nonce,
    ]);
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.requestMethod("enigmaEncrypt", [
      chainId,
      contractCodeHash,
      msg,
    ]);
  }

  async enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requestMethod("enigmaDecrypt", [
      chainId,
      ciphertext,
      nonce,
    ]);
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
    return await this.requestMethod("experimentalSignEIP712CosmosTx_v0", [
      chainId,
      signer,
      eip712,
      signDoc,
      deepmerge(this.defaultOptions.sign ?? {}, signOptions),
    ]);
  }

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    return await this.requestMethod("getChainInfosWithoutEndpoints", []);
  }

  async changeKeyRingName({
    defaultName,
    editable = true,
  }: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string> {
    return await this.requestMethod("changeKeyRingName", [
      { defaultName, editable },
    ]);
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    return await this.requestMethod("sendEthereumTx", [chainId, tx]);
  }

  async suggestERC20(chainId: string, contractAddress: string): Promise<void> {
    return await this.requestMethod("suggestERC20", [chainId, contractAddress]);
  }
}
