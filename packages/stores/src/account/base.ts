import { action, computed, flow, makeObservable, observable } from "mobx";
import { AppCurrency, Keplr, KeplrSignOptions } from "@keplr-wallet/types";
import { ChainGetter } from "../common";
import { DenomHelper, toGenerator } from "@keplr-wallet/common";
import { StdFee } from "@cosmjs/launchpad";
import { evmosToEth } from "@tharsis/address-converter";
import { MakeTxResponse } from "./types";

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

export interface AccountSetOpts {
  readonly suggestChain: boolean;
  readonly suggestChainFn?: (
    keplr: Keplr,
    chainInfo: ReturnType<ChainGetter["getChain"]>
  ) => Promise<void>;
  readonly autoInit: boolean;
  readonly getKeplr: () => Promise<Keplr | undefined>;
}

export class AccountSetBase {
  @observable
  protected _walletVersion: string | undefined = undefined;

  @observable
  protected _walletStatus: WalletStatus = WalletStatus.NotInit;

  @observable
  protected _rejectionReason: Error | undefined;

  @observable
  protected _name: string = "";

  @observable
  protected _bech32Address: string = "";

  @observable
  protected _txTypeInProgress: string = "";

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

  protected makeSendTokenTxFns: ((
    amount: string,
    currency: AppCurrency,
    recipient: string
  ) => MakeTxResponse | undefined)[] = [];

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly opts: AccountSetOpts
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

  registerMakeSendTokenFn(
    fn: (
      amount: string,
      currency: AppCurrency,
      recipient: string
    ) => MakeTxResponse | undefined
  ) {
    this.makeSendTokenTxFns.push(fn);
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
      this._rejectionReason = e;
      return;
    }

    try {
      const key = yield* toGenerator(keplr.getKey(this.chainId));
      this._bech32Address = key.bech32Address;
      this._name = key.name;
      this.pubKey = key.pubKey;

      // Set the wallet status as loaded after getting all necessary infos.
      this._walletStatus = WalletStatus.Loaded;
    } catch (e) {
      console.log(e);
      // Caught error loading key
      // Reset properties, and set status to Rejected
      this._bech32Address = "";
      this._name = "";
      this.pubKey = new Uint8Array(0);

      this._walletStatus = WalletStatus.Rejected;
      this._rejectionReason = e;
    }

    if (this._walletStatus !== WalletStatus.Rejected) {
      // Reset previous rejection error message
      this._rejectionReason = undefined;
    }
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
  get isReadyToSendTx(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  /**
   * @deprecated Use `isReadyToSendTx`
   */
  @computed
  get isReadyToSendMsgs(): boolean {
    return (
      this.walletStatus === WalletStatus.Loaded && this.bech32Address !== ""
    );
  }

  makeSendTokenTx(
    amount: string,
    currency: AppCurrency,
    recipient: string
  ): MakeTxResponse {
    for (let i = 0; i < this.makeSendTokenTxFns.length; i++) {
      const fn = this.makeSendTokenTxFns[i];

      const res = fn(amount, currency, recipient);
      if (res) {
        return res;
      }
    }

    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    throw new Error(`Unsupported type of currency (${denomHelper.type})`);
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

  get walletStatus(): WalletStatus {
    return this._walletStatus;
  }

  get rejectionReason(): Error | undefined {
    return this._rejectionReason;
  }

  get name(): string {
    return this._name;
  }

  get bech32Address(): string {
    return this._bech32Address;
  }

  /**
   * Returns the tx type in progress waiting to be committed.
   * If there is no tx type in progress, this returns an empty string ("").
   */
  get txTypeInProgress(): string {
    return this._txTypeInProgress;
  }

  /**
   * @deprecated Use `txTypeInProgress`
   */
  get isSendingMsg(): string | boolean {
    return this.txTypeInProgress;
  }

  get hasEvmosHexAddress(): boolean {
    return this.bech32Address.startsWith("evmos");
  }

  get evmosHexAddress(): string {
    return evmosToEth(this.bech32Address);
  }
}

export class AccountSetBaseSuper extends AccountSetBase {
  constructor(...params: ConstructorParameters<typeof AccountSetBase>) {
    super(...params);

    makeObservable(this);
  }

  @action
  setTxTypeInProgress(type: string): void {
    this._txTypeInProgress = type;
  }
}
