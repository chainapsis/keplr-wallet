import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../chain";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { ObservableQuerySecret20ContractInfo } from "./secret20-contract-info";
import { DeepReadonly } from "utility-types";
import {
  ObservableQuerySecret20BalanceImpl,
  ObservableQuerySecret20BalanceRegistry,
} from "./secret20-balance";
import { Keplr, Secret20Currency } from "@keplr-wallet/types";
import { QuerySharedContext } from "../../common";
import { DenomHelper } from "@keplr-wallet/common";

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
    protected sharedContext: QuerySharedContext,
    protected chainId: string,
    protected chainGetter: ChainGetter,
    protected apiGetter: () => Promise<Keplr | undefined>
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

  querySecret20ContractBalance(
    bech32Address: string,
    currency: Secret20Currency
  ): ObservableQuerySecret20BalanceImpl {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    return new ObservableQuerySecret20BalanceImpl(
      this.sharedContext,
      this.chainId,
      this.chainGetter,
      this.apiGetter,
      denomHelper,
      bech32Address,
      this.querySecretContractCodeHash,
      currency
    );
  }
}
