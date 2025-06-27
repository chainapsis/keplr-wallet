import {
  ChainInfo,
  EthSignType,
  Keplr,
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
  EIP6963EventNames,
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  IStarknetProvider,
  WalletEvents,
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  SupportedPaymentType,
  IBitcoinProvider,
  Network as BitcoinNetwork,
  BitcoinSignMessageType,
  ChainType as BitcoinChainType,
  SignPsbtOptions,
  Inscription,
} from "@keplr-wallet/types";
import {
  Result,
  JSONUint8Array,
  EthereumProviderRpcError,
} from "@keplr-wallet/router";
import { KeplrEnigmaUtils } from "./enigma";
import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { KeplrCoreTypes } from "./core-types";
import EventEmitter from "events";
import type {
  AccountInterface,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  ProviderInterface,
} from "starknet";

export interface ProxyRequest {
  type: string;
  id: string;
  method: keyof (Keplr & KeplrCoreTypes);
  args: any[];
  ethereumProviderMethod?: keyof IEthereumProvider;
  starknetProviderMethod?: keyof IStarknetProvider;
  bitcoinProviderMethod?: keyof IBitcoinProvider;
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

function defineUnwritablePropertyIfPossible(o: any, p: string, value: any) {
  const descriptor = Object.getOwnPropertyDescriptor(o, p);
  if (!descriptor || descriptor.writable) {
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(o, p, {
        value,
        writable: false,
      });
    } else {
      o[p] = value;
    }
  } else {
    console.warn(
      `Failed to inject ${p} from keplr. Probably, other wallet is trying to intercept Keplr`
    );
  }
}

export function injectKeplrToWindow(keplr: IKeplr): void {
  defineUnwritablePropertyIfPossible(window, "keplr", keplr);
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSigner",
    keplr.getOfflineSigner
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSignerOnlyAmino",
    keplr.getOfflineSignerOnlyAmino
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getOfflineSignerAuto",
    keplr.getOfflineSignerAuto
  );
  defineUnwritablePropertyIfPossible(
    window,
    "getEnigmaUtils",
    keplr.getEnigmaUtils
  );

  defineUnwritablePropertyIfPossible(window, "starknet_keplr", keplr.starknet);

  defineUnwritablePropertyIfPossible(window, "bitcoin_keplr", keplr.bitcoin);
}

/**
 * InjectedKeplr would be injected to the webpage.
 * In the webpage, it can't request any messages to the extension because it doesn't have any API related to the extension.
 * So, to request some methods of the extension, this will proxy the request to the content script that is injected to webpage on the extension level.
 * This will use `window.postMessage` to interact with the content script.
 */
export class InjectedKeplr implements IKeplr, KeplrCoreTypes {
  static startProxy(
    keplr: IKeplr & KeplrCoreTypes,
    metaId: string | undefined,
    eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    parseMessage?: (message: any) => any
  ): () => void {
    const proxyRequestType = `proxy-request${metaId ? `-${metaId}` : ""}`;
    const fn = async (e: any) => {
      const message: ProxyRequest = parseMessage
        ? parseMessage(e.data)
        : e.data;
      if (
        !message ||
        // "proxy-request"는 legacy support를 위한 것임.
        (message.type !== proxyRequestType && message.type !== "proxy-request")
      ) {
        return;
      }

      try {
        if (!message.id) {
          throw new Error("Empty id");
        }

        if (message.method.startsWith("protected")) {
          throw new Error("Rejected");
        }

        if (message.method === "version") {
          throw new Error("Version is not function");
        }

        if (message.method === "mode") {
          throw new Error("Mode is not function");
        }

        if (message.method === "defaultOptions") {
          throw new Error("DefaultOptions is not function");
        }

        if (
          !keplr[message.method] ||
          (message.method !== "ethereum" &&
            message.method !== "starknet" &&
            message.method !== "bitcoin" &&
            typeof keplr[message.method] !== "function")
        ) {
          throw new Error(`Invalid method: ${message.method}`);
        }

        if (message.method === "getOfflineSigner") {
          throw new Error("GetOfflineSigner method can't be proxy request");
        }

        if (message.method === "getOfflineSignerOnlyAmino") {
          throw new Error(
            "GetOfflineSignerOnlyAmino method can't be proxy request"
          );
        }

        if (message.method === "getOfflineSignerAuto") {
          throw new Error("GetOfflineSignerAuto method can't be proxy request");
        }

        if (message.method === "getEnigmaUtils") {
          throw new Error("GetEnigmaUtils method can't be proxy request");
        }

        const method = message.method;
        const result = await (async () => {
          if (method === "signDirect") {
            return await (async () => {
              const receivedSignDoc: {
                bodyBytes?: Uint8Array | null;
                authInfoBytes?: Uint8Array | null;
                chainId?: string | null;
                accountNumber?: string | null;
              } = message.args[2];

              const result = await keplr.signDirect(
                message.args[0],
                message.args[1],
                {
                  bodyBytes: receivedSignDoc.bodyBytes,
                  authInfoBytes: receivedSignDoc.authInfoBytes,
                  chainId: receivedSignDoc.chainId,
                  accountNumber: receivedSignDoc.accountNumber
                    ? Long.fromString(receivedSignDoc.accountNumber)
                    : null,
                },
                message.args[3]
              );

              return {
                signed: {
                  bodyBytes: result.signed.bodyBytes,
                  authInfoBytes: result.signed.authInfoBytes,
                  chainId: result.signed.chainId,
                  accountNumber: result.signed.accountNumber.toString(),
                },
                signature: result.signature,
              };
            })();
          }

          if (method === "signDirectAux") {
            return await (async () => {
              const receivedSignDoc: {
                bodyBytes?: Uint8Array | null;
                publicKey?: {
                  typeUrl: string;
                  value: Uint8Array;
                } | null;
                chainId?: string | null;
                accountNumber?: string | null;
                sequence?: string | null;
              } = message.args[2];

              const result = await keplr.signDirectAux(
                message.args[0],
                message.args[1],
                {
                  bodyBytes: receivedSignDoc.bodyBytes,
                  publicKey: receivedSignDoc.publicKey,
                  chainId: receivedSignDoc.chainId,
                  accountNumber: receivedSignDoc.accountNumber
                    ? Long.fromString(receivedSignDoc.accountNumber)
                    : null,
                  sequence: receivedSignDoc.sequence
                    ? Long.fromString(receivedSignDoc.sequence)
                    : null,
                },
                message.args[3]
              );

              return {
                signed: {
                  bodyBytes: result.signed.bodyBytes,
                  publicKey: result.signed.publicKey,
                  chainId: result.signed.chainId,
                  accountNumber: result.signed.accountNumber.toString(),
                  sequence: result.signed.sequence.toString(),
                },
                signature: result.signature,
              };
            })();
          }

          if (method === "ethereum") {
            const ethereumProviderMethod = message.ethereumProviderMethod;

            if (ethereumProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }

            if (ethereumProviderMethod === "chainId") {
              throw new Error("chainId is not function");
            }

            if (ethereumProviderMethod === "selectedAddress") {
              throw new Error("selectedAddress is not function");
            }

            if (ethereumProviderMethod === "networkVersion") {
              throw new Error("networkVersion is not function");
            }

            if (ethereumProviderMethod === "isKeplr") {
              throw new Error("isKeplr is not function");
            }

            if (ethereumProviderMethod === "isMetaMask") {
              throw new Error("isMetaMask is not function");
            }

            if (
              ethereumProviderMethod === undefined ||
              typeof keplr.ethereum[ethereumProviderMethod] !== "function"
            ) {
              throw new Error(
                `${message.ethereumProviderMethod} is not function or invalid Ethereum provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);
            if (ethereumProviderMethod === "request") {
              return await keplr.ethereum.request(
                typeof messageArgs === "string"
                  ? JSON.parse(messageArgs)
                  : messageArgs
              );
            }

            return await keplr.ethereum[ethereumProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          }

          if (method === "starknet") {
            const starknetProviderMethod = message.starknetProviderMethod;

            if (starknetProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }

            if (starknetProviderMethod === "id") {
              throw new Error("id is not function");
            }

            if (starknetProviderMethod === "name") {
              throw new Error("name is not function");
            }

            if (starknetProviderMethod === "version") {
              throw new Error("version is not function");
            }

            if (starknetProviderMethod === "icon") {
              throw new Error("icon is not function");
            }

            if (starknetProviderMethod === "chainId") {
              throw new Error("chainId is not function");
            }

            if (starknetProviderMethod === "selectedAddress") {
              throw new Error("selectedAddress is not function");
            }

            if (starknetProviderMethod === "isConnected") {
              throw new Error("isConnected is not function");
            }

            if (starknetProviderMethod === "account") {
              throw new Error("account is not function");
            }

            if (starknetProviderMethod === "provider") {
              throw new Error("provider is not function");
            }

            if (
              starknetProviderMethod === undefined ||
              typeof keplr.starknet?.[starknetProviderMethod] !== "function"
            ) {
              throw new Error(
                `${message.starknetProviderMethod} is not function or invalid Starknet provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);
            if (starknetProviderMethod === "request") {
              return await keplr.starknet.request(
                typeof messageArgs === "string"
                  ? JSON.parse(messageArgs)
                  : messageArgs
              );
            }

            return await keplr.starknet[starknetProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          }

          if (method === "bitcoin") {
            const bitcoinProviderMethod = message.bitcoinProviderMethod;

            if (bitcoinProviderMethod?.startsWith("protected")) {
              throw new Error("Rejected");
            }

            if (
              bitcoinProviderMethod === undefined ||
              typeof keplr.bitcoin?.[bitcoinProviderMethod] !== "function"
            ) {
              throw new Error(
                `${message.bitcoinProviderMethod} is not function or invalid Bitcoin provider method`
              );
            }

            const messageArgs = JSONUint8Array.unwrap(message.args);
            return await keplr.bitcoin[bitcoinProviderMethod](
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ...(typeof messageArgs === "string"
                ? JSON.parse(messageArgs)
                : messageArgs)
            );
          }

          return await keplr[method](
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...JSONUint8Array.unwrap(message.args)
          );
        })();

        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            return: JSONUint8Array.wrap(result),
          },
        };

        eventListener.postMessage(proxyResponse);
      } catch (e) {
        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            error:
              e.code && !e.module
                ? {
                    code: e.code,
                    message: e.message,
                    data: e.data,
                  }
                : e.message || e.toString(),
          },
        };

        eventListener.postMessage(proxyResponse);
      }
    };

    eventListener.addMessageListener(fn);

    return () => {
      eventListener.removeMessageListener(fn);
    };
  }

  protected requestMethod(
    method: keyof (IKeplr & KeplrCoreTypes),
    args: any[]
  ): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = `proxy-request${
      this.metaId ? `-${this.metaId}` : ""
    }`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

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

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  }

  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(
    protected readonly metaId: string | undefined,
    public readonly version: string,
    public readonly mode: KeplrMode,
    protected readonly onStarknetStateChange: (state: {
      selectedAddress: string | null;
      chainId: string | null;
      rpc: string | null;
    }) => void,
    protected readonly onStarknetAccountChange: (state: {
      selectedAddress: string | null;
    }) => void,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage: ((message: any) => any) | undefined,
    protected readonly eip6963ProviderInfo: EIP6963ProviderInfo | undefined,
    protected readonly starknetProviderInfo: {
      id: string;
      name: string;
      icon: string;
    }
  ) {
    // Freeze fields/method except for "defaultOptions"
    // Intentionally, "defaultOptions" can be mutated to allow a webpage to change the options with cosmjs usage.
    // Freeze fields
    const fieldNames = Object.keys(this);
    for (const fieldName of fieldNames) {
      if (fieldName !== "defaultOptions") {
        Object.defineProperty(this, fieldName, {
          value: (this as any)[fieldName],
          writable: false,
        });
      }

      // If field is "eventListener", try to iterate one-level deep.
      if (fieldName === "eventListener") {
        const fieldNames = Object.keys(this.eventListener);
        for (const fieldName of fieldNames) {
          Object.defineProperty(this.eventListener, fieldName, {
            value: (this.eventListener as any)[fieldName],
            writable: false,
          });
        }
      }
    }
    // Freeze methods
    const methodNames = Object.getOwnPropertyNames(InjectedKeplr.prototype);
    for (const methodName of methodNames) {
      if (
        methodName !== "constructor" &&
        typeof (this as any)[methodName] === "function"
      ) {
        Object.defineProperty(this, methodName, {
          value: (this as any)[methodName].bind(this),
          writable: false,
        });
      }
    }
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

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return await this.requestMethod("getChainInfoWithoutEndpoints", [chainId]);
  }

  __core__getAnalyticsId(): Promise<string> {
    return this.requestMethod("__core__getAnalyticsId", []);
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

  async __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoWithdrawRewards",
      [chainId, signer, signDoc]
    );
  }

  async __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod("__core__privilageSignAminoDelegate", [
      chainId,
      signer,
      signDoc,
    ]);
  }

  async __core__privilageSignAminoExecuteCosmWasm(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await this.requestMethod(
      "__core__privilageSignAminoExecuteCosmWasm",
      [chainId, signer, signDoc]
    );
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    return await this.requestMethod("sendEthereumTx", [chainId, tx]);
  }

  async suggestERC20(chainId: string, contractAddress: string): Promise<void> {
    return await this.requestMethod("suggestERC20", [chainId, contractAddress]);
  }

  async __core__webpageClosed(): Promise<void> {
    return await this.requestMethod("__core__webpageClosed", []);
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

  generateStarknetProvider(): IStarknetProvider {
    return new StarknetProvider(
      this.metaId,
      this.starknetProviderInfo.id,
      this.starknetProviderInfo.name,
      this.version,
      this.starknetProviderInfo.icon,
      () => this,
      this.onStarknetStateChange,
      this.onStarknetAccountChange,
      this.eventListener,
      this.parseMessage
    );
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

  public readonly ethereum = new EthereumProvider(
    this.metaId,
    () => this,
    this.eventListener,
    this.parseMessage,
    this.eip6963ProviderInfo
  );

  public readonly starknet = this.generateStarknetProvider();

  public readonly bitcoin = new BitcoinProvider(
    () => this,
    this.eventListener,
    this.parseMessage
  );
}

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  // It must be in the hexadecimal format used in EVM-based chains, not the format used in Tendermint nodes.
  chainId: string | null = null;
  // It must be in the decimal format of chainId.
  networkVersion: string | null = null;

  selectedAddress: string | null = null;

  isKeplr = true;
  isMetaMask = true;

  protected _isConnected = false;
  protected _currentChainId: string | null = null;

  constructor(
    protected readonly metaId: string | undefined,
    protected readonly injectedKeplr: () => InjectedKeplr,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any,
    protected readonly eip6963ProviderInfo?: EIP6963ProviderInfo
  ) {
    super();

    this._initProviderState();

    window.addEventListener("keplr_keystorechange", async () => {
      if (this._currentChainId) {
        const chainInfo = await injectedKeplr().getChainInfoWithoutEndpoints(
          this._currentChainId
        );

        if (chainInfo) {
          const selectedAddress = (
            await injectedKeplr().getKey(this._currentChainId)
          ).ethereumHexAddress;
          this._handleAccountsChanged(selectedAddress);
        }
      }
    });

    window.addEventListener("keplr_chainChanged", (event) => {
      const origin = (event as CustomEvent).detail.origin;

      if (origin === window.location.origin) {
        const evmChainId = (event as CustomEvent).detail.evmChainId;
        this._handleChainChanged(evmChainId);
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

  protected _requestMethod = async <T = unknown>(
    method: keyof IEthereumProvider,
    args: Record<string, any>
  ): Promise<T> => {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = `proxy-request${
      this.metaId ? `-${this.metaId}` : ""
    }`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method: "ethereum",
      args: JSONUint8Array.wrap(args),
      ethereumProviderMethod: method,
    };

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

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

      this.eventListener.addMessageListener(receiveResponse);

      this.eventListener.postMessage(proxyMessage);
    });
  };

  protected _initProviderState = async () => {
    const initialProviderState = await this._requestMethod<{
      currentEvmChainId: number;
      currentChainId: string;
      selectedAddress: string;
    } | null>("request", {
      method: "keplr_initProviderState",
    });

    if (initialProviderState) {
      const { currentEvmChainId, currentChainId, selectedAddress } =
        initialProviderState;

      if (
        currentChainId != null &&
        currentEvmChainId != null &&
        selectedAddress != null
      ) {
        this._handleConnect(currentEvmChainId);
        this._handleChainChanged(currentEvmChainId);
        this._currentChainId = currentChainId;
        this._handleAccountsChanged(selectedAddress);
      }
    }
  };

  protected _handleConnect = async (evmChainId: number) => {
    if (!this._isConnected) {
      this._isConnected = true;

      const evmChainIdHexString = `0x${evmChainId.toString(16)}`;

      this.emit("connect", { chainId: evmChainIdHexString });
    }
  };

  protected _handleDisconnect = async () => {
    if (this._isConnected) {
      await this._requestMethod("request", {
        method: "keplr_disconnect",
      });

      this._isConnected = false;
      this.chainId = null;
      this.selectedAddress = null;
      this.networkVersion = null;

      this.emit("disconnect");
    }
  };

  protected _handleChainChanged = async (evmChainId: number) => {
    const evmChainIdHexString = `0x${evmChainId.toString(16)}`;
    if (evmChainIdHexString !== this.chainId) {
      this.chainId = evmChainIdHexString;
      this.networkVersion = evmChainId.toString(10);

      this.emit("chainChanged", evmChainIdHexString);
    }
  };

  protected _handleAccountsChanged = async (selectedAddress: string) => {
    if (this.selectedAddress !== selectedAddress) {
      this.selectedAddress = selectedAddress;

      this.emit("accountsChanged", [selectedAddress]);
    }
  };

  isConnected(): boolean {
    return this._isConnected;
  }

  request = async <T = unknown>({
    method,
    params,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    chainId?: string;
  }): Promise<T> => {
    if (typeof method !== "string") {
      throw new Error("Invalid paramater: `method` must be a string");
    }

    if (!this._isConnected) {
      await this._initProviderState();
    }

    return await this._requestMethod<T>("request", {
      method,
      params,
      providerId: this.eip6963ProviderInfo?.uuid,
      chainId,
    });
  };

  enable = async (): Promise<string[]> => {
    return (await this.request({
      method: "eth_requestAccounts",
    })) as string[];
  };

  net_version = async (): Promise<string> => {
    return (await this.request({
      method: "net_version",
    })) as string;
  };
}

class StarknetProvider implements IStarknetProvider {
  isConnected: boolean = false;

  // It must be in plain text format not hexadecimal string. e.g. "SN_MAIN"
  chainId?: string = undefined;

  selectedAddress?: string = undefined;

  account?: AccountInterface = undefined;

  provider?: ProviderInterface = undefined;

  // It must be in the CAIP-2 chain ID format. e.g. "starknet:SN_MAIN"
  protected _currentChainId?: string = undefined;

  protected _userWalletEvents: WalletEvents[] = [];

  constructor(
    protected readonly metaId: string | undefined,
    public readonly id: string,
    public readonly name: string,
    public readonly version: string,
    public readonly icon: string,

    protected readonly _injectedKeplr: () => InjectedKeplr,
    protected readonly onStateChange: (state: {
      selectedAddress: string | null;
      chainId: string | null;
      rpc: string | null;
    }) => void,
    protected readonly onAccountChange: (state: {
      selectedAddress: string | null;
    }) => void,
    protected readonly _eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },

    protected readonly _parseMessage?: (message: any) => any
  ) {
    this._initProviderState();

    window.addEventListener("keplr_keystorechange", async () => {
      if (this._currentChainId) {
        const selectedAddress = (
          await this._injectedKeplr().getStarknetKey(this._currentChainId)
        ).hexAddress;

        this.selectedAddress = selectedAddress;

        this.onAccountChange({
          selectedAddress,
        });

        this._userWalletEvents.forEach((userWalletEvent) => {
          if (userWalletEvent.type === "accountsChanged") {
            userWalletEvent.handler([selectedAddress]);
          }
        });
      }
    });

    window.addEventListener("keplr_starknetChainChanged", (event) => {
      const origin = (event as CustomEvent).detail.origin;
      const starknetChainId = (event as CustomEvent).detail.starknetChainId;

      this.chainId = starknetChainId;

      if (origin === window.location.origin) {
        this._userWalletEvents.forEach((userWalletEvent) => {
          if (userWalletEvent.type === "networkChanged") {
            userWalletEvent.handler(starknetChainId);
          }
        });
      }
    });
  }

  protected async _requestMethod<T = unknown>(
    method: keyof IStarknetProvider,
    args: Record<string, any>
  ): Promise<T> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");
    const proxyRequestType = `proxy-request${
      this.metaId ? `-${this.metaId}` : ""
    }`;

    const proxyMessage: ProxyRequest = {
      type: proxyRequestType,
      id,
      method: "starknet",
      args: JSONUint8Array.wrap(args),
      starknetProviderMethod: method,
    };

    return new Promise<T>((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this._parseMessage
          ? this._parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this._eventListener.removeMessageListener(receiveResponse);

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

        resolve(result.return as T);
      };

      this._eventListener.addMessageListener(receiveResponse);

      this._eventListener.postMessage(proxyMessage);
    });
  }

  protected async _initProviderState() {
    const { currentChainId, selectedAddress, rpc } = await this.request<{
      currentChainId: string | null;
      selectedAddress: string | null;
      rpc: string | null;
    }>({
      type: "keplr_initStarknetProviderState",
    });

    if (currentChainId != null && selectedAddress != null && rpc != null) {
      this.onStateChange({
        selectedAddress,
        chainId: currentChainId,
        rpc,
      });

      this._currentChainId = currentChainId;
      this.chainId = currentChainId.replace("starknet:", "");
      this.selectedAddress = selectedAddress;
      this.isConnected = true;
    } else {
      this.onStateChange({
        selectedAddress: null,
        chainId: null,
        rpc: null,
      });
    }
  }

  async request<T = unknown>({
    type,
    params,
  }: {
    type: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    if (typeof type !== "string") {
      throw new Error("Invalid parameter: `type` must be a string");
    }

    return await this._requestMethod<T>("request", {
      type,
      params,
    });
  }
  async enable(_options?: {
    starknetVersion?: "v4" | "v5";
  }): Promise<string[]> {
    const { currentChainId, selectedAddress, rpc } = await this.request<{
      currentChainId: string;
      selectedAddress: string;
      rpc: string;
    }>({
      type: "keplr_enableStarknetProvider",
    });

    this.onStateChange({
      selectedAddress,
      chainId: currentChainId,
      rpc,
    });

    this._currentChainId = currentChainId;
    this.chainId = currentChainId.replace("starknet:", "");
    this.selectedAddress = selectedAddress;
    this.isConnected = true;

    return [selectedAddress];
  }
  async isPreauthorized(): Promise<boolean> {
    const { currentChainId, selectedAddress } = await this.request<{
      currentChainId: string | null;
      selectedAddress: string | null;
    }>({
      type: "keplr_initStarknetProviderState",
    });

    if (currentChainId != null && selectedAddress != null) {
      return true;
    }

    return false;
  }
  on<E extends WalletEvents>(event: E["type"], handleEvent: E["handler"]) {
    if (event === "accountsChanged") {
      this._userWalletEvents.push({
        type: "accountsChanged",
        handler: handleEvent as AccountChangeEventHandler,
      });
    } else if (event === "networkChanged") {
      this._userWalletEvents.push({
        type: "networkChanged",
        handler: handleEvent as NetworkChangeEventHandler,
      });
    } else {
      throw new Error("Invalid event type");
    }
  }
  off<E extends WalletEvents>(event: E["type"], handleEvent: E["handler"]) {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      throw new Error("Invalid event type");
    }

    const eventIndex = this._userWalletEvents.findIndex(
      (userEvent) =>
        userEvent.type === event && userEvent.handler === handleEvent
    );

    if (eventIndex >= 0) {
      this._userWalletEvents.splice(eventIndex, 1);
    }
  }
}

export class BitcoinProvider extends EventEmitter implements IBitcoinProvider {
  constructor(
    protected readonly _injectedKeplr: () => InjectedKeplr,
    protected readonly _eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },

    protected readonly _parseMessage?: (message: any) => any
  ) {
    super();

    window.addEventListener("keplr_keystorechange", async () => {
      const accounts = await this.getAccounts();
      if (accounts && accounts.length > 0) {
        this._handleAccountsChanged(accounts[0]);
      }
    });

    window.addEventListener("keplr_bitcoinChainChanged", async (event) => {
      const origin = (event as CustomEvent).detail.origin;

      if (origin === window.location.origin) {
        const network = (event as CustomEvent).detail.network;
        const accounts = await this.getAccounts();
        this._handleNetworkChanged(network);
        this._handleAccountsChanged(accounts[0]);
      }
    });

    window.addEventListener("keplr_bitcoinAccountsChanged", async () => {
      const accounts = await this.getAccounts();
      if (accounts && accounts.length > 0) {
        this._handleAccountsChanged(accounts[0]);
      }
    });
  }

  protected async _requestMethod<T = unknown>(
    method: keyof IBitcoinProvider,
    args: Record<string, any>
  ): Promise<T> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method: "bitcoin",
      args: JSONUint8Array.wrap(args),
      bitcoinProviderMethod: method,
    };

    return new Promise<T>((resolve, reject) => {
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this._parseMessage
          ? this._parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this._eventListener.removeMessageListener(receiveResponse);

        const result = JSONUint8Array.unwrap(proxyResponse.result);

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        // TODO: Handle error correctly
        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        resolve(result.return as T);
      };

      this._eventListener.addMessageListener(receiveResponse);

      this._eventListener.postMessage(proxyMessage);
    });
  }

  getAccounts(): Promise<string[]> {
    return this._requestMethod("getAccounts", []);
  }

  async requestAccounts(): Promise<string[]> {
    return this._requestMethod("requestAccounts", []);
  }

  async disconnect(): Promise<void> {
    return this._requestMethod("disconnect", []);
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    return this._requestMethod("getNetwork", []);
  }

  async switchNetwork(network: BitcoinNetwork): Promise<BitcoinNetwork> {
    return this._requestMethod("switchNetwork", [network]);
  }

  async getChain(): Promise<{
    enum: BitcoinChainType;
    name: string;
    network: BitcoinNetwork;
  }> {
    return this._requestMethod("getChain", []);
  }

  async switchChain(chain: BitcoinChainType): Promise<BitcoinChainType> {
    return this._requestMethod("switchChain", [chain]);
  }

  async getPublicKey(): Promise<string> {
    return this._requestMethod("getPublicKey", []);
  }

  async getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }> {
    return this._requestMethod("getBalance", []);
  }

  async getInscriptions(
    offset?: number,
    limit?: number
  ): Promise<{ total: number; list: Inscription[] }> {
    return this._requestMethod("getInscriptions", [offset, limit]);
  }

  async signMessage(
    message: string,
    type?: BitcoinSignMessageType
  ): Promise<string> {
    return this._requestMethod("signMessage", [message, type]);
  }

  async sendBitcoin(to: string, amount: number): Promise<string> {
    return this._requestMethod("sendBitcoin", [to, amount]);
  }

  async pushTx(rawTxHex: string): Promise<string> {
    return this._requestMethod("pushTx", [rawTxHex]);
  }

  async pushPsbt(psbtHex: string): Promise<string> {
    return this._requestMethod("pushPsbt", [psbtHex]);
  }

  async signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string> {
    return this._requestMethod("signPsbt", [psbtHex, options]);
  }

  async signPsbts(
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ): Promise<string[]> {
    return this._requestMethod("signPsbts", [psbtsHexes, options]);
  }

  async getAddress(): Promise<string> {
    const accounts = await this.getAccounts();
    return accounts[0];
  }

  async connectWallet(): Promise<string[]> {
    return this.requestAccounts();
  }

  protected _handleNetworkChanged = async (network: BitcoinNetwork) => {
    this.emit("networkChanged", network);
  };

  protected _handleAccountsChanged = async (selectedAddress: string) => {
    this.emit("accountChanged", [selectedAddress]);
    this.emit("accountsChanged", [selectedAddress]);
  };
}
