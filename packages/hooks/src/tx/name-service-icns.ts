import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Buffer } from "buffer";
import { FetchDebounce, NameService } from "./name-service";
import { ITxChainSetter } from "./types";
import { ChainGetter } from "@keplr-wallet/stores";

export class ICNSNameService implements NameService {
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
    protected readonly base: ITxChainSetter,
    protected readonly chainGetter: ChainGetter,
    icns:
      | {
          chainId: string;
          resolverContractAddress: string;
        }
      | undefined = undefined
  ) {
    this._icns = icns;

    makeObservable(this);

    autorun(() => {
      noop(this.base.chainInfo, this._icns, this.isEnabled, this.value);
      // 위의 값에 변경이 있으면 새로고침
      this.fetch();
    });
  }

  @action
  setICNS(icns: { chainId: string; resolverContractAddress: string }) {
    this._icns = icns;
  }

  @action
  setIsEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
  }

  get isEnabled(): boolean {
    if (!this._icns) {
      return false;
    }

    return this._isEnabled;
  }

  @action
  setValue(value: string) {
    this._value = value;
  }

  get value(): string {
    let v = this._value;
    const chainInfo = this.base.chainInfo;
    if (this.isEnabled && chainInfo.bech32Config) {
      const suffix = chainInfo.bech32Config.bech32PrefixAccAddr;
      const i = v.lastIndexOf(".");
      if (i >= 0) {
        const tld = v.slice(i + 1);
        if (suffix.startsWith(tld)) {
          v = v.slice(0, i);
        }
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
    const chainInfo = this.base.chainInfo;
    if (
      !this.isEnabled ||
      this.value.trim().length === 0 ||
      !this._icns ||
      !chainInfo.bech32Config ||
      // 글자수가 길어지면 공격자가 실제 온체인 상의 주소로 이름을 생성해서
      // 사용자가 실수로 그 주소로 트랜잭션을 보내게 할 수 있으므로 글자수를 제한한다.
      this.value.length > 20
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
    const prevValue = this.value;
    try {
      const chainInfo = this.base.chainInfo;
      if (!this._icns || !chainInfo.bech32Config) {
        throw new Error("ICNS or bech32 config is not set");
      }

      runInAction(() => {
        this._isFetching = true;
      });

      if (!this.chainGetter.hasModularChain(this._icns.chainId)) {
        throw new Error(`Can't find chain: ${this._icns.chainId}`);
      }

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
      if (this.value === prevValue) {
        runInAction(() => {
          this._result = undefined;
          this._isFetching = false;
        });
      }
    }
  }
}

const noop = (..._args: any[]) => {
  // noop
};
