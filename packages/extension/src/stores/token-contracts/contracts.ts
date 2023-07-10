import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TokenContract } from "./types";

export class ObservableQueryTokenContracts extends ObservableQuery<
  TokenContract[]
> {
  constructor(sharedContext: QuerySharedContext, chainId: string) {
    super(
      sharedContext,
      "https://opbaqquqruxn7fdsgcncrtfrwa0qxnoj.lambda-url.us-west-2.on.aws/",
      `tokens/${ChainIdHelper.parse(chainId).identifier}`
    );
  }

  get tokenContracts(): TokenContract[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data;
  }
}
