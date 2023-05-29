import { ObservableChainQuery } from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryIrisMintingInfation extends ObservableChainQuery<{
  height: string;
  result: {
    mint_denom: string;
    // Dec
    inflation: string;
  };
}> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/mint/params");
  }
}
