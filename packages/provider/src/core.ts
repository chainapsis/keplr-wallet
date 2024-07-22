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
  }

  enable(chainIds: string | string[]): Promise<void> {
    if (typeof chainIds === "string") {
      chainIds = [chainIds];
    }

    // TODO: 전혀 정상적인 해결법이 아니다. 일단 빠른 테스팅을 위해서 대충 처리한 것이다. 꼭 개선해야함.
    return new Promise((resolve, reject) => {
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
        .catch(reject);

      Promise.all([
        (async () => {
          return await sendSimpleMessage<boolean>(
            this.requester,
            BACKGROUND_PORT,
            "keyring-v2",
            "GetIsLockedMsg",
            {}
          );
        })(),
        this.isEnabled(chainIds),
      ]).then(([isLocked, enabled]) => {
        if (isLocked || !enabled) {
          setTimeout(() => {
            this.protectedTryOpenSidePanelIfEnabled();
          }, 100);
        }
      });
    });
  }

  // TODO: side panel이 있을때 enable의 처리를 위해서 추가해준건데... (permission 처리가 필요할때만 side panel을 열어야하고 이걸 provider에서 미리 알아야 하므로...)
  //       일반 웹페이지에서도 필요할수도 있을 것 같으니 나중에 keplr의 API로 추가해준다.
  //       지금은 귀찮아서 일단 core에만 넣는다.
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

    const hasChain = await sendSimpleMessage(
      this.requester,
      BACKGROUND_PORT,
      "chains",
      "HasChainMsg",
      {
        chainId: chainInfo.chainId,
      }
    );
    if (hasChain) {
      return;
    }

    // TODO: 전혀 정상적인 해결법이 아니다. 일단 빠른 테스팅을 위해서 대충 처리한 것이다. 꼭 개선해야함.
    return new Promise((resolve, reject) => {
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
        .catch(reject);

      setTimeout(() => {
        this.protectedTryOpenSidePanelIfEnabled();
      }, 100);
    });
  }

  async getKey(chainId: string): Promise<Key> {
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainIds);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

    // TODO: 전혀 정상적인 해결법이 아니다. 일단 빠른 테스팅을 위해서 대충 처리한 것이다. 꼭 개선해야함.
    return new Promise((resolve, reject) => {
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
        .catch(reject);

      setTimeout(() => {
        this.protectedTryOpenSidePanelIfEnabled();
      }, 100);
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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
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
    // TODO: 원래 enable을 미리하지 않아도 백그라운드에서 알아서 처리해주는 시스템이였는데...
    //       side panel에서는 불가능하기 때문에 이젠 provider에서 permission도 관리해줘야한다...
    await this.enable(chainId);

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

  // IMPORTANT: protected로 시작하는 method는 InjectedKeplr.startProxy()에서 injected 쪽에서 event system으로도 호출할 수 없도록 막혀있다.
  //            protected로 시작하지 않는 method는 injected keplr에 없어도 event system을 통하면 호출 할 수 있다.
  //            이를 막기 위해서 method 이름을 protected로 시작하게 한다.
  async protectedTryOpenSidePanelIfEnabled(): Promise<void> {
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
        }
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
