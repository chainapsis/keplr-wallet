import { TxChainSetter } from "./chain";
import {
  action,
  makeObservable,
  observable,
  override,
  runInAction,
} from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Buffer } from "buffer";
import { FetchDebounce, NameService } from "./name-service";

export class ICNSNameService extends TxChainSetter implements NameService {
  readonly type = "icns";

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
  protected _icns:
    | {
        chainId: string;
        resolverContractAddress: string;
      }
    | undefined = undefined;

  protected debounce = new FetchDebounce();

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    icns:
      | {
          chainId: string;
          resolverContractAddress: string;
        }
      | undefined = undefined
  ) {
    super(chainGetter, initialChainId);

    this._icns = icns;

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
  setICNS(icns: { chainId: string; resolverContractAddress: string }) {
    const d =
      this._icns?.chainId !== icns.chainId ||
      this._icns?.resolverContractAddress !== icns.resolverContractAddress;
    this._icns = icns;

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
    if (!this._icns) {
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
    const chainInfo = this.chainInfo;
    if (this.isEnabled && chainInfo.bech32Config) {
      const suffix = chainInfo.bech32Config.bech32PrefixAccAddr;
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
    const chainInfo = this.chainInfo;
    if (
      !this.isEnabled ||
      this.value.trim().length === 0 ||
      !this._icns ||
      !chainInfo.bech32Config
    ) {
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
      if (!this._icns || !chainInfo.bech32Config) {
        throw new Error("ICNS or bech32 config is not set");
      }

      runInAction(() => {
        this._isFetching = true;
      });

      if (!this.chainGetter.hasChain(this._icns.chainId)) {
        throw new Error(`Can't find chain: ${this._icns.chainId}`);
      }

      const prevValue = this.value;

      const suffix = chainInfo.bech32Config.bech32PrefixAccAddr;
      const domain = this.value;
      const username = domain + "." + suffix;
      const queryData = JSON.stringify({
        address_by_icns: {
          icns: username,
        },
      });

      const res = await simpleFetch<{ data?: { bech32_address: string } }>(
        this.chainGetter.getChain(this._icns.chainId).rest,
        `/cosmwasm/wasm/v1/contract/${
          this._icns.resolverContractAddress
        }/smart/${Buffer.from(queryData).toString("base64")}`
      );

      if (this.value === prevValue) {
        if (res.data.data?.bech32_address) {
          runInAction(() => {
            this._result = {
              address: res.data.data!.bech32_address,
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
