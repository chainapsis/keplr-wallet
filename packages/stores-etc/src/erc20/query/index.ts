import {
  HasMapStore,
  ObservableJsonRPCQuery,
  QueryError,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { Interface } from "@ethersproject/abi";
import { computed, makeObservable } from "mobx";
import { BigNumber } from "@ethersproject/bignumber";

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
  {
    constant: true,
    inputs: [
      {
        name: "address",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]);

export type Erc20ContractTokenInfo = {
  decimals: number | undefined;
  name: string | undefined;
  symbol: string | undefined;
};

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
  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
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
  constructor(kvStore: KVStore, ethereumURL: string, contractAddress: string) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    super(kvStore, instance, "", "eth_call", [
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

export class ObservableQueryERC20ContractBalance extends ObservableJsonRPCQuery<string> {
  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    userAddress: string
  ) {
    const instance = Axios.create({
      ...{
        baseURL: ethereumURL,
      },
    });

    let messageData: string;
    try {
      messageData = erc20MetadataInterface.encodeFunctionData("balanceOf", [
        userAddress,
      ]);
    } catch (e) {
      messageData = "";
    }

    super(kvStore, instance, "", "eth_call", [
      {
        to: contractAddress,
        data: messageData,
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get balance(): string | undefined {
    if (!this.response) {
      return undefined;
    }

    try {
      const balance = erc20MetadataInterface.decodeFunctionResult(
        "balanceOf",
        this.response.data
      )[0] as BigNumber;
      return balance.toString();
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

export class ObservableQueryERC20ContractDataInner {
  protected readonly _queryName: ObservableQueryERC20MetadataName;
  protected readonly _querySymbol: ObservableQueryERC20MetadataSymbol;
  protected readonly _queryDecimals: ObservableQueryERC20MetadataDecimals;
  protected readonly _queryBalance: ObservableQueryERC20ContractBalance;

  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    userAddress: string
  ) {
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

    this._queryBalance = new ObservableQueryERC20ContractBalance(
      kvStore,
      ethereumURL,
      contractAddress,
      userAddress
    );
  }

  get queryName(): ObservableQueryERC20MetadataName {
    return this._queryName;
  }

  get querySymbol(): ObservableQueryERC20MetadataSymbol {
    return this._querySymbol;
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

  get balance(): string | undefined {
    return this._queryBalance.balance;
  }

  // TODO: check computed
  get tokenInfo(): Erc20ContractTokenInfo {
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
 * This is on temporal stage to implement currency registrar for gravity bridge and axelar network.
 * It is not possible to handle multiple networks on Ethereum at the same time.
 */
export class ObservableQueryERC20ContractData extends HasMapStore<ObservableQueryERC20ContractDataInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly ethereumURL: string,
    protected readonly userAddress?: string
  ) {
    super((key) => {
      const [contractAddress, ethereumURL] = key.split("\n");
      return new ObservableQueryERC20ContractDataInner(
        this.kvStore,
        ethereumURL,
        contractAddress,
        userAddress ?? ""
      );
    });
  }

  get(
    contractAddress: string,
    ethereumURL: string = this.ethereumURL
  ): ObservableQueryERC20ContractDataInner {
    const key = `${contractAddress}\n${ethereumURL}`;
    return super.get(key);
  }
}
