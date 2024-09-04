import { ObservableChainQuery } from "../../../chain-query";
import { ChainGetter } from "../../../../chain";
import { makeObservable } from "mobx";
import { QuerySharedContext } from "../../../../common";
import { ICSProviderParams } from "../types";

export class ObservableQueryICSProviderParams extends ObservableChainQuery<ICSProviderParams> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/interchain_security/ccv/provider/params"
    );

    makeObservable(this);
  }

  get maxProviderConsensusValidators(): number | undefined {
    return this.response?.data.params.max_provider_consensus_validators != null
      ? Number(this.response?.data.params.max_provider_consensus_validators)
      : undefined;
  }
}
