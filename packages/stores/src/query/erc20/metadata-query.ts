import { QueryError, ObservableJsonRPCQuery, ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";

import { ERC20ContractTokenInfo } from "./types";
import { erc20ContractInterface } from "./common";

export class ObservableQueryERC20MetadataName extends ObservableJsonRPCQuery<string> {
  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
      {
        to: contractAddress,
        data: erc20ContractInterface.encodeFunctionData("name"),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get name(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return erc20ContractInterface.decodeFunctionResult(
        "name",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryERC20MetadataSymbol extends ObservableJsonRPCQuery<string> {
  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
      {
        to: contractAddress,
        data: erc20ContractInterface.encodeFunctionData("symbol"),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get symbol(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return erc20ContractInterface.decodeFunctionResult(
        "symbol",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryERC20MetadataDecimals extends ObservableJsonRPCQuery<string> {
  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
      {
        to: contractAddress,
        data: erc20ContractInterface.encodeFunctionData("decimals"),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get decimals(): number | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return erc20ContractInterface.decodeFunctionResult(
        "decimals",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

/**
 * Query for ERC20 Metadata and for an account's balance on the given ERC-20 contract
 */
export class ObservableQueryERC20MetadataInner {
  protected readonly _queryName: ObservableQueryERC20MetadataName;
  protected readonly _querySymbol: ObservableQueryERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryERC20MetadataDecimals;

  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    this._queryName = new ObservableQueryERC20MetadataName(
      kvStore,
      ethereumURL,
      contractAddress
    );

    this._querySymbol = new ObservableQueryERC20MetadataSymbol(
      kvStore,
      ethereumURL,
      contractAddress
    );

    this._queryDecimals = new ObservableQueryERC20MetadataDecimals(
      kvStore,
      ethereumURL,
      contractAddress
    );
  }

  get queryName(): ObservableQueryERC20MetadataName {
    return this._queryName;
  }

  get querySymbol(): ObservableQueryERC20MetadataSymbol {
    return this._querySymbol;
  }

  get queryDecimals(): ObservableQueryERC20MetadataDecimals {
    return this._queryDecimals;
  }

  get symbol(): string | undefined {
    return this._querySymbol.symbol;
  }

  get name(): string | undefined {
    return this._queryName.name;
  }

  get decimals(): number | undefined {
    return this._queryDecimals.decimals;
  }

  @computed
  get tokenInfo(): ERC20ContractTokenInfo {
    return {
      name: this.name,
      decimals: this.decimals,
      symbol: this.symbol,
    };
  }

  @computed
  get isFetching(): boolean {
    return (
      this._queryDecimals.isFetching ||
      this._queryName.isFetching ||
      this._querySymbol.isFetching
    );
  }

  get error(): QueryError<unknown> | undefined {
    return (
      this._queryDecimals.error ||
      this._queryName.error ||
      this._querySymbol.error
    );
  }
}

/**
 * Query ERC20 metadata (https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20Metadata)
 */
export class ObservableQueryERC20Metadata {
  protected queryContractMetadata: ObservableQueryERC20MetadataInner;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    const ethereumUrl = chainGetter.getChain(chainId).ethereumJsonRpc ?? "";

    this.queryContractMetadata = new ObservableQueryERC20MetadataInner(
      kvStore,
      ethereumUrl,
      contractAddress
    );
  }
}
