import {
  ChainGetter,
  HasMapStore,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { ObservableQueryEVMChainERC20MetadataInner } from "./erc20-metadata";
import { computed } from "mobx";

export class ObservableQueryERC20ContactInfoInner extends ObservableQueryEVMChainERC20MetadataInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress);
  }

  @computed
  get tokenInfo(): { decimals: number; symbol: string } | undefined {
    if (this.symbol === undefined || this.decimals === undefined) {
      return undefined;
    }

    return {
      decimals: this.decimals,
      symbol: this.symbol,
    };
  }

  get isFetching(): boolean {
    return this._querySymbol.isFetching || this._queryDecimals.isFetching;
  }

  get error() {
    return this._querySymbol.error || this._queryDecimals.error;
  }
}

export class ObservableQueryERC20ContractInfo extends HasMapStore<ObservableQueryERC20ContactInfoInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((contractAddress: string) => {
      return new ObservableQueryERC20ContactInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryERC20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryERC20ContactInfoInner;
  }
}
