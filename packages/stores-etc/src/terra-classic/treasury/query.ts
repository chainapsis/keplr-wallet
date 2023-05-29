import {
  ObservableChainQuery,
  ChainGetter,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { TaxCaps, TaxRate } from "./types";
import { computed, makeObservable } from "mobx";
import { RatePretty, Int } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";

export class ObservableQueryTaxCaps extends ObservableChainQuery<TaxCaps> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/terra/treasury/v1beta1/tax_caps"
    );

    makeObservable(this);
  }

  readonly getTaxCaps = computedFn((denom: string): Int | undefined => {
    if (!this.response || !this.response.data.tax_caps) {
      return undefined;
    }

    const cap = this.response.data.tax_caps.find((c) => c.denom === denom);
    if (!cap) {
      return undefined;
    }

    return new Int(cap.tax_cap);
  });
}

export class ObservableQueryTaxRate extends ObservableChainQuery<TaxRate> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/terra/treasury/v1beta1/tax_rate"
    );

    makeObservable(this);
  }

  @computed
  get taxRate(): RatePretty | undefined {
    if (!this.response) {
      return undefined;
    }

    return new RatePretty(this.response.data.tax_rate);
  }
}
