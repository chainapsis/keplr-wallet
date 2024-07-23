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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
        .then((r) => resolve(r.chainInfos))
        .catch(reject)
        .finally(() => (f = true));

      setTimeout(() => {
        if (!f) {
          this.protectedTryOpenSidePanelIfEnabled();
        }
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
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
      }, 100);
    });
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

          if (
            e.message &&
            e.message.includes("in response to a user gesture")
          ) {
            if (!document.getElementById("__open_keplr_side_panel__")) {
              const button = document.createElement("div");
              button.id = "__open_keplr_side_panel__";
              button.textContent =
                "대강 케플러가 요청을 처리할 수 없어서 이걸 눌러서 케플러를 수동으로 켜야한다는 버튼";
              button.style.position = "absolute";
              button.style.right = "0";
              button.style.top = "50%";
              button.style.transform = "translateY(-50%)";
              button.style.padding = "1rem 1.5rem";
              button.style.zIndex = "2147483647"; // 페이지 상의 다른 요소보다 버튼이 위에 오도록 함
              button.style.fontSize = "1rem";
              button.style.color = "white";
              button.style.cursor = "pointer";
              button.style.background = "blue";

              // 버튼을 body에 추가
              document.body.appendChild(button);

              // 버튼 클릭 이벤트 추가 (필요한 동작을 정의)
              button.addEventListener("click", () => {
                this.protectedTryOpenSidePanelIfEnabled();

                button.remove();
              });
            }
          }
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
