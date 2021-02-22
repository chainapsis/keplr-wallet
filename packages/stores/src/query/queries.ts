import { makeObservable, observable, runInAction } from "mobx";
import { KVStore } from "@keplr/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import { ChainGetter } from "../common";
import {
  ObservableQuerySecret20BalanceRegistry,
  ObservableQuerySecretContractCodeHash,
} from "./secret-wasm";
import {
  ObservableQuerySupplyTotal,
  ObservableQueryInflation,
  ObservableQueryMintingInfation,
  ObservableQueryDelegations,
  ObservableQueryRewards,
  ObservableQueryStakingParams,
  ObservableQueryStakingPool,
  ObservableQueryUnbondingDelegations,
  ObservableQueryValidators,
  ObservableQueryGovernance,
  ObservableQueryAccount,
} from "./cosmos";
import { ObservableQueryCosmosBalanceRegistry } from "./cosmos/balance";
import { ObservableQuerySecret20ContractInfo } from "./secret-wasm/secret20-contract-info";

export class Queries {
  protected readonly _queryBalances: ObservableQueryBalances;

  protected readonly _queryAccount: ObservableQueryAccount;
  protected readonly _queryMint: ObservableQueryMintingInfation;
  protected readonly _queryPool: ObservableQueryStakingPool;
  protected readonly _queryStakingParams: ObservableQueryStakingParams;
  protected readonly _querySupplyTotal: ObservableQuerySupplyTotal;
  protected readonly _queryInflation: ObservableQueryInflation;
  protected readonly _queryRewards: ObservableQueryRewards;
  protected readonly _queryDelegations: ObservableQueryDelegations;
  protected readonly _queryUnbondingDelegations: ObservableQueryUnbondingDelegations;
  protected readonly _queryValidators: ObservableQueryValidators;
  protected readonly _queryGovernance: ObservableQueryGovernance;

  protected readonly _querySecretContractCodeHash: ObservableQuerySecretContractCodeHash;
  protected readonly _querySecret20ContractInfo: ObservableQuerySecret20ContractInfo;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    this._queryBalances = new ObservableQueryBalances(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryBalances.addBalanceRegistry(
      new ObservableQueryCosmosBalanceRegistry(kvStore)
    );

    this._queryAccount = new ObservableQueryAccount(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryMint = new ObservableQueryMintingInfation(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryPool = new ObservableQueryStakingPool(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryStakingParams = new ObservableQueryStakingParams(
      kvStore,
      chainId,
      chainGetter
    );
    this._querySupplyTotal = new ObservableQuerySupplyTotal(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryInflation = new ObservableQueryInflation(
      this._queryMint,
      this._queryPool,
      this._querySupplyTotal
    );
    this._queryRewards = new ObservableQueryRewards(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryDelegations = new ObservableQueryDelegations(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryUnbondingDelegations = new ObservableQueryUnbondingDelegations(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryValidators = new ObservableQueryValidators(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryGovernance = new ObservableQueryGovernance(
      kvStore,
      chainId,
      chainGetter,
      this._queryPool
    );

    this._querySecretContractCodeHash = new ObservableQuerySecretContractCodeHash(
      kvStore,
      chainId,
      chainGetter
    );
    this._queryBalances.addBalanceRegistry(
      new ObservableQuerySecret20BalanceRegistry(
        kvStore,
        this._querySecretContractCodeHash
      )
    );
    this._querySecret20ContractInfo = new ObservableQuerySecret20ContractInfo(
      kvStore,
      chainId,
      chainGetter,
      this._querySecretContractCodeHash
    );
  }

  getQueryAccount(): DeepReadonly<ObservableQueryAccount> {
    return this._queryAccount;
  }

  getQueryMint(): DeepReadonly<ObservableQueryMintingInfation> {
    return this._queryMint;
  }

  getQueryPool(): DeepReadonly<ObservableQueryStakingPool> {
    return this._queryPool;
  }

  getQueryStakingParams(): DeepReadonly<ObservableQueryStakingParams> {
    return this._queryStakingParams;
  }

  getQuerySupplyTotal(): DeepReadonly<ObservableQuerySupplyTotal> {
    return this._querySupplyTotal;
  }

  getQueryInflation(): DeepReadonly<ObservableQueryInflation> {
    return this._queryInflation;
  }

  getQueryRewards(): DeepReadonly<ObservableQueryRewards> {
    return this._queryRewards;
  }

  getQueryBalances(): DeepReadonly<ObservableQueryBalances> {
    return this._queryBalances;
  }

  getQueryDelegations(): DeepReadonly<ObservableQueryDelegations> {
    return this._queryDelegations;
  }

  getQueryUnbondingDelegations(): DeepReadonly<ObservableQueryUnbondingDelegations> {
    return this._queryUnbondingDelegations;
  }

  getQueryValidators(): DeepReadonly<ObservableQueryValidators> {
    return this._queryValidators;
  }

  getQueryGovernance(): DeepReadonly<ObservableQueryGovernance> {
    return this._queryGovernance;
  }

  getQuerySecretContractCodeHash(): DeepReadonly<ObservableQuerySecretContractCodeHash> {
    return this._querySecretContractCodeHash;
  }

  getQuerySecret20ContractInfo(): DeepReadonly<ObservableQuerySecret20ContractInfo> {
    return this._querySecret20ContractInfo;
  }
}

export class QueriesStore {
  @observable.shallow
  protected queriesMap: Map<string, Queries> = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    makeObservable(this);
  }

  get(chainId: string): DeepReadonly<Queries> {
    if (!this.queriesMap.has(chainId)) {
      const queries = new Queries(this.kvStore, chainId, this.chainGetter);
      runInAction(() => {
        this.queriesMap.set(chainId, queries);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)!;
  }
}
