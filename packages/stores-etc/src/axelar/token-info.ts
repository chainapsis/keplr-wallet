import {
  ObservableChainQuery,
  ChainGetter,
  ObservableChainQueryMap,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { TokenInfo } from "./types";

export class ObservableQueryEVMTokenInfoInner extends ObservableChainQuery<TokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _chain: string,
    protected readonly _denom: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/axelar/evm/v1beta1/token_info/${_chain}?asset=${_denom}`
    );
  }

  get chain(): string {
    return this._chain;
  }

  get denom(): string {
    return this._denom;
  }

  get tokenName(): string | undefined {
    return this.response?.data.details.token_name;
  }

  get symbol(): string | undefined {
    return this.response?.data.details.symbol;
  }

  get decimals(): number | undefined {
    return this.response?.data.details.decimals;
  }

  get isConfirmed(): boolean | undefined {
    return this.response?.data.confirmed;
  }

  get isExternal(): boolean | undefined {
    return this.response?.data.is_external;
  }
}

export class ObservableQueryEVMTokenInfo extends ObservableChainQueryMap<TokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (key: string) => {
      const i = key.indexOf("/");
      const chain = key.slice(0, i);
      const denom = key.slice(i + 1);

      return new ObservableQueryEVMTokenInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        chain,
        denom
      );
    });
  }

  getAsset(chain: string, denom: string): ObservableQueryEVMTokenInfoInner {
    return this.get(`${chain}/${denom}`) as ObservableQueryEVMTokenInfoInner;
  }
}
