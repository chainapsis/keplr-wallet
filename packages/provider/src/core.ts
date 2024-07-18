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
  DirectAuxSignResponse,
  IEthereumProvider,
} from "@keplr-wallet/types";
import {
  BACKGROUND_PORT,
  MessageRequester,
  sendSimpleMessage,
} from "@keplr-wallet/router";

import { KeplrEnigmaUtils } from "./enigma";

import { CosmJSOfflineSigner, CosmJSOfflineSignerOnlyAmino } from "./cosmjs";
import deepmerge from "deepmerge";
import Long from "long";
import { Buffer } from "buffer/";
import { KeplrCoreTypes } from "./core-types";
import EventEmitter from "events";

export class Keplr implements IKeplr, KeplrCoreTypes {
  protected enigmaUtils: Map<string, SecretUtils> = new Map();

  public defaultOptions: KeplrIntereactionOptions = {};

  constructor(
    public readonly version: string,
    public readonly mode: KeplrMode,
    protected readonly requester: MessageRequester
  ) {}

  async ping(): Promise<void> {
    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "chains",
      "keplr-ping",
      {}
    );

    await this.tryOpenSidePanelIfEnabled();
  }

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
    if (chainInfo.hideInUI) {
      throw new Error("hideInUI is not allowed");
    }

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

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "chains",
      "suggest-chain-info",
      {
        chainInfo,
      }
    );
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
    return (
      await sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-infos-without-endpoints",
        {}
      )
    ).chainInfos;
  }

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return (
      await sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-info-without-endpoints",
        {
          chainId,
        }
      )
    ).chainInfo;
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx",
      "send-tx-to-background",
      {
        chainId,
        tx,
        mode,
      }
    );
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
    const response = await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-cosmos-sign-direct-aux",
      {
        chainId,
        signer,
        signDoc: {
          bodyBytes: signDoc.bodyBytes,
          publicKey: signDoc.publicKey,
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber
            ? signDoc.accountNumber.toString()
            : null,
          sequence: signDoc.sequence ? signDoc.sequence.toString() : null,
        },
        signOptions: deepmerge(
          {
            preferNoSetMemo: this.defaultOptions.sign?.preferNoSetMemo,
          },
          signOptions
        ),
      }
    );

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        publicKey: response.signed.publicKey,
        chainId: response.signed.chainId,
        accountNumber: Long.fromString(response.signed.accountNumber),
        sequence: Long.fromString(response.signed.sequence),
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
    chainId: string,
    signer: string,
    message: string | Uint8Array,
    signType: EthSignType
  ): Promise<Uint8Array> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "request-sign-ethereum",
      {
        chainId,
        signer,
        message: typeof message === "string" ? Buffer.from(message) : message,
        signType,
      }
    );
  }

  async signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-icns-adr-36-signatures-v2",
      {
        chainId,
        contractAddress,
        owner,
        username,
        addressChainIds,
      }
    );
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
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "token-cw20",
      "get-secret20-viewing-key",
      {
        chainId,
        contractAddress,
      }
    );
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "secret-wasm",
      "get-pubkey-msg",
      {
        chainId,
      }
    );
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "secret-wasm",
      "get-tx-encryption-key-msg",
      {
        chainId,
        nonce,
      }
    );
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "secret-wasm",
      "request-encrypt-msg",
      {
        chainId,
        contractCodeHash,
        msg,
      }
    );
  }

  async enigmaDecrypt(
    chainId: string,
    cipherText: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!cipherText || cipherText.length === 0) {
      return new Uint8Array();
    }

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "secret-wasm",
      "request-decrypt-msg",
      {
        chainId,
        cipherText,
        nonce,
      }
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
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "request-sign-eip-712-cosmos-tx-v0",
      {
        chainId,
        signer,
        eip712,
        signDoc,
        signOptions: deepmerge(this.defaultOptions.sign ?? {}, signOptions),
      }
    );
  }

  async __core__getAnalyticsId(): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "analytics",
      "get-analytics-id",
      {}
    );
  }

  async changeKeyRingName({
    defaultName,
    editable = true,
  }: {
    defaultName: string;
    editable?: boolean;
  }): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-v2",
      "change-keyring-name-interactive",
      {
        defaultName,
        editable,
      }
    );
  }

  async __core__privilageSignAminoWithdrawRewards(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "PrivilegeCosmosSignAminoWithdrawRewards",
      {
        chainId,
        signer,
        signDoc,
      }
    );
  }

  async __core__privilageSignAminoDelegate(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "PrivilegeCosmosSignAminoDelegate",
      {
        chainId,
        signer,
        signDoc,
      }
    );
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "background-tx-ethereum",
      "send-ethereum-tx-to-background",
      {
        chainId,
        tx,
      }
    );
  }

  async suggestERC20(chainId: string, contractAddress: string): Promise<void> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "token-erc20",
      "SuggestERC20TokenMsg",
      {
        chainId,
        contractAddress,
      }
    );
  }

  async tryOpenSidePanelIfEnabled(): Promise<void> {
    // TODO: side panel option이 켜져있는지 확인하기 & content script에서 실행되고 있는지 확인하기
    const isEnabled = await sendSimpleMessage<{
      enabled: boolean;
    }>(
      this.requester,
      BACKGROUND_PORT,
      "side-panel",
      "GetSidePanelEnabledMsg",
      {}
    );

    if (isEnabled.enabled) {
      try {
        // IMPORTANT: "tryOpenSidePanelIfEnabled"는 다른 msg system과 아예 분리되어있고 다르게 동작한다.
        //            router-extension package의 src/router/extension.ts에 있는 주석을 참고할 것.
        return await sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          "router-extension/src/router/extension.ts",
          "tryOpenSidePanelIfEnabled",
          {}
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  public readonly ethereum = new EthereumProvider(this.requester);
}

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  chainId: string | null = null;
  selectedAddress: string | null = null;
  networkVersion: string | null = null;

  isKeplr: boolean = true;
  isMetaMask: boolean = true;

  constructor(protected readonly requester: MessageRequester) {
    super();
  }

  isConnected(): boolean {
    return true;
  }

  async request<T>({
    method,
    params,
  }: {
    method: string;
    params: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "request-json-rpc-to-evm",
      {
        method,
        params,
      }
    );
  }

  /**
   * Legacy methods
   */

  async enable(): Promise<string[]> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "request-json-rpc-to-evm",
      {
        method: "eth_requestAccounts",
      }
    );
  }

  async net_version(): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "request-json-rpc-to-evm",
      {
        method: "net_version",
      }
    );
  }
}
