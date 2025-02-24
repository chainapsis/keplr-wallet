import { TxChainSetter } from "./chain";
import {
  action,
  makeObservable,
  observable,
  override,
  runInAction,
} from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { FetchDebounce, NameService } from "./name-service";
import { JsonRpcProvider } from "@ethersproject/providers";

export class ENSNameService extends TxChainSetter implements NameService {
  readonly type = "ens";

  @observable
  protected _isEnabled: boolean = true;

  @observable
  protected _isFetching: boolean = false;

  @observable
  protected _value: string = "";

  @observable.ref
  protected _result:
    | {
        address: string;
        fullName: string;
        domain: string;
        suffix: string;
      }
    | undefined = undefined;

  // Deep equal check is required to avoid infinite re-render.
  @observable.struct
  protected _ens:
    | {
        chainId: string;
      }
    | undefined = undefined;

  protected debounce = new FetchDebounce();

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    ens:
      | {
          chainId: string;
        }
      | undefined = undefined
  ) {
    super(chainGetter, initialChainId);

    this._ens = ens;

    makeObservable(this);
  }

  @override
  override setChain(chainId: string) {
    const d = this.chainId !== chainId;
    super.setChain(chainId);

    if (d) {
      this.fetch();
    }
  }

  @action
  setENS(ens: { chainId: string }) {
    const d = this._ens?.chainId !== ens.chainId;
    this._ens = ens;

    if (d) {
      this.fetch();
    }
  }

  @action
  setIsEnabled(isEnabled: boolean) {
    const d = this._isEnabled !== isEnabled;
    this._isEnabled = isEnabled;

    if (d) {
      this.fetch();
    }
  }

  get isEnabled(): boolean {
    if (
      !this._ens ||
      this.chainInfo.evm == null ||
      this.chainInfo.bip44.coinType !== 60
    ) {
      return false;
    }

    return this._isEnabled;
  }

  @action
  setValue(value: string) {
    const d = this.value !== value;
    this._value = value;

    if (d) {
      this.fetch();
    }
  }

  get value(): string {
    let v = this._value;
    if (this.isEnabled) {
      const suffix = "eth";
      if (v.endsWith("." + suffix)) {
        v = v.slice(0, v.length - suffix.length - 1);
      }
    }

    return v;
  }

  get result() {
    if (!this.isEnabled) {
      return undefined;
    }

    if (!this._result) {
      return undefined;
    }

    if (this._result.domain !== this.value) {
      return undefined;
    }

    return this._result;
  }

  get isFetching(): boolean {
    return this._isFetching;
  }

  protected async fetch(): Promise<void> {
    if (!this.isEnabled || this.value.trim().length === 0 || !this._ens) {
      runInAction(() => {
        this._result = undefined;
        this._isFetching = false;
      });
      return;
    }

    this.debounce.run(() => this.fetchInternal());
  }

  protected async fetchInternal(): Promise<void> {
    try {
      const chainInfo = this.chainInfo;
      if (!this._ens) {
        throw new Error("ENS or is not set");
      }

      runInAction(() => {
        this._isFetching = true;
      });

      if (!this.chainGetter.hasChain(this._ens.chainId)) {
        throw new Error(`Can't find chain: ${this._ens.chainId}`);
      }

      const prevValue = this.value;

      const suffix = "eth";
      const domain = this.value;
      const username = domain + "." + suffix;

      const res = await new JsonRpcProvider(chainInfo.rpc).getResolver(
        username
      );

      if (this.value === prevValue) {
        if (res?.address) {
          runInAction(() => {
            this._result = {
              address: res.address,
              fullName: username,
              domain,
              suffix,
            };
            this._isFetching = false;
          });
        } else {
          runInAction(() => {
            this._result = undefined;
            this._isFetching = false;
          });
        }
      }
    } catch (e) {
      console.log(e);
      runInAction(() => {
        this._result = undefined;
        this._isFetching = false;
      });
    }
  }
}
