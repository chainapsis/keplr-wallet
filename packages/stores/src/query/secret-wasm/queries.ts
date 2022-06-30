import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySecret20BalanceRegistry } from "./secret20-balance";
import { Keplr } from "@keplr-wallet/types";

export interface SecretQueries {
  secret: SecretQueriesImpl;
}

export const SecretQueries = {
  use(options: {
    apiGetter: () => Promise<Keplr | undefined>;
  }): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => SecretQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        secret: new SecretQueriesImpl(
          queriesSetBase,
          kvStore,
          chainId,
          chainGetter,
          options.apiGetter
        ),
      };
    };
  },
};

export class SecretQueriesImpl {
  public readonly querySecretContractCodeHash: DeepReadonly<ObservableQuerySecretContractCodeHash>;
  public readonly querySecret20ContractInfo: DeepReadonly<ObservableQuerySecret20ContractInfo>;

  constructor(
    base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<Keplr | undefined>
  ) {
    this.querySecretContractCodeHash = new ObservableQuerySecretContractCodeHash(
      kvStore,
      chainId,
      chainGetter
    );

    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySecret20BalanceRegistry(
        kvStore,
        apiGetter,
        this.querySecretContractCodeHash
      )
    );

    this.querySecret20ContractInfo = new ObservableQuerySecret20ContractInfo(
      kvStore,
      chainId,
      chainGetter,
      apiGetter,
      this.querySecretContractCodeHash
    );
  }
}
