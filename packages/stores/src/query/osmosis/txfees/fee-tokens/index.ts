import { ObservableChainQuery } from "../../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, QueryResponse } from "../../../../common";
import { computed, makeObservable } from "mobx";
import { FeeTokens } from "./types";
import { FeeCurrency } from "@keplr-wallet/types";
import { computedFn } from "mobx-utils";

export class ObservableQueryTxFeesFeeTokens extends ObservableChainQuery<FeeTokens> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/txfees/v1beta1/fee_tokens");

    makeObservable(this);
  }

  protected setResponse(response: Readonly<QueryResponse<FeeTokens>>) {
    super.setResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const denoms = response.data.fee_tokens.map((token) => token.denom);
    chainInfo.addUnknownCurrencies(...denoms);
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

    const chainInfo = this.chainGetter.getChain(this.chainId);
    for (const token of this.response.data.fee_tokens) {
      const currency = chainInfo.findCurrency(token.denom);
      if (currency) {
        res.push(currency);
      }
    }

    return res;
  }
}
