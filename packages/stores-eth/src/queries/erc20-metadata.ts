import {
  ChainGetter,
  HasMapStore,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { Interface } from "@ethersproject/abi";
import { computed, makeObservable } from "mobx";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

const erc20MetadataInterface: Interface = new Interface([
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]);

export class ObservableQueryEVMChainERC20MetadataSymbol extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_call", [
      {
        to: contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("symbol"),
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
      return erc20MetadataInterface.decodeFunctionResult(
        "symbol",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryEVMChainERC20MetadataDecimals extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_call", [
      {
        to: contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("decimals"),
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
      return erc20MetadataInterface.decodeFunctionResult(
        "decimals",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryEVMChainERC20MetadataInner {
  protected readonly _querySymbol: ObservableQueryEVMChainERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryEVMChainERC20MetadataDecimals;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    this._querySymbol = new ObservableQueryEVMChainERC20MetadataSymbol(
      sharedContext,
      chainId,
      chainGetter,
      contractAddress
    );

    this._queryDecimals = new ObservableQueryEVMChainERC20MetadataDecimals(
      sharedContext,
      chainId,
      chainGetter,
      contractAddress
    );
  }

  get querySymbol(): ObservableQueryEVMChainERC20MetadataSymbol {
    return this._querySymbol;
  }

  get queryDecimals(): ObservableQueryEVMChainERC20MetadataDecimals {
    return this._queryDecimals;
  }

  get symbol(): string | undefined {
    return this._querySymbol.symbol;
  }

  get decimals(): number | undefined {
    return this._queryDecimals.decimals;
  }
}

export class ObservableQueryEVMChainERC20Metadata extends HasMapStore<ObservableQueryEVMChainERC20MetadataInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super((contractAddress) => {
      return new ObservableQueryEVMChainERC20MetadataInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  override get(
    contractAddress: string
  ): ObservableQueryEVMChainERC20MetadataInner {
    return super.get(contractAddress);
  }
}
