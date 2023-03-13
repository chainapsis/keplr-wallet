import { ObservableChainQuery } from "../../chain-query";
import { MintingInflation } from "./types";
import { ChainGetter } from "../../../chain";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/cosmos/mint/v1beta1/inflation"
    );
  }
}
