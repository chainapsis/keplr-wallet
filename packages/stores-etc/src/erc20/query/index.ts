import {
  HasMapStore,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { Interface } from "ethers";

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

export class ObservableQueryERC20MetadataName extends ObservableJsonRPCQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    ethereumURL: string,
    contractAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "eth_call", [
      {
        to: contractAddress,
        data: erc20MetadataInterface.encodeFunctionData("name"),
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

export class ObservableQueryERC20MetadataSymbol extends ObservableJsonRPCQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    ethereumURL: string,
    contractAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "eth_call", [
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

export class ObservableQueryERC20MetadataDecimals extends ObservableJsonRPCQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    ethereumURL: string,
    contractAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "eth_call", [
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

export class ObservableQueryERC20MetadataInner {
  protected readonly _queryName: ObservableQueryERC20MetadataName;
  protected readonly _querySymbol: ObservableQueryERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryERC20MetadataDecimals;

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    ethereumURL: string,
    contractAddress: string
  ) {
    this._queryName = new ObservableQueryERC20MetadataName(
      sharedContext,
      ethereumURL,
      contractAddress
    );

    this._querySymbol = new ObservableQueryERC20MetadataSymbol(
      sharedContext,
      ethereumURL,
      contractAddress
    );

    this._queryDecimals = new ObservableQueryERC20MetadataDecimals(
      sharedContext,
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
}

/**
 * Query ERC20 metadata (https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20Metadata)
 * This is on temporal stage to implement currency registrar for gravity bridge and axelar network.
 * It is not possible to handle multiple networks on Ethereum at the same time.
 */
export class ObservableQueryERC20Metadata extends HasMapStore<ObservableQueryERC20MetadataInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly ethereumURL: string
  ) {
    super((contractAddress) => {
      return new ObservableQueryERC20MetadataInner(
        this.sharedContext,
        this.ethereumURL,
        contractAddress
      );
    });
  }

  override get(contractAddress: string): ObservableQueryERC20MetadataInner {
    return super.get(contractAddress);
  }
}
