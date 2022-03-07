import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { AppCurrency, Keplr, KeplrSignOptions } from "@keplr-wallet/types";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";
import { QueriesSetBase, QueriesStore } from "../query";
import { DenomHelper, toGenerator } from "@keplr-wallet/common";
import {
  BroadcastMode,
  makeSignDoc,
  makeStdTx,
  Msg,
  StdFee,
  StdSignDoc,
} from "@cosmjs/launchpad";
import {
  BaseAccount,
  cosmos,
  google,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import Axios, { AxiosInstance } from "axios";
import { Buffer } from "buffer/";
import Long from "long";
import ICoin = cosmos.base.v1beta1.ICoin;
import SignMode = cosmos.tx.signing.v1beta1.SignMode;
import { evmosToEth } from "@hanchon/ethermint-address-converter";
import { bech32 } from "bech32";

export enum WalletStatus {
  NotInit = "NotInit",
  Loading = "Loading",
  Loaded = "Loaded",
  NotExist = "NotExist",
  Rejected = "Rejected",
}

export interface MsgOpt {
  readonly type: string;
  readonly gas: number;
}

/*
  If the chain has "no-legacy-stdTx" feature, we should send the tx based on protobuf.
  Expectedly, the sign doc should be formed as animo-json regardless of the tx type (animo or proto).
*/
type AminoMsgsOrWithProtoMsgs =
  | Msg[]
  | {
      aminoMsgs: Msg[];
      protoMsgs?: google.protobuf.IAny[];
    };

export interface AccountSetOpts<MsgOpts> {
  readonly prefetching: boolean;
  readonly suggestChain: boolean;
  readonly suggestChainFn?: (
    keplr: Keplr,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ) => Promise<void>;
  readonly autoInit: boolean;
  readonly preTxEvents?: {
    onBroadcastFailed?: (e?: Error) => void;
    onBroadcasted?: (txHash: Uint8Array) => void;
    onFulfill?: (tx: any) => void;
  };
  readonly getKeplr: () => Promise<Keplr | undefined>;
  readonly msgOpts: MsgOpts;
  readonly wsObject?: new (
    url: string,
    protocols?: string | string[]
  ) => WebSocket;
}

export class AccountSetBase<MsgOpts, Queries> {
  @observable
  protected _walletVersion: string | undefined = undefined;

  @observable
  protected _walletStatus: WalletStatus = WalletStatus.NotInit;

  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";

  @observable
  protected _isSendingMsg: string | boolean = false;

  public broadcastMode: "sync" | "async" | "block" = "sync";

  protected pubKey: Uint8Array;

  protected hasInited = false;

  protected sendTokenFns: ((
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) => Promise<boolean>)[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<QueriesSetBase & Queries>,
    protected readonly opts: AccountSetOpts<MsgOpts>
  ) {
    makeObservable(this);

    this.pubKey = new Uint8Array();

    if (opts.autoInit) {
      this.init();
    }
  }

  getKeplr(): Promise<Keplr | undefined> {
    return this.opts.getKeplr();
  }

  get msgOpts(): MsgOpts {
    return this.opts.msgOpts;
  }

  registerSendTokenFn(
    fn: (
      amount: string,
      currency: AppCurrency,
      recipient: string,
      memo: string,
      stdFee: Partial<StdFee>,
      signOptions?: KeplrSignOptions,
      onTxEvents?:
        | ((tx: any) => void)
        | {
            onBroadcasted?: (txHash: Uint8Array) => void;
            onFulfill?: (tx: any) => void;
          }
    ) => Promise<boolean>
  ) {
    this.sendTokenFns.push(fn);
  }

  protected async enable(keplr: Keplr, chainId: string): Promise<void> {
    const chainInfo = this.chainGetter.getChain(chainId);

    if (this.opts.suggestChain) {
      if (this.opts.suggestChainFn) {
        await this.opts.suggestChainFn(keplr, chainInfo);
      } else {
        await this.suggestChain(keplr, chainInfo);
      }
    }
    await keplr.enable(chainId);
  }

  protected async suggestChain(
    keplr: Keplr,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ): Promise<void> {
    await keplr.experimentalSuggestChain(chainInfo.raw);
  }

  private readonly handleInit = () => this.init();

  @flow
  public *init() {
    // If wallet status is not exist, there is no need to try to init because it always fails.
    if (this.walletStatus === WalletStatus.NotExist) {
      return;
    }

    // If the store has never been initialized, add the event listener.
    if (!this.hasInited) {
      // If key store in the keplr extension is changed, this event will be dispatched.
      this.eventListener.addEventListener(
        "keplr_keystorechange",
        this.handleInit
      );
    }
    this.hasInited = true;

    // Set wallet status as loading whenever try to init.
    this._walletStatus = WalletStatus.Loading;

    const keplr = yield* toGenerator(this.getKeplr());
    if (!keplr) {
      this._walletStatus = WalletStatus.NotExist;
      return;
    }

    this._walletVersion = keplr.version;

    try {
      yield this.enable(keplr, this.chainId);
    } catch (e) {
      console.log(e);
      this._walletStatus = WalletStatus.Rejected;
      return;
    }

    const key = yield* toGenerator(keplr.getKey(this.chainId));
    this._bech32Address = key.bech32Address;
    this._name = key.name;
    this.pubKey = key.pubKey;

    // Set the wallet status as loaded after getting all necessary infos.
    this._walletStatus = WalletStatus.Loaded;
  }

  @action
  public disconnect(): void {
    this._walletStatus = WalletStatus.NotInit;
    this.hasInited = false;
    this.eventListener.removeEventListener(
      "keplr_keystorechange",
      this.handleInit
    );
    this._bech32Address = "";
    this._name = "";
    this.pubKey = new Uint8Array(0);
  }

  get walletVersion(): string | undefined {
    return this._walletVersion;
  }

  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  async sendMsgs(
    type: string | "unknown",
    msgs:
      | AminoMsgsOrWithProtoMsgs
      | (() => Promise<AminoMsgsOrWithProtoMsgs> | AminoMsgsOrWithProtoMsgs),
    memo: string = "",
    fee: StdFee,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    runInAction(() => {
      this._isSendingMsg = type;
    });

    let txHash: Uint8Array;
    let signDoc: StdSignDoc;
    try {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
    } catch (e) {
      runInAction(() => {
        this._isSendingMsg = false;
      });

      if (this.opts.preTxEvents?.onBroadcastFailed) {
        this.opts.preTxEvents.onBroadcastFailed(e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (this.opts.preTxEvents?.onBroadcasted) {
      this.opts.preTxEvents.onBroadcasted(txHash);
    }
    if (onBroadcasted) {
      onBroadcasted(txHash);
    }

    const txTracer = new TendermintTxTracer(
      this.chainGetter.getChain(this.chainId).rpc,
      "/websocket",
      {
        wsObject: this.opts.wsObject,
      }
    );
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      runInAction(() => {
        this._isSendingMsg = false;
      });

      // After sending tx, the balances is probably changed due to the fee.
      for (const feeAmount of signDoc.fee.amount) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      // Always add the tx hash data.
      if (tx && !tx.hash) {
        tx.hash = Buffer.from(txHash).toString("hex");
      }

      if (this.opts.preTxEvents?.onFulfill) {
        this.opts.preTxEvents.onFulfill(tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }

  async sendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    for (let i = 0; i < this.sendTokenFns.length; i++) {
      const fn = this.sendTokenFns[i];

      if (
        await fn(
          amount,
          currency,
          recipient,
          memo,
          stdFee,
          signOptions,
          onTxEvents
        )
      ) {
        return;
      }
    }

    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    throw new Error(`Unsupported type of currency (${denomHelper.type})`);
  }

  // Return the tx hash.
  protected async broadcastMsgs(
    msgs: AminoMsgsOrWithProtoMsgs,
    fee: StdFee,
    memo: string = "",
    signOptions?: KeplrSignOptions,
    mode: "block" | "async" | "sync" = "async"
  ): Promise<{
    txHash: Uint8Array;
    signDoc: StdSignDoc;
  }> {
    if (this.walletStatus !== WalletStatus.Loaded) {
      throw new Error(`Wallet is not loaded: ${this.walletStatus}`);
    }

    let aminoMsgs: Msg[];
    let protoMsgs: google.protobuf.IAny[] | undefined;
    if ("aminoMsgs" in msgs) {
      aminoMsgs = msgs.aminoMsgs;
      protoMsgs = msgs.protoMsgs;
    } else {
      aminoMsgs = msgs;
    }

    if (aminoMsgs.length === 0) {
      throw new Error("There is no msg to send");
    }

    if (
      this.hasNoLegacyStdFeature() &&
      (!protoMsgs || protoMsgs.length === 0)
    ) {
      throw new Error(
        "Chain can't send legecy stdTx. But, proto any type msgs are not provided"
      );
    }

    const account = await BaseAccount.fetchFromRest(
      this.instance,
      this.bech32Address,
      true
    );

    const coinType = this.chainGetter.getChain(this.chainId).bip44.coinType;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const keplr = (await this.getKeplr())!;

    const signDoc = makeSignDoc(
      aminoMsgs,
      fee,
      this.chainId,
      memo,
      account.getAccountNumber().toString(),
      account.getSequence().toString()
    );

    const signResponse = await keplr.signAmino(
      this.chainId,
      this.bech32Address,
      signDoc,
      signOptions
    );

    const signedTx = this.hasNoLegacyStdFeature()
      ? cosmos.tx.v1beta1.TxRaw.encode({
          bodyBytes: cosmos.tx.v1beta1.TxBody.encode({
            messages: protoMsgs,
            memo: signResponse.signed.memo,
          }).finish(),
          authInfoBytes: cosmos.tx.v1beta1.AuthInfo.encode({
            signerInfos: [
              {
                publicKey: {
                  type_url:
                    coinType === 60
                      ? "/ethermint.crypto.v1.ethsecp256k1.PubKey"
                      : "/cosmos.crypto.secp256k1.PubKey",
                  value: cosmos.crypto.secp256k1.PubKey.encode({
                    key: Buffer.from(
                      signResponse.signature.pub_key.value,
                      "base64"
                    ),
                  }).finish(),
                },
                modeInfo: {
                  single: {
                    mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
                  },
                },
                sequence: Long.fromString(signResponse.signed.sequence),
              },
            ],
            fee: {
              amount: signResponse.signed.fee.amount as ICoin[],
              gasLimit: Long.fromString(signResponse.signed.fee.gas),
            },
          }).finish(),
          signatures: [Buffer.from(signResponse.signature.signature, "base64")],
        }).finish()
      : makeStdTx(signResponse.signed, signResponse.signature);

    return {
      txHash: await keplr.sendTx(this.chainId, signedTx, mode as BroadcastMode),
      signDoc: signResponse.signed,
    };
  }

  get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }

  get walletStatus(): WalletStatus {
    return this._walletStatus;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  get isSendingMsg(): string | boolean {
    return this._isSendingMsg;
  }

  get hasEthereumHexAddress(): boolean {
    return (
      this.bech32Address.startsWith("evmos") ||
      this.bech32Address.startsWith("inj")
    );
  }

  get ethereumHexAddress(): string {
    if (this.bech32Address.startsWith("evmos")) {
      return evmosToEth(this.bech32Address);
    }

    if (this.bech32Address.startsWith("inj")) {
      return `0x${Buffer.from(
        bech32.fromWords(bech32.decode(this.bech32Address).words)
      ).toString("hex")}`;
    }

    return "";
  }

  protected get queries(): DeepReadonly<QueriesSetBase & Queries> {
    return this.queriesStore.get(this.chainId);
  }

  protected hasNoLegacyStdFeature(): boolean {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    return (
      chainInfo.features != null &&
      chainInfo.features.includes("no-legacy-stdTx")
    );
  }
}
