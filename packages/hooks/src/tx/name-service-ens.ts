import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { FetchDebounce, NameService } from "./name-service";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ITxChainSetter } from "./types";

export class ENSNameService implements NameService {
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
    protected readonly base: ITxChainSetter,
    protected readonly chainGetter: ChainGetter,
    ens:
      | {
          chainId: string;
        }
      | undefined = undefined
  ) {
    this._ens = ens;

    makeObservable(this);

    autorun(() => {
      noop(this.base.chainInfo, this._ens, this.isEnabled, this.value);
      // 위의 값에 변경이 있으면 새로고침
      this.fetch();
    });
  }

  @action
  setENS(ens: { chainId: string }) {
    this._ens = ens;
  }

  @action
  setIsEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
  }

  get isEnabled(): boolean {
    if (
      !this._ens ||
      !("evm" in this.base.chainInfo) ||
      this.base.chainInfo.evm == null ||
      this.base.chainInfo.evm.bip44.coinType !== 60
    ) {
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
    if (this.isEnabled) {
      const suffix = "eth";
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
    if (
      !this.isEnabled ||
      this.value.trim().length === 0 ||
      !this._ens ||
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
      if (!this._ens) {
        throw new Error("ENS or is not set");
      }

      runInAction(() => {
        this._isFetching = true;
      });

      if (!this.chainGetter.hasModularChain(this._ens.chainId)) {
        throw new Error(`Can't find chain: ${this._ens.chainId}`);
      }

      const chainInfo = this.chainGetter.getModularChainInfoImpl(
        this._ens.chainId
      );

      if (!("evm" in chainInfo.embedded)) {
        throw new Error("EVM is not supported on this chain");
      }

      const suffix = "eth";
      const domain = this.value;
      const username = domain + "." + suffix;

      const resolver = await new JsonRpcProvider(
        chainInfo.embedded.evm.rpc
      ).getResolver(username);

      if (!resolver) {
        throw new Error("Can't find resolver");
      }

      const res = await resolver.getAddress(60);

      if (this.value === prevValue) {
        if (res) {
          runInAction(() => {
            this._result = {
              address: res,
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
