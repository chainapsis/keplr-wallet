import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../../query/chain-query";
import { ChainGetter } from "../../../common";
import { KVStore } from "@keplr-wallet/common";
import { TokenInfo } from "./types";

export class ObservableQueryEVMTokenInfoInner extends ObservableChainQuery<TokenInfo> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly _chain: string,
    protected readonly _denom: string
  ) {
    super(
      kvStore,
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
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const i = key.indexOf("/");
      const chain = key.slice(0, i);
      const denom = key.slice(i + 1);

      return new ObservableQueryEVMTokenInfoInner(
        this.kvStore,
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
