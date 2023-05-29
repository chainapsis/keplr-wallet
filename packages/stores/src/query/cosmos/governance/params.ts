import { ObservableChainQuery } from "../../chain-query";
import { GovParamsDeposit, GovParamsTally, GovParamsVoting } from "./types";
import { ChainGetter } from "../../../chain";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryGovParamTally extends ObservableChainQuery<GovParamsTally> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1beta1/params/tallying`
    );
  }
}

export class ObservableQueryGovParamVoting extends ObservableChainQuery<GovParamsVoting> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1beta1/params/voting`
    );
  }
}

export class ObservableQueryGovParamDeposit extends ObservableChainQuery<GovParamsDeposit> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1beta1/params/deposit`
    );
  }
}
