import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryCw20ContractInfo } from "./cw20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryCw20BalanceRegistry } from "./cw20-balance";
import { QueriesWithCosmosAndSecret } from "../secret-wasm";
import { Keplr } from "@keplr-wallet/types";

export interface HasCosmwasmQueries {
  cosmwasm: CosmwasmQueries;
}

export class QueriesWithCosmosAndSecretAndCosmwasm
  extends QueriesWithCosmosAndSecret
  implements HasCosmwasmQueries {
  public cosmwasm: CosmwasmQueries;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<Keplr | undefined>
  ) {
    super(kvStore, chainId, chainGetter, apiGetter);

    this.cosmwasm = new CosmwasmQueries(this, kvStore, chainId, chainGetter);
  }
}

export class CosmwasmQueries {
  public readonly querycw20ContractInfo: DeepReadonly<ObservableQueryCw20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryCw20BalanceRegistry(kvStore)
    );

    this.querycw20ContractInfo = new ObservableQueryCw20ContractInfo(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
