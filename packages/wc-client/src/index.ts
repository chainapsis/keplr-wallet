import {
  AminoSignResponse,
  BroadcastMode,
  ChainInfo,
  ChainInfoWithoutEndpoints,
  DirectAuxSignResponse,
  DirectSignResponse,
  EthSignType,
  ICNSAdr36Signatures,
  Keplr,
  KeplrIntereactionOptions,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  SecretUtils,
  SettledResponses,
  StdSignature,
  StdSignDoc,
} from "@keplr-wallet/types";
import SignClient from "@walletconnect/sign-client";
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
} from "@keplr-wallet/provider";
import { Buffer } from "buffer/";
import { ProposalTypes, SessionTypes } from "@walletconnect/types";
import Long from "long";

interface RequestParams {
  topic: string;
  request: {
    method: string;
    params: any;
  };
  chainId: string;
  expiry?: number;
}

interface KeplrGetKeyWalletConnectV2Response {
  // Name of the selected key store.
  readonly name: string;
  readonly algo: string;
  readonly pubKey: string;
  readonly address: string;
  readonly bech32Address: string;
  readonly isNanoLedger: boolean;
}

export class KeplrWalletConnectV2 implements Keplr {
  defaultOptions: KeplrIntereactionOptions = {};

  readonly version: string = "0.12.20";
  readonly mode: KeplrMode = "walletconnect";
  protected readonly storeKey = "keplr_wallet_connect_v2_key";

  constructor(
    public readonly signClient: SignClient,
    public readonly options: {
      sendTx?: Keplr["sendTx"];
      sessionProperties?: ProposalTypes.SessionProperties;
    }
  ) {
    if (options.sessionProperties) {
      this.saveKeys(options.sessionProperties);
    }

    signClient.on("session_event", (event) => {
      if (event.params.event.name === "keplr_accountsChanged") {
        this.saveKeys(event.params.event.data);

        window.dispatchEvent(new Event("keplr_keystorechange"));
      }
    });

    signClient.on("session_delete", async () => {
      localStorage.removeItem(this.getKeyLastSeenKey());
    });
  }

  protected saveKeys(sessionProperty: ProposalTypes.SessionProperties) {
    if (sessionProperty.hasOwnProperty("keys")) {
      const keys = JSON.parse(sessionProperty["keys"]);

      if (keys.length > 0) {
        keys.forEach((key: any) => {
          if (key.hasOwnProperty("chainId")) {
            this.saveLastSeenKey(
              key["chainId"],
              this.convertToKeplrGetKeyWalletConnectV2Response(key)
            );
          }
        });
      }
    }
  }

  protected convertToKeplrGetKeyWalletConnectV2Response(
    data: any
  ): KeplrGetKeyWalletConnectV2Response {
    if (
      !data.hasOwnProperty("name") ||
      !data.hasOwnProperty("algo") ||
      !data.hasOwnProperty("pubKey") ||
      !data.hasOwnProperty("address") ||
      !data.hasOwnProperty("bech32Address") ||
      !data.hasOwnProperty("isNanoLedger")
    ) {
      throw new Error("Invalid data");
    }

    return {
      name: data.name as string,
      algo: data.algo as string,
      pubKey: data.pubKey as string,
      address: data.address as string,
      bech32Address: data.bech32Address as string,
      isNanoLedger: data.isNanoLedger === "true",
    };
  }

  protected getLastSession(): SessionTypes.Struct | undefined {
    const lastKeyIndex = this.signClient.session.getAll().length - 1;
    return this.signClient.session.getAll()[lastKeyIndex];
  }

  protected getCurrentTopic(): string {
    const lastSession = this.getLastSession();

    if (!lastSession) {
      throw new Error("No session");
    }

    return lastSession.topic;
  }

  protected getKeyLastSeenKey() {
    const topic = this.getCurrentTopic();
    return `${this.storeKey}/${topic}-key`;
  }

  protected getLastSeenKey(
    chainId: string
  ): KeplrGetKeyWalletConnectV2Response | undefined {
    const saved = this.getAllLastSeenKey();

    if (!saved) {
      return undefined;
    }

    return saved[chainId];
  }

  protected getAllLastSeenKey() {
    const data = localStorage.getItem(this.getKeyLastSeenKey());
    if (!data) {
      return undefined;
    }

    return JSON.parse(data);
  }

  protected saveLastSeenKey(
    chainId: string,
    response: KeplrGetKeyWalletConnectV2Response
  ) {
    let saved = this.getAllLastSeenKey();

    if (!saved) {
      saved = {};
    }

    saved[chainId] = response;

    this.saveAllLastSeenKey(saved);
  }

  protected saveAllLastSeenKey(data: {
    [chainId: string]: KeplrGetKeyWalletConnectV2Response | undefined;
  }) {
    localStorage.setItem(this.getKeyLastSeenKey(), JSON.stringify(data));
  }

  protected async sendCustomRequest<T>(
    requestParams: RequestParams
  ): Promise<T> {
    const response = await this.signClient.request(requestParams);
    return response as T;
  }

  protected getNamespaceChainId(): string {
    const lastSession = this.getLastSession();

    if (
      lastSession &&
      lastSession.namespaces.hasOwnProperty("cosmos") &&
      lastSession.namespaces["cosmos"].hasOwnProperty("accounts")
    ) {
      const splitAccount =
        lastSession.namespaces["cosmos"]["accounts"][0].split(":");

      return `${splitAccount[0]}:${splitAccount[1]}`;
    }

    return "cosmos:cosmoshub-4";
  }

  protected checkDeepLink() {
    const mobileLinkInfo = localStorage.getItem(
      "wallet-connect-v2-mobile-link"
    );

    if (mobileLinkInfo) {
      window.location.href = JSON.parse(mobileLinkInfo).href;
    }
  }

  changeKeyRingName(_opts: {
    defaultName: string;
    editable?: boolean | undefined;
  }): Promise<string> {
    throw new Error("Not yet implemented");
  }

  disable(_chainIds?: string | string[]): Promise<void> {
    throw new Error("Not yet implemented");
  }

  async enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    // Check public key from local storage.
    const keys = await this.getAllLastSeenKey();
    if (keys) {
      const hasChainId = chainIds.every((chainId) => {
        return Object.keys(keys).includes(chainId);
      });

      if (hasChainId) {
        return;
      }
    }

    this.checkDeepLink();

    // Request enable from the mobile wallet.
    const topic = this.getCurrentTopic();
    const chainId = this.getNamespaceChainId();
    if (!chainId) {
      throw new Error("No Namespace chain id");
    }
    const param = {
      topic: topic,
      chainId: this.getNamespaceChainId(),
      request: {
        method: "keplr_enable",
        params: {
          chainId: chainIds,
        },
      },
    };

    await this.sendCustomRequest<void>(param);

    // session의 정보가 업데이트 되기 전에 다음로직이 실행되면 안되기 때문에 namespace가 업데이트 될때까지 기다린다.
    // We wait for the namespace to be updated because we don't want the next logic to run before the session's information is updated.
    return new Promise(async (resolve) => {
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const lastSession = this.getLastSession();
        if (
          lastSession &&
          lastSession.namespaces.hasOwnProperty("cosmos") &&
          lastSession.namespaces["cosmos"].hasOwnProperty("accounts")
        ) {
          const hasChainId = lastSession.namespaces["cosmos"]["accounts"].some(
            (account) => {
              const chainId = account.replace("cosmos:", "").split(":")[0];
              return chainIds.includes(chainId);
            }
          );

          if (hasChainId) {
            resolve();
            return;
          }
        }
      }
    });
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

  experimentalSignEIP712CosmosTx_v0(
    _chainId: string,
    _signer: string,
    _eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    _signDoc: StdSignDoc,
    _signOptions: KeplrSignOptions = {}
  ): Promise<AminoSignResponse> {
    throw new Error("Not yet implemented");
  }

  experimentalSuggestChain(_chainInfo: ChainInfo): Promise<void> {
    throw new Error("Not yet implemented");
  }

  getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
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
    // Check public key from local storage.
    const lastSeenKey = this.getLastSeenKey(chainId);
    if (lastSeenKey) {
      return {
        algo: lastSeenKey.algo,
        bech32Address: lastSeenKey.bech32Address,
        address: Buffer.from(lastSeenKey.address, "base64"),
        name: lastSeenKey.name,
        pubKey: Buffer.from(lastSeenKey.pubKey, "base64"),
        isNanoLedger: lastSeenKey.isNanoLedger,
        isKeystone: false,
      };
    }

    // Check public key from session properties.
    const lastSession = this.getLastSession();
    if (lastSession && lastSession.sessionProperties) {
      const sessionChainId = lastSession.sessionProperties["chainId"];

      if (sessionChainId === chainId) {
        return {
          algo: lastSession.sessionProperties["algo"],
          bech32Address: lastSession.sessionProperties["bech32Address"],
          address: Buffer.from(
            lastSession.sessionProperties["address"],
            "base64"
          ),
          name: lastSession.sessionProperties["name"],
          pubKey: Buffer.from(
            lastSession.sessionProperties["pubKey"],
            "base64"
          ),
          isNanoLedger:
            lastSession.sessionProperties["isNanoLedger"] === "true",
          isKeystone: false,
        };
      }
    }

    // Request `get_key` from the mobile wallet.
    const topic = this.getCurrentTopic();
    const param = {
      topic,
      chainId: this.getNamespaceChainId(),
      request: {
        method: "keplr_getKey",
        params: {
          chainId,
        },
      },
    };

    const response = await this.sendCustomRequest<{
      name: string;
      algo: string;
      pubKey: string;
      address: string;
      bech32Address: string;
      isNanoLedger: boolean;
    }>(param);

    return {
      ...response,
      pubKey: Buffer.from(response.pubKey, "base64"),
      address: Buffer.from(response.address, "base64"),
      isKeystone: false,
    };
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    const paramArray = chainIds.map(async (chainId) => {
      return await this.getKey(chainId);
    });

    return await Promise.allSettled(paramArray);
  }

  getOfflineSigner(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this, signOptions);
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

  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner {
    return new CosmJSOfflineSignerOnlyAmino(chainId, this, signOptions);
  }

  getSecret20ViewingKey(
    _chainId: string,
    _contractAddress: string
  ): Promise<string> {
    throw new Error("Not yet implemented");
  }

  sendTx(
    chainId: string,
    tx: Uint8Array,
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
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    this.checkDeepLink();

    const topic = this.getCurrentTopic();

    const param = {
      topic,
      chainId: this.getNamespaceChainId(),
      request: {
        method: "keplr_signAmino",
        params: {
          chainId,
          signer,
          signDoc,
          signOptions: signOptions,
        },
      },
    };

    return await this.sendCustomRequest<AminoSignResponse>(param);
  }

  signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    this.checkDeepLink();

    const topic = this.getCurrentTopic();

    const param = {
      topic,
      chainId: this.getNamespaceChainId(),
      request: {
        method: "keplr_signArbitrary",
        params: {
          chainId,
          signer,
          type: typeof data === "string" ? "string" : "Uint8Array",
          data:
            typeof data === "string"
              ? data
              : Buffer.from(data).toString("base64"),
        },
      },
    };
    return this.sendCustomRequest<StdSignature>(param);
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
    signOptions?: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    this.checkDeepLink();

    const topic = this.getCurrentTopic();

    const param = {
      topic,
      chainId: this.getNamespaceChainId(),
      request: {
        method: "keplr_signDirect",
        params: {
          chainId,
          signer,
          signDoc: {
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber?.toString(),
            bodyBytes: signDoc.bodyBytes
              ? Buffer.from(signDoc.bodyBytes).toString("base64")
              : null,
            authInfoBytes: signDoc.authInfoBytes
              ? Buffer.from(signDoc.authInfoBytes).toString("base64")
              : null,
          },
          signOptions: signOptions,
        },
      },
    };

    const response = await this.sendCustomRequest<{
      readonly signed: {
        bodyBytes?: string | null;
        authInfoBytes?: string | null;
        chainId?: string | null;
        accountNumber?: string | null;
      };
      readonly signature: StdSignature;
    }>(param);

    return {
      signature: response.signature,
      signed: {
        chainId: response.signed.chainId ?? "",
        accountNumber: response.signed.accountNumber
          ? Long.fromString(response.signed.accountNumber)
          : new Long(0),
        bodyBytes: response.signed.bodyBytes
          ? Buffer.from(response.signed.bodyBytes, "base64")
          : new Uint8Array([]),
        authInfoBytes: response.signed.authInfoBytes
          ? Buffer.from(response.signed.authInfoBytes, "base64")
          : new Uint8Array([]),
      },
    };
  }

  signDirectAux(
    _chainId: string,
    _signer: string,
    _signDoc: {
      bodyBytes?: Uint8Array | null;
      publicKey?: {
        typeUrl: string;
        value: Uint8Array;
      } | null;
      chainId?: string | null;
      accountNumber?: Long | null;
      sequence?: Long | null;
      tip?: {
        amount: {
          denom: string;
          amount: string;
        }[];
        tipper: string;
      } | null;
    },
    _signOptions?: Exclude<
      KeplrSignOptions,
      "preferNoSetFee" | "disableBalanceCheck"
    >
  ): Promise<DirectAuxSignResponse> {
    throw new Error("Not yet implemented");
  }

  signEthereum(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array,
    _type: EthSignType
  ): Promise<Uint8Array> {
    throw new Error("Not yet implemented");
  }

  signICNSAdr36(
    _chainId: string,
    _contractAddress: string,
    _owner: string,
    _username: string,
    _addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    throw new Error("Not yet implemented");
  }

  suggestToken(
    _chainId: string,
    _contractAddress: string,
    _viewingKey?: string
  ): Promise<void> {
    throw new Error("Not yet implemented");
  }

  verifyArbitrary(
    _chainId: string,
    _signer: string,
    _data: string | Uint8Array,
    _signature: StdSignature
  ): Promise<boolean> {
    throw new Error("Not yet implemented");
  }
}
