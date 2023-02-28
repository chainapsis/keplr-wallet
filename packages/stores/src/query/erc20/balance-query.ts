import { QueryError, ObservableJsonRPCQuery, ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";
import { Int } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { erc20ContractInterface } from "./common";

export class ObservableQueryERC20ContractDataBalance extends ObservableJsonRPCQuery<string> {
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
      messageData = erc20ContractInterface.encodeFunctionData("balanceOf", [
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
      const balance = erc20ContractInterface.decodeFunctionResult(
        "balanceOf",
        this.response.data
      )[0] as Int;
      return balance.toString();
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}

/**
 * Query for an account's balance within the given ERC-20 contract.
 */
export class ObservableQueryERC20ContractBalanceInner {
  protected readonly _queryBalance: ObservableQueryERC20ContractDataBalance;

  constructor(
    kvStore: KVStore,
    ethereumURL: string,
    contractAddress: string,
    userAddress: string
  ) {
    this._queryBalance = new ObservableQueryERC20ContractDataBalance(
      kvStore,
      ethereumURL,
      contractAddress,
      userAddress
    );
  }

  get queryBalance(): ObservableQueryERC20ContractDataBalance {
    return this._queryBalance;
  }

  get balance(): string | undefined {
    return this._queryBalance.balance;
  }

  @computed
  get isFetching(): boolean {
    return this._queryBalance.isFetching;
  }

  get error(): QueryError<unknown> | undefined {
    return this._queryBalance.error;
  }

  fetch() {
    this._queryBalance.fetch();
  }
}

/**
 * Query a contract's balance using the ERC-20 contract interface
 * (https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20).
 */
export class ObservableQueryERC20ContractBalance {
  protected queryContractBalance: ObservableQueryERC20ContractBalanceInner;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly bech32Address: string
  ) {
    const ethereumUrl = chainGetter.getChain(chainId).ethereumJsonRpc ?? "";
    let userAddress = "";
    try {
      userAddress = Bech32Address.fromBech32(
        this.bech32Address,
        chainGetter.getChain(chainId).bech32Config.bech32PrefixAccAddr
      ).toHex(true);
    } catch (e) {}

    this.queryContractBalance = new ObservableQueryERC20ContractBalanceInner(
      kvStore,
      ethereumUrl,
      contractAddress,
      userAddress
    );
  }
}
