import {
  ChainGetter,
  HasMapStore,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { Interface } from "@ethersproject/abi";
import { computed, makeObservable } from "mobx";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";
import { ERC20ContractInfo } from "../types";
import { alchemySupportedChainIds } from "../constants";

export class ObservableQueryAlchemyERC20Metadata extends ObservableJsonRPCQuery<ERC20ContractInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly ethereumURL: string,
    protected readonly contractAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "alchemy_getTokenMetadata", [
      contractAddress,
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
  }

  get symbol(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.symbol;
  }

  get decimals(): number | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.decimals;
  }

  get name(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.name;
  }

  get logoURI(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    return this.response.data.logo;
  }
}

const erc20MetadataInterface: Interface = new Interface([
  {
    constant: true,
    inputs: [],
    name: "name",
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

export class ObservableQueryEVMChainERC20MetadataName extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_call", [
      {
        to: contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("name"),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
  }

  @computed
  get name(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      return erc20MetadataInterface.decodeFunctionResult(
        "name",
        this.response.data
      )[0];
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryEVMChainERC20MetadataSymbol extends ObservableEvmChainJsonRpcQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected contractAddress: string
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

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
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
    protected contractAddress: string
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

  protected override canFetch(): boolean {
    return super.canFetch() && this.contractAddress !== "";
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
  protected readonly _queryName: ObservableQueryEVMChainERC20MetadataName;
  protected readonly _querySymbol: ObservableQueryEVMChainERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryEVMChainERC20MetadataDecimals;

  protected readonly _queryAlchemyERC20Metadata:
    | ObservableQueryAlchemyERC20Metadata
    | undefined = undefined;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    contractAddress: string
  ) {
    this._queryName = new ObservableQueryEVMChainERC20MetadataName(
      sharedContext,
      chainId,
      chainGetter,
      contractAddress
    );

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

    if (alchemySupportedChainIds.includes(chainId)) {
      const evmInfo = chainGetter.getChain(chainId).evm;

      if (evmInfo != null) {
        this._queryAlchemyERC20Metadata =
          new ObservableQueryAlchemyERC20Metadata(
            sharedContext,
            chainId,
            chainGetter,
            evmInfo.rpc,
            contractAddress
          );
      }
    }
  }

  get queryName(): ObservableQueryEVMChainERC20MetadataName {
    return this._queryName;
  }

  get querySymbol(): ObservableQueryEVMChainERC20MetadataSymbol {
    return this._querySymbol;
  }

  get queryDecimals(): ObservableQueryEVMChainERC20MetadataDecimals {
    return this._queryDecimals;
  }

  get name(): string | undefined {
    return this._queryAlchemyERC20Metadata?.name ?? this._queryName.name;
  }

  get symbol(): string | undefined {
    return this._queryAlchemyERC20Metadata?.symbol ?? this._querySymbol.symbol;
  }

  get decimals(): number | undefined {
    return (
      this._queryAlchemyERC20Metadata?.decimals ?? this._queryDecimals.decimals
    );
  }

  get logoURI(): string | undefined {
    return this._queryAlchemyERC20Metadata?.logoURI;
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
