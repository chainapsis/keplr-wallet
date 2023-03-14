import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQuerySecret20BalanceRegistry } from "./secret20-balance";
import { Keplr } from "@keplr-wallet/types";
import { QuerySharedContext } from "../../common";

export interface SecretQueries {
  secret: SecretQueriesImpl;
}

export const SecretQueries = {
  use(options: {
    apiGetter: () => Promise<Keplr | undefined>;
  }): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => SecretQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        secret: new SecretQueriesImpl(
          queriesSetBase,
          sharedContext,
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
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    apiGetter: () => Promise<Keplr | undefined>
  ) {
    this.querySecretContractCodeHash =
      new ObservableQuerySecretContractCodeHash(
        sharedContext,
        chainId,
        chainGetter
      );

    base.queryBalances.addBalanceRegistry(
      new ObservableQuerySecret20BalanceRegistry(
        sharedContext,
        apiGetter,
        this.querySecretContractCodeHash
      )
    );

    this.querySecret20ContractInfo = new ObservableQuerySecret20ContractInfo(
      sharedContext,
      chainId,
      chainGetter,
      apiGetter,
      this.querySecretContractCodeHash
    );
  }
}
