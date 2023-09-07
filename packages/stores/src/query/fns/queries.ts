import { QueriesSetBase } from "../queries";
import { ChainGetter } from "../../common";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { ObservableQueryAllDomainsOwnedBy } from "./all-domains-by-owner";
import { ObservableQueryDomainData } from "./domain-data";
import { ObservableQueryDomainStatus } from "./domain-status";
import { ObservableQueryPrimaryDomain } from "./primary-domain";
import { ObservableQueryDomainPrice } from "./domain-price";
import { ObservableQueryBeneficiaryAddress } from "./beneficiary-by-domain";
import { ObservableQueryDomainsByBeneficiary } from "./domains-by-beneficiary";
export interface FNSQueries {
  fns: FNSQueriesImpl;
}

export const FNSQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) => FNSQueries {
    return (
      queriesSetBase: QueriesSetBase,
      kvStore: KVStore,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        fns: new FNSQueriesImpl(queriesSetBase, kvStore, chainId, chainGetter),
      };
    };
  },
};

export class FNSQueriesImpl {
  public readonly queryAllDomainsOwnedBy: DeepReadonly<ObservableQueryAllDomainsOwnedBy>;
  public readonly queryDomainData: DeepReadonly<ObservableQueryDomainData>;
  public readonly queryDomainStatus: DeepReadonly<ObservableQueryDomainStatus>;
  public readonly queryPrimaryDomain: DeepReadonly<ObservableQueryPrimaryDomain>;
  public readonly queryDomainPrice: DeepReadonly<ObservableQueryDomainPrice>;
  public readonly queryBeneficiaryAddress: DeepReadonly<ObservableQueryBeneficiaryAddress>;
  public readonly queryDomainsByBeneficiary: DeepReadonly<ObservableQueryDomainsByBeneficiary>;

  constructor(
    _base: QueriesSetBase,
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    this.queryAllDomainsOwnedBy = new ObservableQueryAllDomainsOwnedBy(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDomainData = new ObservableQueryDomainData(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDomainStatus = new ObservableQueryDomainStatus(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryPrimaryDomain = new ObservableQueryPrimaryDomain(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDomainPrice = new ObservableQueryDomainPrice(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryBeneficiaryAddress = new ObservableQueryBeneficiaryAddress(
      kvStore,
      chainId,
      chainGetter
    );
    this.queryDomainsByBeneficiary = new ObservableQueryDomainsByBeneficiary(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
