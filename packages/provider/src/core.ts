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
  IStarknetProvider,
  WalletEvents,
  SupportedPaymentType,
  IBitcoinProvider,
  Network as BitcoinNetwork,
  BitcoinSignMessageType,
  ChainType as BitcoinChainType,
  SignPsbtOptions,
  Inscription,
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
import type {
  AccountInterface,
  Call,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  ProviderInterface,
} from "starknet";

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
  }

  enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  // TODO: 웹페이지에서도 필요할수도 있을 것 같으니 나중에 keplr의 API로 추가해준다.
  async isEnabled(chainIds: string | string[]): Promise<boolean> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "permission-interactive",
      "is-enabled-access",
      {
        chainIds,
      }
    );
  }

  async disable(chainIds?: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "disable-access",
        {
          chainIds: chainIds ?? [],
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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

    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "need-suggest-chain-info-interaction",
        {
          chainInfo,
        }
      ).then((needInteraction) => {
        if (!needInteraction) {
          f = true;
        }

        sendSimpleMessage(
          this.requester,
          BACKGROUND_PORT,
          "chains",
          "suggest-chain-info",
          {
            chainInfo,
          }
        )
          .then(resolve)
          .catch(reject)
          .finally(() => (f = true));

        setTimeout(() => {
          if (!f) {
            this.protectedTryOpenSidePanelIfEnabled();
          }
        }, 300);
      });
    });
  }

  async getKey(chainId: string): Promise<Key> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "get-cosmos-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-cosmos",
        "get-cosmos-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-infos-without-endpoints",
        {}
      )
        .then((r) => resolve(r.chainInfos))
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "chains",
        "get-chain-info-without-endpoints",
        {
          chainId,
        }
      )
        .then((r) => resolve(r.chainInfo))
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    // XXX: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //      side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    //      sendTx의 경우는 일종의 쿼리이기 때문에 언제 결과가 올지 알 수 없다. 그러므로 미리 권한 처리를 해야한다.
    await this.enable(chainId);

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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then((r) =>
          resolve({
            signed: {
              bodyBytes: r.signed.bodyBytes,
              authInfoBytes: r.signed.authInfoBytes,
              chainId: r.signed.chainId,
              accountNumber: Long.fromString(r.signed.accountNumber),
            },
            signature: r.signature,
          })
        )
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then((r) =>
          resolve({
            signed: {
              bodyBytes: r.signed.bodyBytes,
              publicKey: r.signed.publicKey,
              chainId: r.signed.chainId,
              accountNumber: Long.fromString(r.signed.accountNumber),
              sequence: Long.fromString(r.signed.sequence),
            },
            signature: r.signature,
          })
        )
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signEthereum(
    chainId: string,
    signer: string,
    message: string | Uint8Array,
    signType: EthSignType
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signICNSAdr36(
    chainId: string,
    contractAddress: string,
    owner: string,
    username: string,
    addressChainIds: string[]
  ): Promise<ICNSAdr36Signatures> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-cw20",
        "SuggestTokenMsg",
        {
          chainId,
          contractAddress,
          viewingKey,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-cw20",
        "get-secret20-viewing-key",
        {
          chainId,
          contractAddress,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "get-pubkey-msg",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "get-tx-encryption-key-msg",
        {
          chainId,
          nonce,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "request-encrypt-msg",
        {
          chainId,
          contractCodeHash,
          msg,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async enigmaDecrypt(
    chainId: string,
    cipherText: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    if (!cipherText || cipherText.length === 0) {
      return new Uint8Array();
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "secret-wasm",
        "request-decrypt-msg",
        {
          chainId,
          cipherText,
          nonce,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
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
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-v2",
        "change-keyring-name-interactive",
        {
          defaultName,
          editable,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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

  async __core__privilageSignAminoExecuteCosmWasm(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-cosmos",
      "PrivilegeCosmosSignAminoExecuteCosmWasm",
      {
        chainId,
        signer,
        signDoc,
      }
    );
  }

  async sendEthereumTx(chainId: string, tx: Uint8Array): Promise<string> {
    // XXX: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //      side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    //      sendTx의 경우는 일종의 쿼리이기 때문에 언제 결과가 올지 알 수 없다. 그러므로 미리 권한 처리를 해야한다.
    await this.enable(chainId);

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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "token-erc20",
        "SuggestERC20TokenMsg",
        {
          chainId,
          contractAddress,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async __core__webpageClosed(): Promise<void> {
    await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "interaction",
      "injected-webpage-closed",
      {}
    );
  }

  async getStarknetKey(chainId: string): Promise<{
    name: string;
    hexAddress: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    isNanoLedger: boolean;
  }> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-starknet",
        "get-starknet-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-starknet",
        "get-starknet-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-starknet",
        "request-sign-starknet-tx",
        {
          chainId,
          transactions,
          details,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signStarknetDeployAccountTransaction(
    chainId: string,
    transaction: DeployAccountSignerDetails
  ): Promise<{
    transaction: DeployAccountSignerDetails;
    signature: string[];
  }> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-starknet",
        "request-sign-starknet-deploy-account-tx",
        {
          chainId,
          transaction,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      });
    });
  }

  async getBitcoinKey(chainId: string): Promise<{
    name: string;
    pubKey: Uint8Array;
    address: string;
    paymentType: SupportedPaymentType;
    isNanoLedger: boolean;
  }> {
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "get-bitcoin-key",
        {
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
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
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "get-bitcoin-keys-settled",
        {
          chainIds,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signPsbt(
    chainId: string,
    psbtHex: string,
    options?: SignPsbtOptions
  ): Promise<string> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-sign-bitcoin-psbt",
      {
        chainId,
        psbtHex,
        options,
      }
    );
  }

  async signPsbts(
    chainId: string,
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ): Promise<string[]> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-sign-bitcoin-psbts",
      {
        chainId,
        psbtsHexes,
        options,
      }
    );
  }

  // IMPORTANT: protected로 시작하는 method는 InjectedKeplr.startProxy()에서 injected 쪽에서 event system으로도 호출할 수 없도록 막혀있다.
  //            protected로 시작하지 않는 method는 injected keplr에 없어도 event system을 통하면 호출 할 수 있다.
  //            이를 막기 위해서 method 이름을 protected로 시작하게 한다.
  async protectedTryOpenSidePanelIfEnabled(
    ignoreGestureFailure: boolean = false
  ): Promise<void> {
    let isInContentScript = false;
    // 이 provider가 content script 위에서 동작하고 있는지 아닌지 구분해야한다.
    // content script일때만 side panel을 열도록 시도해볼 가치가 있다.
    // 근데 js 자체적으로 api등을 통해서는 이를 알아낼 방법이 없다.
    // extension 상에서 content script에서 keplr provider proxy를 시작하기 전에 window에 밑의 field를 알아서 주입하는 방식으로 처리한다.
    if (
      typeof window !== "undefined" &&
      (window as any).__keplr_content_script === true
    ) {
      isInContentScript = true;
    }

    if (isInContentScript) {
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

          if (
            !ignoreGestureFailure &&
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_keplr_side_panel__")) {
              const sidePanelPing = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "interaction",
                "ping-content-script-tab-has-opened-side-panel",
                {}
              );

              // 유저가 직접 side panel을 이미 열어논 상태일 수 있다.
              // 이 경우는 무시하도록 한다.
              if (sidePanelPing) {
                return;
              }

              const isKeplrLocked = await sendSimpleMessage<boolean>(
                this.requester,
                BACKGROUND_PORT,
                "keyring",
                "GetIsLockedMsg",
                {}
              );

              const keplrThemeOption = await sendSimpleMessage<
                "light" | "dark" | "auto"
              >(
                this.requester,
                BACKGROUND_PORT,
                "settings",
                "GetThemeOptionMsg",
                {}
              );

              // extension에서 `web_accessible_resources`에 추가된 파일은 이렇게 접근이 가능함
              const fontUrl = chrome.runtime.getURL(
                "/assets/Inter-SemiBold.ttf"
              );
              const fontFaceAndKeyFrames = `
                @font-face {
                  font-family: 'Inter-SemiBold-Keplr';
                  src: url('${fontUrl}') format('truetype');
                  font-weight: 600;
                  font-style: normal;
                }

                @keyframes slide-left {
                  0% {
                    transform: translateY(0%) translateX(100%);
                  }
                  100% {
                    transform: translateY(0%) translateX(0);
                  }
                }
                    
                @keyframes tada {
                  0% {
                    transform: scale3d(1, 1, 1);
                  }
                  10%, 20% {
                    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
                  }
                  30%, 50%, 70%, 90% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
                  }
                  40%, 60%, 80% {
                    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
                  }
                  100% {
                    transform: scale3d(1, 1, 1);
                  }
                }
                  
            `;

              const isLightMode =
                keplrThemeOption === "auto"
                  ? !window.matchMedia("(prefers-color-scheme: dark)").matches
                  : keplrThemeOption === "light";

              // 폰트와 애니메이션을 위한 스타일 요소를 head에 추가
              const styleElement = document.createElement("style");
              styleElement.appendChild(
                document.createTextNode(fontFaceAndKeyFrames)
              );
              document.head.appendChild(styleElement);

              const button = document.createElement("div");
              button.id = "__open_keplr_side_panel__";
              button.style.boxSizing = "border-box";
              button.style.animation = "slide-left 0.5s forwards";
              button.style.position = "fixed";
              button.style.right = "1.5rem";
              button.style.top = "1.5rem";
              button.style.padding = "1rem 1.75rem 1rem 0.75rem";
              button.style.zIndex = "2147483647"; // 페이지 상의 다른 요소보다 버튼이 위에 오도록 함
              button.style.borderRadius = "1rem";
              button.style.display = "flex";
              button.style.alignItems = "center";

              button.style.fontFamily = "Inter-SemiBold-Keplr";
              button.style.fontWeight = "600";

              // button.style.cursor = "pointer";
              button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // if (isLightMode) {
              //   button.style.boxShadow =
              //     "0px 0px 15.5px 0px rgba(0, 0, 0, 0.20)";
              // }
              // button.addEventListener("mouseover", () => {
              //   button.style.background = isLightMode ? "#F2F2F6" : "#242428";
              // });
              // button.addEventListener("mouseout", () => {
              //   button.style.background = isLightMode ? "#FEFEFE" : "#1D1D1F";
              // });

              // const megaphoneWrapper = document.createElement("div");
              // megaphoneWrapper.style.boxSizing = "border-box";
              // megaphoneWrapper.style.display = "flex";
              // megaphoneWrapper.style.position = "absolute";
              // megaphoneWrapper.style.left = "-10px";
              // megaphoneWrapper.style.top = "-10px";
              // megaphoneWrapper.style.padding = "6.5px 6px 5.5px";
              // megaphoneWrapper.style.borderRadius = "255px";
              // megaphoneWrapper.style.background = "#FC8441";
              //
              // const megaphone = document.createElement("img");
              // const megaphoneUrl = chrome.runtime.getURL(
              //   "/assets/megaphone.svg"
              // );
              // megaphone.src = megaphoneUrl;
              // megaphone.style.width = "1.25rem";
              // megaphone.style.height = "1.25rem";
              // megaphone.style.animation = "tada 1s infinite";
              // megaphoneWrapper.appendChild(megaphone);

              const arrowTop = document.createElement("div");
              arrowTop.style.boxSizing = "border-box";
              arrowTop.style.transform = "translateY(-0.65rem)";
              arrowTop.style.marginRight = "0.35rem";
              arrowTop.innerHTML = `
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 29.7522C25.1484 31.0691 16.7109 27.1184 18.6093 18.3391C20.5078 9.55979 25.5703 11.5351 26.414 12.852C27.2578 14.1689 28.3125 22.2898 15.8672 19.2171C5.9109 16.7589 7.15625 6.04811 8 1M8 1L14 8M8 1L1 7.5" stroke="${
                      isLightMode ? "#2C4BE2" : "#72747B"
                    }"/>
                </svg>
              `;

              const keplrLogoWrap = document.createElement("div");
              keplrLogoWrap.style.boxSizing = "border-box";
              keplrLogoWrap.style.position = "relative";
              keplrLogoWrap.style.marginRight = "1rem";
              const keplrLogo = document.createElement("img");
              const keplrLogoUrl = chrome.runtime.getURL(
                `/assets/${
                  isKeplrLocked ? "locked-keplr-logo" : "icon"
                }-128.png`
              );
              keplrLogo.src = keplrLogoUrl;
              keplrLogo.style.boxSizing = "border-box";
              keplrLogo.style.width = "3rem";
              keplrLogo.style.height = "3rem";
              keplrLogoWrap.appendChild(keplrLogo);

              const logoClickCursor = document.createElement("img");
              const logoClickCursorUrl = chrome.runtime.getURL(
                "assets/icon-click-cursor.png"
              );
              logoClickCursor.src = logoClickCursorUrl;
              logoClickCursor.style.boxSizing = "border-box";
              logoClickCursor.style.position = "absolute";
              logoClickCursor.style.right = "-0.2rem";
              logoClickCursor.style.bottom = "-0.2rem";
              logoClickCursor.style.aspectRatio = "78/98";
              logoClickCursor.style.height = "1.375rem";
              keplrLogoWrap.appendChild(logoClickCursor);

              const mainText = document.createElement("span");
              mainText.style.boxSizing = "border-box";
              // mainText.style.maxWidth = "9.125rem";
              mainText.style.fontSize = "1rem";
              mainText.style.color = isLightMode ? "#020202" : "#FEFEFE";
              mainText.textContent = isKeplrLocked
                ? "Unlock Keplr to proceed"
                : "Open Keplr to approve request(s)";

              // const arrowLeftOpenWrapper = document.createElement("div");
              // arrowLeftOpenWrapper.style.boxSizing = "border-box";
              // arrowLeftOpenWrapper.style.display = "flex";
              // arrowLeftOpenWrapper.style.alignItems = "center";
              // arrowLeftOpenWrapper.style.padding = "0.5rem 0.75rem";
              //
              // arrowLeftOpenWrapper.innerHTML = `
              // <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              //   <path d="M13 5L6.25 11.75L13 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   } stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              //   <path d="M19.3333 5L12.5833 11.75L19.3333 18.5" stroke=${
              //     isLightMode ? "#1633C0" : "#566FEC"
              //   }  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              // </svg>`;
              //
              // const openText = document.createElement("span");
              // openText.style.boxSizing = "border-box";
              // openText.style.fontSize = "1rem";
              // openText.style.color = isLightMode ? "#1633C0" : "#566FEC";
              // openText.textContent = "OPEN";
              //
              // arrowLeftOpenWrapper.appendChild(openText);

              // button.appendChild(megaphoneWrapper);
              button.appendChild(arrowTop);
              button.appendChild(keplrLogoWrap);
              button.appendChild(mainText);
              // button.appendChild(arrowLeftOpenWrapper);

              // 버튼을 추가하기 전에 한 번 더 이미 추가된 버튼이 있는지 확인
              const hasAlready = document.getElementById(
                "__open_keplr_side_panel__"
              );

              if (!hasAlready) {
                let removed = false;
                // 유저가 이 button이 아니라 다른 방식(직접 작업줄의 아이콘을 눌러서 등등)으로 side panel을 열수도 있다.
                // 이 경우를 감지해서 side panel이 열렸으면 자동으로 이 버튼이 삭제되도록 한다.
                const intervalId = setInterval(() => {
                  sendSimpleMessage<boolean>(
                    this.requester,
                    BACKGROUND_PORT,
                    "interaction",
                    "ping-content-script-tab-has-opened-side-panel",
                    {}
                  ).then((sidePanelPing) => {
                    if (sidePanelPing) {
                      clearInterval(intervalId);
                      if (!removed) {
                        button.remove();
                        removed = true;
                      }
                    }
                  });
                }, 300);

                // 버튼을 body에 추가
                document.body.appendChild(button);

                // XXX: 현재 크롬의 버그로 인해서 밑의 코드가 동작할 수 없기 때문에 일단 주석처리한다.
                // 버튼 클릭 이벤트 추가 (필요한 동작을 정의)
                // button.addEventListener("click", () => {
                //   this.protectedTryOpenSidePanelIfEnabled(true);
                //
                //   clearInterval(intervalId);
                //   if (!removed) {
                //     button.remove();
                //     removed = true;
                //   }
                // });
              }
            }
          }
        }
      }
    }
  }

  public readonly ethereum = new EthereumProvider(this, this.requester);

  public readonly starknet = new StarknetProvider(this, this.requester);

  public readonly bitcoin = new BitcoinProvider(this, this.requester);
}

// IMPORTANT: 사이드 패널을 열어야하는 JSON-RPC 메소드들이 생길 때마다 여기에 추가해야한다.
const sidePanelOpenNeededJSONRPCMethods = [
  "eth_signTransaction",
  "eth_sendTransaction",
  "personal_sign",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "wallet_watchAsset",
];

class EthereumProvider extends EventEmitter implements IEthereumProvider {
  chainId: string | null = null;
  selectedAddress: string | null = null;
  networkVersion: string | null = null;

  isKeplr: boolean = true;
  isMetaMask: boolean = true;

  constructor(
    protected readonly keplr: Keplr,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  protected async protectedEnableAccess(
    newCurrentChainId?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-evm",
        {
          chainId: newCurrentChainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  protected async protectedGetNewCurrentChainIdFromRequest(
    method: string,
    params?: readonly unknown[] | Record<string, unknown>
  ): Promise<string | undefined> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "get-new-current-chain-id-for-evm",
      {
        method,
        params,
      }
    );
  }

  protected async protectedCheckNeedEnableAccess(
    method: string
  ): Promise<boolean> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-ethereum",
      "check-need-enable-access-for-evm",
      {
        method,
      }
    );
  }

  isConnected(): boolean {
    return true;
  }

  async request<T = unknown>({
    method,
    params,
    providerId,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    providerId?: string;
    chainId?: string;
  }): Promise<T> {
    if (typeof method !== "string") {
      throw new Error("Invalid paramater: `method` must be a string");
    }

    // XXX: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //      side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    //      request의 경우는 일종의 쿼리이기 때문에 언제 결과가 올지 알 수 없다. 그러므로 미리 권한 처리를 해야한다.
    if (await this.protectedCheckNeedEnableAccess(method)) {
      // 활성화할 체인을 변경하는 요청인 경우, 권한 승인하는 UI에서 변경할 체인 아이디가 기본으로 선택되도록 하기 위함이다.
      // 로직이 파편화 되는 것을 막기 위해 백그라운드에서 처리해서 값을 받아오는 방식으로 구현한다.
      const newCurrentChainId =
        await this.protectedGetNewCurrentChainIdFromRequest(method, params);
      await this.protectedEnableAccess(newCurrentChainId);
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-ethereum",
        "request-json-rpc-to-evm",
        {
          method,
          params,
          providerId,
          chainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f && sidePanelOpenNeededJSONRPCMethods.includes(method)) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  /**
   * Legacy methods
   */

  async enable(): Promise<string[]> {
    return await this.request({ method: "eth_requestAccounts" });
  }

  async net_version(): Promise<string> {
    return await this.request({ method: "net_version" });
  }
}

// IMPORTANT: 사이드 패널을 열어야하는 JSON-RPC 메소드들이 생길 때마다 여기에 추가해야한다.
const sidePanelOpenNeededStarknetJSONRPCMethods = [
  "wallet_watchAsset",
  "wallet_switchStarknetChain",
  "wallet_addInvokeTransaction",
  "wallet_addDeclareTransaction",
  "wallet_signTypedData",
];

class StarknetProvider implements IStarknetProvider {
  id: string = "";
  name: string = "";
  version: string = "";
  icon: string = "";

  isConnected: boolean = false;

  chainId?: string | undefined;

  selectedAddress?: string | undefined;

  account?: AccountInterface;

  provider?: ProviderInterface;

  constructor(
    protected readonly keplr: Keplr,
    protected readonly requester: MessageRequester
  ) {}

  protected async protectedEnableAccess(
    newCurrentChainId?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-starknet",
        {
          chainId: newCurrentChainId,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  protected async protectedGetNewCurrentChainIdFromRequest(
    method: string,
    params?: readonly unknown[] | Record<string, unknown>
  ): Promise<string | undefined> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-starknet",
      "get-new-current-chain-id-for-starknet",
      {
        method,
        params,
      }
    );
  }

  protected async protectedCheckNeedEnableAccess(
    method: string,
    params?: readonly unknown[] | Record<string, unknown>
  ): Promise<boolean> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-starknet",
      "check-need-enable-access-for-starknet",
      {
        method,
        params,
      }
    );
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

    // XXX: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //      side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    //      request의 경우는 일종의 쿼리이기 때문에 언제 결과가 올지 알 수 없다. 그러므로 미리 권한 처리를 해야한다.
    if (await this.protectedCheckNeedEnableAccess(type, params)) {
      const newCurrentChainId =
        await this.protectedGetNewCurrentChainIdFromRequest(type, params);
      await this.protectedEnableAccess(newCurrentChainId);
    }

    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-starknet",
        "request-json-rpc-to-starknet",
        {
          // 메시지에서 type이라는 변수가 쓰이기 때문에 method로 변경한다.
          method: type,
          params,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f && sidePanelOpenNeededStarknetJSONRPCMethods.includes(type)) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }
  async enable(_options?: {
    starknetVersion?: "v4" | "v5";
  }): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  isPreauthorized(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  on<E extends WalletEvents>(_event: E["type"], _handleEvent: E["handler"]) {
    throw new Error("Method not implemented.");
  }
  off<E extends WalletEvents>(_event: E["type"], _handleEvent: E["handler"]) {
    throw new Error("Method not implemented.");
  }
}

class BitcoinProvider extends EventEmitter implements IBitcoinProvider {
  constructor(
    protected readonly keplr: Keplr,
    protected readonly requester: MessageRequester
  ) {
    super();
  }

  protected async protectedEnableAccess(): Promise<void> {
    return new Promise((resolve, reject) => {
      let f = false;

      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "permission-interactive",
        "enable-access-for-bitcoin",
        {}
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getAccounts(): Promise<string[]> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-accounts",
      {}
    );
  }

  async requestAccounts(): Promise<string[]> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-request-accounts",
      {}
    );
  }

  async disconnect(): Promise<void> {
    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-disconnect",
      {}
    );
  }

  async getNetwork(): Promise<BitcoinNetwork> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-network",
      {}
    );
  }

  async switchNetwork(network: BitcoinNetwork): Promise<BitcoinNetwork> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-bitcoin-switch-network",
        {
          network,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getChain(): Promise<{
    enum: BitcoinChainType;
    name: string;
    network: BitcoinNetwork;
  }> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-chain",
      {}
    );
  }

  async switchChain(chain: BitcoinChainType): Promise<BitcoinChainType> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-bitcoin-switch-chain",
        {
          chainType: chain,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getPublicKey(): Promise<string> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-public-key",
      {}
    );
  }

  async getBalance(): Promise<{
    confirmed: number;
    unconfirmed: number;
    total: number;
  }> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-balance",
      {}
    );
  }

  async getInscriptions(
    offset?: number,
    limit?: number
  ): Promise<{ total: number; list: Inscription[] }> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-get-inscriptions",
      {
        offset,
        limit,
      }
    );
  }

  async signMessage(
    message: string,
    signType?: BitcoinSignMessageType
  ): Promise<string> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-sign-bitcoin-message",
        {
          message,
          signType,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async sendBitcoin(to: string, amount: number): Promise<string> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-bitcoin-send-bitcoin",
        {
          to,
          amount,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async pushTx(rawTxHex: string): Promise<string> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-push-tx",
      {
        rawTxHex,
      }
    );
  }

  async pushPsbt(psbtHex: string): Promise<string> {
    await this.protectedEnableAccess();

    return await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "keyring-bitcoin",
      "request-bitcoin-push-psbt",
      {
        psbtHex,
      }
    );
  }

  async signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-sign-bitcoin-psbt",
        {
          psbtHex,
          options,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async signPsbts(
    psbtsHexes: string[],
    options?: SignPsbtOptions
  ): Promise<string[]> {
    // Side panel을 어차피 열어야 하는 메소드이므로 여기선 권한 체크 요청을 생략한다.
    return new Promise((resolve, reject) => {
      let f = false;
      sendSimpleMessage(
        this.requester,
        BACKGROUND_PORT,
        "keyring-bitcoin",
        "request-sign-bitcoin-psbts",
        {
          psbtsHexes,
          options,
        }
      )
        .then(resolve)
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.keplr.protectedTryOpenSidePanelIfEnabled();
        }
      }, 300);
    });
  }

  async getAddress(): Promise<string> {
    throw new Error("This method should not be called");
  }

  async connectWallet(): Promise<string[]> {
    throw new Error("This method should not be called");
  }
}
