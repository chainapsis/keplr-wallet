import {
  ObservableQuery,
  QueriesSetBase,
  QuerySharedContext,
} from '@keplr-wallet/stores';
import {DeepReadonly} from 'utility-types';
import {AprItem, AprItemInner} from './types';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {Dec, IntPretty} from '@keplr-wallet/unit';

export interface AprQueries {
  apr: AprQueriesImpl;
}

export const AprQueries = {
  use(options: {
    aprBaseUrl: string;
  }): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
  ) => AprQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
    ) => {
      return {
        apr: new AprQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          options.aprBaseUrl,
        ),
      };
    };
  },
};

class AprQueriesImpl {
  public readonly queryApr: DeepReadonly<ObservableQueryApr>;

  constructor(
    _base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    url: string,
  ) {
    this.queryApr = new ObservableQueryApr(sharedContext, chainId, url);
  }
}

class ObservableQueryApr extends ObservableQuery<AprItemInner> {
  protected _chainId: string;
  constructor(sharedContext: QuerySharedContext, chainId: string, url: string) {
    super(sharedContext, url, `apr/${ChainIdHelper.parse(chainId).identifier}`);
    this._chainId = chainId;
  }

  get apr(): AprItem {
    if (!this.response || !this.response.data || !this.response.data.apr) {
      return {chainId: this._chainId};
    }

    return {
      chainId: this._chainId,
      apr: new IntPretty(new Dec(this.response.data.apr)).moveDecimalPointRight(
        2,
      ),
    };
  }
}

export * from './types';
