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
  IEthereumProvider,
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  EIP6963EventNames,
  IStarknetProvider,
  SupportedPaymentType,
  IBitcoinProvider,
  SignPsbtOptions,
  ChainType as BitcoinChainType,
  Network as BitcoinNetwork,
  BitcoinSignMessageType,
  Inscription,
} from "@keplr-wallet/types";
import { JSONUint8Array } from "./uint8-array";
import deepmerge from "deepmerge";
import Long from "long";
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import { KeplrEnigmaUtils } from "./enigma";
import { BUILD_VERSION } from "./version";
import EventEmitter from "events";
import { KeplrLogoBase64, metaId } from "./constants";
import type {
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
} from "starknet";

export interface ProxyRequest {
  type: string;
  id: string;
  metaId?: string;
  method: keyof IKeplr;
  args: any[];
  ethereumProviderMethod?: keyof IEthereumProvider;
  bitcoinProviderMethod?: keyof IBitcoinProvider;
}

export interface Result {
  /**
   * NOTE: If `error` is of type `{ module:string; code: number; message: string }`,
   * it should be considered and processed as `KeplrError`.
   */
  error?: string | { module: string; code: number; message: string };
  return?: any;
}

export class EthereumProviderRpcError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;

    Object.setPrototypeOf(this, EthereumProviderRpcError.prototype);
  }
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

export class Keplr implements IKeplr {
  protected static staticRequestMethod(
    method: keyof IKeplr,
    args: any[]
  ): Promise<any> {
    const isMobile = "ReactNativeWebView" in window;
    const postMessage: (message: any) => void = isMobile
      ? (message) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      : (message) => {
          window.postMessage(message, window.location.origin);
        };
    const parseMessage: (message: any) => any = isMobile
      ? (message) => {
          if (message && typeof message === "string") {
            try {
              return JSON.parse(message);
            } catch {
              // noop
            }
          }

          return message;
        }
      : (message) => {
          return message;
        };

    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = !(window as any).keplrRequestMetaIdSupport
      ? "proxy-request"
      : `proxy-request${metaId ? `-${metaId}` : ""}`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = parseMessage(e.data);

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

      postMessage(proxyMessage);
    });
  }

  protected requestMethod(method: keyof IKeplr, args: any[]): Promise<any> {
    return Keplr.staticRequestMethod(method, args);
  }

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public readonly version: string = BUILD_VERSION;
  public readonly mode: KeplrMode = "extension";

  public defaultOptions: KeplrIntereactionOptions = {};

  static async getKeplr(
    pingTimeout: number = 1500
  ): Promise<Keplr | undefined> {
    await waitDocumentReady();

    const isMobile = "ReactNativeWebView" in window;
    const isFirefox = (() => {
      if (typeof navigator !== "undefined" && "userAgent" in navigator) {
        return navigator.userAgent.includes("Firefox");
      }
      return false;
    })();
    if (
      !isMobile &&
      !isFirefox &&
      (window as any).keplrRequestMetaIdSupport == null
    ) {
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(undefined);
      }, pingTimeout);

      Keplr.staticRequestMethod("ping", [])
        .then(() => {
          clearTimeout(timeout);
          resolve(new Keplr());
        })
        .catch((e) => {
          // if legacy version.
          if (e?.message?.includes("Invalid method: ping")) {
            clearTimeout(timeout);
            resolve(new Keplr());
          } else {
            reject(e);
          }
        });
    });
  }

  async ping(): Promise<void> {
    await this.requestMethod("ping", []);
  }

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

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return await this.requestMethod("getChainInfoWithoutEndpoints", [chainId]);
  }

  async getStarknetKey(chainId: string): Promise<{
    name: string;
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    isNanoLedger: boolean;
  }> {
    return await this.requestMethod("getStarknetKey", [chainId]);
  }

  async getStarknetKeysSettled(chainIds: string[]): Promise<
    SettledResponses<{
      name: string;
      hexAddress: string;
      pubKey: Uint8Array;
      address: Uint8Array;
      isNanoLedger: boolean;
    }>
  > {
    return await this.requestMethod("getStarknetKeysSettled", [chainIds]);
  }

  async signStarknetTx(
    chainId: string,
    transactions: Call[],
    details: InvocationsSignerDetails
  ): Promise<{
    transactions: Call[];
    details: InvocationsSignerDetails;
    signature: string[];
  }> {
    return await this.requestMethod("signStarknetTx", [
      chainId,
      transactions,
      details,
    ]);
  }

  async signStarknetDeployAccountTransaction(
    chainId: string,
    transaction: DeployAccountSignerDetails
  ): Promise<{
    transaction: DeployAccountSignerDetails;
    signature: string[];
  }> {
    return await this.requestMethod("signStarknetDeployAccountTransaction", [
      chainId,
      transaction,
    ]);
  }

  async getBitcoinKey(chainId: string): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
  }> {
    return await this.requestMethod("getBitcoinKey", [chainId]);
  }

  async getBitcoinKeysSettled(chainIds: string[]): Promise<
    SettledResponses<{
      name: string;
      pubKey: Uint8Array;
      address: string;
      paymentType: SupportedPaymentType;
      isNanoLedger: boolean;
    }>
  > {
    return await this.requestMethod("getBitcoinKeysSettled", [chainIds]);
  }

  async signPsbt(
    chainId: string,
    psbtHex: string,
    options?: SignPsbtOptions
  ): Promise<string> {
    return await this.requestMethod("signPsbt", [chainId, psbtHex, options]);
  }

  async signPsbts(
    chainId: string,
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ): Promise<string[]> {
    return await this.requestMethod("signPsbts", [
      chainId,
      psbtsHexes,
      options,
    ]);
  }

  async __core__getAnalyticsId(): Promise<string> {
    return await this.requestMethod("__core__getAnalyticsId" as any, []);
  }

  async __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoWithdrawRewards" as any,
      [chainId, signer, signDoc]
    );
  }

  async __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoDelegate" as any,
      [chainId, signer, signDoc]
    );
  }

  async __core__privilageSignAminoExecuteCosmWasm(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoExecuteCosmWasm" as any,
      [chainId, signer, signDoc]
    );
  }

  async __core__webpageClosed(): Promise<void> {
    return await this.requestMethod("__core__webpageClosed" as any, []);
  }

  public readonly ethereum = new EthereumProvider(this);

  // TODO: 이거 마지막에 꼭 구현해야한다.
  //       일단은 다른게 더 급해서 일단 any로 처리
  public readonly starknet: IStarknetProvider = undefined as any;

  public readonly bitcoin: IBitcoinProvider = new BitcoinProvider(this);
}

const waitDocumentReady = (): Promise<void> => {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve();
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  protected readonly eip6963ProviderInfo?: EIP6963ProviderInfo = {
    uuid: crypto.randomUUID(),
    name: "Keplr",
    rdns: "app.keplr",
    icon: `data:image/png;base64,${KeplrLogoBase64}`,
  };

  // It must be in the hexadecimal format used in EVM-based chains, not the format used in Tendermint nodes.
  chainId: string | null = null;
  // It must be in the decimal format of chainId.
  networkVersion: string | null = null;

  selectedAddress: string | null = null;

  isKeplr = true;
  isMetaMask = true;

  protected _isConnected = false;
  protected _currentChainId: string | null = null;

  constructor(protected readonly keplr: Keplr) {
    super();

    window.addEventListener("keplr_keystorechange", async () => {
      if (this._currentChainId) {
        const chainInfo = await keplr.getChainInfoWithoutEndpoints(
          this._currentChainId
        );

        if (chainInfo) {
          const selectedAddress = (await keplr.getKey(this._currentChainId))
            .ethereumHexAddress;
          this.handleAccountsChanged(selectedAddress);
        }
      }
    });

    window.addEventListener("keplr_chainChanged", (event) => {
      const origin = (event as CustomEvent).detail.origin;

      if (origin === window.location.origin) {
        const evmChainId = (event as CustomEvent).detail.evmChainId;
        this.handleChainChanged(evmChainId);
      }
    });

    window.addEventListener("keplr_ethSubscription", (event: Event) => {
      const origin = (event as CustomEvent).detail.origin;
      const providerId = (event as CustomEvent).detail.providerId;

      if (
        origin === window.location.origin &&
        providerId === this.eip6963ProviderInfo?.uuid
      ) {
        const data = (event as CustomEvent).detail.data;
        this.emit("message", {
          type: "eth_subscription",
          data,
        });
      }
    });

    if (this.eip6963ProviderInfo) {
      const announceEvent = new CustomEvent<EIP6963ProviderDetail>(
        EIP6963EventNames.Announce,
        {
          detail: Object.freeze({
            info: this.eip6963ProviderInfo,
            provider: this,
          }),
        }
      );
      window.addEventListener(EIP6963EventNames.Request, () =>
        window.dispatchEvent(announceEvent)
      );
      window.dispatchEvent(announceEvent);
    }
  }

  protected static async requestMethod(
    method: keyof IEthereumProvider,
    args: Record<string, any>
  ): Promise<any> {
    const isMobile = "ReactNativeWebView" in window;
    const postMessage: (message: any) => void = isMobile
      ? (message) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      : (message) => {
          window.postMessage(message, window.location.origin);
        };
    const parseMessage: (message: any) => any = isMobile
      ? (message) => {
          if (message && typeof message === "string") {
            try {
              return JSON.parse(message);
            } catch {
              // noop
            }
          }

          return message;
        }
      : (message) => {
          return message;
        };

    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = !(window as any).keplrRequestMetaIdSupport
      ? "proxy-request"
      : `proxy-request${metaId ? `-${metaId}` : ""}`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method: "ethereum",
      args: JSONUint8Array.wrap(args),
      ethereumProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = parseMessage(e.data);

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
          const error = result.error;
          reject(
            error.code && !error.module
              ? new EthereumProviderRpcError(
                  error.code,
                  error.message,
                  error.data
                )
              : new Error(error)
          );
          return;
        }

        resolve(result.return);
      };

      window.addEventListener("message", receiveResponse);

      postMessage(proxyMessage);
    });
  }

  protected async handleConnect(evmChainId?: number) {
    if (!this._isConnected) {
      const { currentEvmChainId, currentChainId, selectedAddress } =
        await EthereumProvider.requestMethod("request", {
          method: "keplr_connect",
          ...(evmChainId && { params: [evmChainId] }),
        });

      this._isConnected = true;
      this._currentChainId = currentChainId;

      this.chainId = `0x${currentEvmChainId.toString(16)}`;
      this.networkVersion = currentEvmChainId.toString(10);

      this.selectedAddress = selectedAddress;

      this.emit("connect", { chainId: this.chainId });
    }
  }

  protected async handleDisconnect() {
    if (this._isConnected) {
      await EthereumProvider.requestMethod("request", {
        method: "keplr_disconnect",
      });

      this._isConnected = false;
      this.chainId = null;
      this.selectedAddress = null;
      this.networkVersion = null;

      this.emit("disconnect");
    }
  }

  protected async handleChainChanged(evmChainId: number) {
    await this.handleConnect(evmChainId);

    const evmChainIdHex = `0x${evmChainId.toString(16)}`;

    this.emit("chainChanged", evmChainIdHex);
  }

  protected async handleAccountsChanged(selectedAddress: string) {
    if (this._isConnected) {
      this.selectedAddress = selectedAddress;

      this.emit("accountsChanged", [selectedAddress]);
    }
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  async request<T = unknown>({
    method,
    params,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    chainId?: string;
  }): Promise<T> {
    if (!this._isConnected) {
      if (method === "eth_accounts") {
        return [] as T;
      }

      await this.handleConnect();
    }

    return await EthereumProvider.requestMethod("request", {
      method,
      params,
      providerId: this.eip6963ProviderInfo?.uuid,
      chainId,
    });
  }

  async enable(): Promise<string[]> {
    return await EthereumProvider.requestMethod("request", {
      method: "eth_requestAccounts",
    });
  }

  async net_version(): Promise<string> {
    return await EthereumProvider.requestMethod("request", {
      method: "net_version",
    });
  }
}

export class BitcoinProvider extends EventEmitter implements IBitcoinProvider {
  constructor(protected readonly keplr: Keplr) {
    super();
  }

  protected static async _requestMethod(
    method: keyof IBitcoinProvider,
    args: Record<string, any>
  ): Promise<any> {
    const isMobile = "ReactNativeWebView" in window;
    const postMessage: (message: any) => void = isMobile
      ? (message) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      : (message) => {
          window.postMessage(message, window.location.origin);
        };
    const parseMessage: (message: any) => any = isMobile
      ? (message) => {
          if (message && typeof message === "string") {
            try {
              return JSON.parse(message);
            } catch {
              // noop
            }
          }

          return message;
        }
      : (message) => {
          return message;
        };

    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = !(window as any).keplrRequestMetaIdSupport
      ? "proxy-request"
      : `proxy-request${metaId ? `-${metaId}` : ""}`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method: "bitcoin",
      args: JSONUint8Array.wrap(args),
      bitcoinProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = parseMessage(e.data);

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

      postMessage(proxyMessage);
    });
  }

  getAccounts(): Promise<string[]> {
    return BitcoinProvider._requestMethod("getAccounts", []);
  }

  async requestAccounts(): Promise<string[]> {
    return BitcoinProvider._requestMethod("requestAccounts", []);
  }

  async disconnect(): Promise<void> {
    return BitcoinProvider._requestMethod("disconnect", []);
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    return BitcoinProvider._requestMethod("getNetwork", []);
  }

  async switchNetwork(network: BitcoinNetwork): Promise<BitcoinNetwork> {
    return BitcoinProvider._requestMethod("switchNetwork", [network]);
  }

  async getChain(): Promise<{
    enum: BitcoinChainType;
    name: string;
    network: BitcoinNetwork;
  }> {
    return BitcoinProvider._requestMethod("getChain", []);
  }

  async switchChain(chain: BitcoinChainType): Promise<BitcoinChainType> {
    return BitcoinProvider._requestMethod("switchChain", [chain]);
  }

  async getPublicKey(): Promise<string> {
    return BitcoinProvider._requestMethod("getPublicKey", []);
  }

  async getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }> {
    return BitcoinProvider._requestMethod("getBalance", []);
  }

  async getInscriptions(
    offset?: number,
    limit?: number
  ): Promise<{ total: number; list: Inscription[] }> {
    return BitcoinProvider._requestMethod("getInscriptions", [offset, limit]);
  }

  async signMessage(
    message: string,
    type?: BitcoinSignMessageType
  ): Promise<string> {
    return BitcoinProvider._requestMethod("signMessage", [message, type]);
  }

  async sendBitcoin(to: string, amount: number): Promise<string> {
    return BitcoinProvider._requestMethod("sendBitcoin", [to, amount]);
  }

  async pushTx(rawTxHex: string): Promise<string> {
    return BitcoinProvider._requestMethod("pushTx", [rawTxHex]);
  }

  async pushPsbt(psbtHex: string): Promise<string> {
    return BitcoinProvider._requestMethod("pushPsbt", [psbtHex]);
  }

  async signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string> {
    return BitcoinProvider._requestMethod("signPsbt", [psbtHex, options]);
  }

  async signPsbts(
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ): Promise<string[]> {
    return BitcoinProvider._requestMethod("signPsbts", [psbtsHexes, options]);
  }

  async getAddress(): Promise<string> {
    const accounts = await this.getAccounts();
    return accounts[0];
  }

  async connectWallet(): Promise<string[]> {
    return this.requestAccounts();
  }
}
