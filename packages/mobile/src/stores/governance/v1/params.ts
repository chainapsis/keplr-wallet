import {GovV1ParamsTally, GovV1ParamsVoting, GovV1ParamsDeposit} from './types';
import {
  ChainGetter,
  ObservableChainQuery,
  QuerySharedContext,
} from '@keplr-wallet/stores';

export class ObservableQueryGovV1ParamTally extends ObservableChainQuery<GovV1ParamsTally> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/gov/v1/params/tallying`,
    );
  }
}

export class ObservableQueryGovV1ParamVoting extends ObservableChainQuery<GovV1ParamsVoting> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    super(sharedContext, chainId, chainGetter, `/cosmos/gov/v1/params/voting`);
  }
}

export class ObservableQueryGovV1ParamDeposit extends ObservableChainQuery<GovV1ParamsDeposit> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
  ) {
    super(sharedContext, chainId, chainGetter, `/cosmos/gov/v1/params/deposit`);
  }
}
