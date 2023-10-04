import {
  ChainGetter,
  HasMapStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { RouteResponse } from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import Joi from "joi";

const Schema = Joi.object<RouteResponse>({
  source_asset_denom: Joi.string().required(),
  source_asset_chain_id: Joi.string().required(),
  dest_asset_denom: Joi.string().required(),
  dest_asset_chain_id: Joi.string().required(),
  amount_in: Joi.string().required(),
  amount_out: Joi.string().required(),
  operations: Joi.array()
    .items(
      Joi.object({
        swap: Joi.object({
          swap_in: {
            swap_venue: Joi.object({
              name: Joi.string().required(),
              chain_id: Joi.string().required(),
            }).required(),
            swap_operations: Joi.array()
              .items(
                Joi.object({
                  pool: Joi.string().required(),
                  denom_in: Joi.string().required(),
                  denom_out: Joi.string().required(),
                })
              )
              .required(),
            swap_amount_in: Joi.string().required(),
          },
          estimated_affiliate_fee: Joi.string().required(),
        }).unknown(true),
      }),
      Joi.object({
        transfer: Joi.object({
          port: Joi.string().required(),
          channel: Joi.string().required(),
          chain_id: Joi.string().required(),
          pfm_enabled: Joi.boolean(),
          dest_denom: Joi.string().required(),
          supports_memo: Joi.boolean(),
        }).unknown(true),
      })
    )
    .required(),
  chain_ids: Joi.array().items(Joi.string()).required(),
  does_swap: Joi.boolean(),
  estimated_amount_out: Joi.string(),
  swap_venue: Joi.object({
    name: Joi.string().required(),
    chain_id: Joi.string().required(),
  }),
  txs_required: Joi.number().required(),
}).unknown(true);

export class ObservableQueryRouteInner extends ObservableQuery<RouteResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    skipURL: string,
    public readonly sourceChainId: string,
    public readonly sourceAmount: string,
    public readonly sourceDenom: string,
    public readonly destChainId: string,
    public readonly destDenom: string,
    public readonly affiliateFeeBps: number,
    public readonly swapVenue: {
      readonly name: string;
      readonly chainId: string;
    }
  ) {
    super(sharedContext, skipURL, "/v1/fungible/route");

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.sourceAmount || this.sourceAmount === "0") {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainGetter
          .getChain(this.destChainId)
          .forceFindCurrency(this.destDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainGetter
        .getChain(this.destChainId)
        .forceFindCurrency(this.destDenom),
      this.response.data.amount_out
    );
  }

  @computed
  get swapFee(): CoinPretty[] {
    if (!this.response) {
      return [
        new CoinPretty(
          this.chainGetter
            .getChain(this.destChainId)
            .forceFindCurrency(this.destDenom),
          "0"
        ),
      ];
    }

    const estimatedAffiliateFees: {
      fee: string;
      venueChainId: string;
    }[] = [];
    for (const operation of this.response.data.operations) {
      if ("swap" in operation) {
        estimatedAffiliateFees.push({
          fee: operation.swap.estimated_affiliate_fee,
          // QUESTION: swap_out이 생기면...?
          venueChainId: operation.swap.swap_in.swap_venue.chain_id,
        });
      }
    }

    return estimatedAffiliateFees.map(({ fee, venueChainId }) => {
      const split = fee.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

      if (split.length !== 5) {
        throw new Error(`Invalid fee format: ${fee}`);
      }

      const amount = split[1];
      const denom = split[3];

      return new CoinPretty(
        this.chainGetter.getChain(venueChainId).forceFindCurrency(denom),
        amount
      );
    });
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponse }> {
    const result = await simpleFetch<RouteResponse>(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount_in: this.sourceAmount,
        source_asset_denom: this.sourceDenom,
        source_asset_chain_id: this.sourceChainId,
        dest_asset_denom: this.destDenom,
        dest_asset_chain_id: this.destChainId,
        cumulative_affiliate_fee_bps: this.affiliateFeeBps.toString(),
        swap_venue: {
          name: this.swapVenue.name,
          chain_id: this.swapVenue.chainId,
        },
      }),
      signal: abortController.signal,
    });

    const validated = Schema.validate(result.data);
    if (validated.error) {
      console.log(
        "Failed to validate assets from source response",
        validated.error
      );
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    return `${super.getCacheKey()}-${JSON.stringify({
      amount_in: this.sourceAmount,
      source_asset_denom: this.sourceDenom,
      source_asset_chain_id: this.sourceChainId,
      dest_asset_denom: this.destDenom,
      dest_asset_chain_id: this.destChainId,
      affiliateFeeBps: this.affiliateFeeBps,
      swap_venue: {
        name: this.swapVenue.name,
        chain_id: this.swapVenue.chainId,
      },
    })}`;
  }
}

export class ObservableQueryRoute extends HasMapStore<ObservableQueryRouteInner> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainGetter: ChainGetter,
    protected readonly skipURL: string
  ) {
    super((str) => {
      const parsed = JSON.parse(str);
      return new ObservableQueryRouteInner(
        this.sharedContext,
        this.chainGetter,
        this.skipURL,
        parsed.sourceChainId,
        parsed.sourceAmount,
        parsed.sourceDenom,
        parsed.destChainId,
        parsed.destDenom,
        parsed.affiliateFeeBps,
        parsed.swapVenue
      );
    });
  }

  getRoute(
    sourceChainId: string,
    amount: CoinPretty,
    destChainId: string,
    destDenom: string,
    affiliateFeeBps: number,
    swapVenue: {
      readonly name: string;
      readonly chainId: string;
    }
  ): ObservableQueryRouteInner {
    const str = JSON.stringify({
      sourceChainId,
      sourceAmount: amount.toCoin().amount,
      sourceDenom: amount.currency.coinMinimalDenom,
      destChainId,
      destDenom,
      affiliateFeeBps,
      swapVenue,
    });
    return this.get(str);
  }
}
