import {
  ChainGetter,
  HasMapStore,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { ObservableStarknetChainJsonRpcQuery } from "./starknet-chain-json-rpc";
import { shortString } from "starknet";

export class ObservableQueryStarknetERC20MetadataSymbol extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        contract_address: contractAddress,
        calldata: [],
        // selector.getSelectorFromName("symbol"),
        entry_point_selector:
          "0x216b05c387bab9ac31918a3e61672f4618601f3c598a2f3f2710f37053e1ea4",
      },
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
  }

  @computed
  get symbol(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      let data = this.response.data[0];
      if (this.response.data.length > 1) {
        data =
          "0x" +
          this.response.data
            .map((d) => {
              const hexWithoutPrefix = d.slice(2);
              if (hexWithoutPrefix.length % 2 === 1) {
                return "0" + hexWithoutPrefix;
              }
              return hexWithoutPrefix;
            })
            .join("");
      }

      return shortString.decodeShortString(data);
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryStarknetERC20MetadataDecimals extends ObservableStarknetChainJsonRpcQuery<
  string[]
> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        contract_address: contractAddress,
        calldata: [],
        // selector.getSelectorFromName("decimals"),
        entry_point_selector:
          "0x4c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9",
      },
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
  }

  @computed
  get decimals(): number | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return parseInt(this.response.data[0]);
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

interface ERC20ContractInfo {
  decimals: number;
  symbol: string;
}

export class ObservableQueryStarknetERC20MetadataInner {
  protected readonly _querySymbol: ObservableQueryStarknetERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryStarknetERC20MetadataDecimals;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    this._querySymbol = new ObservableQueryStarknetERC20MetadataSymbol(
      sharedContext,
      chainId,
      chainGetter,
      contractAddress
    );

    this._queryDecimals = new ObservableQueryStarknetERC20MetadataDecimals(
      sharedContext,
      chainId,
      chainGetter,
      contractAddress
    );
  }

  get querySymbol(): ObservableQueryStarknetERC20MetadataSymbol {
    return this._querySymbol;
  }

  get queryDecimals(): ObservableQueryStarknetERC20MetadataDecimals {
    return this._queryDecimals;
  }

  get symbol(): string | undefined {
    return this._querySymbol.symbol;
  }

  get decimals(): number | undefined {
    return this._queryDecimals.decimals;
  }
}

export class ObservableQueryStarknetERC20Metadata extends HasMapStore<ObservableQueryStarknetERC20MetadataInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((contractAddress) => {
      return new ObservableQueryStarknetERC20MetadataInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  override get(
    contractAddress: string
  ): ObservableQueryStarknetERC20MetadataInner {
    return super.get(contractAddress);
  }
}

export class ObservableQueryStarknetERC20ContactInfoInner extends ObservableQueryStarknetERC20MetadataInner {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress);
  }

  @computed
  get tokenInfo(): ERC20ContractInfo | undefined {
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

export class ObservableQueryStarknetERC20ContractInfo extends HasMapStore<ObservableQueryStarknetERC20ContactInfoInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((contractAddress: string) => {
      return new ObservableQueryStarknetERC20ContactInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryStarknetERC20ContactInfoInner {
    return this.get(
      contractAddress
    ) as ObservableQueryStarknetERC20ContactInfoInner;
  }
}
