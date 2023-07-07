import {
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TokenContract } from "./types";

export class ObservableQueryTokenContractsInner extends ObservableQuery<
  TokenContract[]
> {
  constructor(sharedContext: QuerySharedContext, chainIdentifier: string) {
    super(
      sharedContext,
      "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws/",
      `tokens/${chainIdentifier}`
    );
  }

  get getTokenContracts(): TokenContract[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data;
  }
}

export class ObservableQueryTokenContracts extends HasMapStore<ObservableQueryTokenContractsInner> {
  constructor(sharedContext: QuerySharedContext) {
    super((key: string) => {
      return new ObservableQueryTokenContractsInner(sharedContext, key);
    });
  }

  override get(chainId: string): ObservableQueryTokenContractsInner {
    return super.get(ChainIdHelper.parse(chainId).identifier);
  }
}
