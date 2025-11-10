import { ObservableChainQuery } from "../../../chain-query";
import { QueryResponse, QuerySharedContext } from "../../../../common";
import { ChainGetter } from "../../../../chain";
import { computed, makeObservable } from "mobx";
import { FeeTokens } from "./types";
import { FeeCurrency } from "@keplr-wallet/types";
import { computedFn } from "mobx-utils";

export class ObservableQueryTxFeesFeeTokens extends ObservableChainQuery<FeeTokens> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/osmosis/txfees/v1beta1/fee_tokens"
    );

    makeObservable(this);
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<FeeTokens>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
    const denoms = response.data.fee_tokens.map((token) => token.denom);
    chainInfo.addUnknownDenoms({
      module: "cosmos",
      coinMinimalDenoms: denoms,
    });
  }

  @computed
  protected get feeCurrenciesDenomMap(): Map<string, boolean> {
    const map = new Map();

    if (!this.response) {
      return map;
    }

    for (const token of this.response.data.fee_tokens) {
      map.set(token.denom, true);
    }

    return map;
  }

  readonly isTxFeeToken = computedFn((coinMinimalDnom: string): boolean => {
    if (!this.response) {
      return false;
    }

    return this.feeCurrenciesDenomMap.get(coinMinimalDnom) === true;
  });

  @computed
  get feeCurrencies(): FeeCurrency[] {
    if (!this.response) {
      return [];
    }

    const res: FeeCurrency[] = [];

    for (const token of this.response.data.fee_tokens) {
      const currency = this.chainGetter
        .getModularChainInfoImpl(this.chainId)
        .findCurrency(token.denom);
      if (currency) {
        res.push(currency);
      }
    }

    return res;
  }
}
