import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySecret20BalanceRegistry } from "./secret20-balance";

export interface HasSecretQueries {
  secret: SecretQueries;
}

export const mixInSecretQueries = <
  T extends new (...args: any[]) => QueriesSetBase
>(
  base: T
) => {
  return class MixIn extends base implements HasSecretQueries {
    public secret: SecretQueries;

    constructor(...args: any[]) {
      super(args[0], args[1], args[2]);
      this.secret = new SecretQueries(this, args[0], args[1], args[2]);
    }
  };
};

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
