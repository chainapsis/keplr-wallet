import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySecret20BalanceRegistry } from "./secret20-balance";
import { QueriesWithCosmos } from "../cosmos";

export interface HasSecretQueries {
  secret: SecretQueries;
}

export class QueriesWithCosmosAndSecret
  extends QueriesWithCosmos
  implements HasSecretQueries {
  public secret: SecretQueries;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter);

    this.secret = new SecretQueries(this, kvStore, chainId, chainGetter);
  }
}

export class SecretQueries {
  public readonly querySecretContractCodeHash: DeepReadonly<ObservableQuerySecretContractCodeHash>;
  public readonly querySecret20ContractInfo: DeepReadonly<ObservableQuerySecret20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.querySecretContractCodeHash = new ObservableQuerySecretContractCodeHash(
      kvStore,
      chainId,
      chainGetter
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySecret20BalanceRegistry(
        kvStore,
        this.querySecretContractCodeHash
      )
    );

    this.querySecret20ContractInfo = new ObservableQuerySecret20ContractInfo(
      kvStore,
      chainId,
      chainGetter,
      this.querySecretContractCodeHash
    );
  }
}
