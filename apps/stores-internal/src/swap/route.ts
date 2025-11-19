import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  ChainType,
  Provider,
  RouteRequestV2,
  RouteResponseV2,
  RouteStepType,
  RouteTransaction,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import Joi from "joi";
import { normalizeChainId, normalizeDenom } from "./utils";

const Schema = Joi.object<RouteResponseV2>({
  provider: Joi.string().valid(Provider.SKIP, Provider.SQUID).required(),
  amount_out: Joi.string().required(),
  estimated_time: Joi.number().required(),
  fees: Joi.array().items(
    Joi.object({
      usd_amount: Joi.string().required(),
      amount: Joi.string().required(),
      fee_token: Joi.object({
        type: Joi.string().valid(ChainType.COSMOS, ChainType.EVM).required(),
        chain_id: Joi.string().required(),
        denom: Joi.string().required(),
        symbol: Joi.string().required(),
        name: Joi.string().required(),
      }),
    }).unknown(true)
  ),
  steps: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid(
          RouteStepType.SWAP,
          RouteStepType.BRIDGE,
          RouteStepType.IBC_TRANSFER
        )
        .required(),
      from_chain: Joi.string().required(),
      to_chain: Joi.string().required(),
      from_token: Joi.string().required(),
      to_token: Joi.string().required(),
      from_amount: Joi.string().required(),
      to_amount: Joi.string().required(),
    }).unknown(true)
  ),
  transactions: Joi.array().items(
    Joi.alternatives().conditional(Joi.ref(".chain_type"), {
      switch: [
        {
          is: ChainType.COSMOS,
          then: Joi.object({
            chain_type: Joi.string().valid(ChainType.COSMOS).required(),
            tx_data: Joi.object({
              chain_id: Joi.string().required(),
              signer_address: Joi.string().required(),
              msgs: Joi.array()
                .items(
                  Joi.alternatives().conditional(Joi.ref(".type"), {
                    switch: [
                      {
                        is: "cosmos-sdk/MsgTransfer",
                        then: Joi.object({
                          type: Joi.string()
                            .valid("cosmos-sdk/MsgTransfer")
                            .required(),
                          source_port: Joi.string().required(),
                          source_channel: Joi.string().required(),
                          token: Joi.array()
                            .items(
                              Joi.object({
                                denom: Joi.string().required(),
                                amount: Joi.string().required(),
                              })
                            )
                            .required(),
                          sender: Joi.string().required(),
                          receiver: Joi.string().required(),
                          timeout_timestamp: Joi.string().required(),
                          memo: Joi.string().optional(),
                        }).unknown(true),
                      },
                      {
                        is: "wasm/MsgExecuteContract",
                        then: Joi.object({
                          type: Joi.string()
                            .valid("wasm/MsgExecuteContract")
                            .required(),
                          sender: Joi.string().required(),
                          contract: Joi.string().required(),
                          msg: Joi.object().required(),
                          funds: Joi.array()
                            .items(
                              Joi.object({
                                denom: Joi.string().required(),
                                amount: Joi.string().required(),
                              })
                            )
                            .required(),
                        }).unknown(true),
                      },
                      {
                        is: "cctp/DepositForBurn",
                        then: Joi.object({
                          type: Joi.string()
                            .valid("cctp/DepositForBurn")
                            .required(),
                          from: Joi.string().required(),
                          amount: Joi.string().required(),
                          destination_domain: Joi.number().required(),
                          mint_recipient: Joi.string().required(),
                          burn_token: Joi.string().required(),
                        }).unknown(true),
                      },
                    ],
                    otherwise: Joi.object({
                      type: Joi.string().required(),
                    }).unknown(true),
                  })
                )
                .required(),
            })
              .unknown(true)
              .required(),
          }),
        },
        {
          is: ChainType.EVM,
          then: Joi.object({
            chain_type: Joi.string().valid(ChainType.EVM).required(),
            tx_data: Joi.object({
              chain_id: Joi.string().required(),
              to: Joi.string().required(),
              data: Joi.string().required(),
              value: Joi.string().required(),
              gas_limit: Joi.string().optional(),
              gas_price: Joi.string().optional(),
              max_fee_per_gas: Joi.string().optional(),
              max_priority_fee_per_gas: Joi.string().optional(),
              approvals: Joi.array()
                .items(
                  Joi.object({
                    token_contract: Joi.string().required(),
                    spender: Joi.string().required(),
                    amount: Joi.string().required(),
                  })
                )
                .required(),
            })
              .unknown(true)
              .required(),
          }),
        },
      ],
    })
  ),
}).unknown(true);

export class ObservableQueryRouteInnerV2 extends ObservableQuery<RouteResponseV2> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    public readonly fromChainId: string,
    public readonly fromAmount: string,
    public readonly fromDenom: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly chainIdsToAddresses: Record<string, string>,
    public readonly slippage: number
  ) {
    super(sharedContext, baseURL, "/v2/swap/route");
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (!this.fromAmount || this.fromAmount === "0") {
      return false;
    }
    return super.canFetch();
  }

  @computed
  get outAmount(): CoinPretty {
    if (!this.response) {
      return new CoinPretty(
        this.chainStore
          .getChain(this.toChainId)
          .forceFindCurrency(this.toDenom),
        "0"
      );
    }

    return new CoinPretty(
      this.chainStore.getChain(this.toChainId).forceFindCurrency(this.toDenom),
      this.response.data.amount_out
    );
  }

  @computed
  get bridgeFees(): CoinPretty[] {
    if (!this.response) {
      return [];
    }
    if (!this.response.data.fees || this.response.data.fees.length === 0) {
      return [];
    }

    const fees = this.response.data.fees;

    // 동일한 denom의 fee가 있으면 합치기
    // CHECK: usd amount랑 이미지랑 다 주는데 그냥 원본값 반환하기 or 가공해서 반환하기
    const feeMap = new Map<string, CoinPretty>();
    for (const fee of fees) {
      const coinPretty = new CoinPretty(
        this.chainStore.hasChain(fee.fee_token.chain_id)
          ? this.chainStore
              .getChain(fee.fee_token.chain_id)
              .forceFindCurrency(fee.fee_token.denom)
          : this.chainStore
              .getChain(`eip155:${fee.fee_token.chain_id}`)
              .forceFindCurrency(
                (() => {
                  if (fee.fee_token.denom.startsWith("0x")) {
                    return `erc20:${fee.fee_token.denom.toLowerCase()}`;
                  }
                  return fee.fee_token.denom;
                })()
              ),
        fee.amount
      );

      const denom = fee.fee_token.denom;
      if (feeMap.has(denom)) {
        feeMap.get(denom)!.add(coinPretty);
      } else {
        feeMap.set(denom, coinPretty);
      }
    }

    return Array.from(feeMap.values());
  }

  @computed
  get transactions(): RouteTransaction[] {
    if (!this.response) {
      return [];
    }

    if (this.response.data.transactions.length === 0) {
      return [];
    }

    return this.response.data.transactions;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: RouteResponseV2 }> {
    const normalizedChainIdsToAddresses: Record<string, string> = {};
    for (const [chainId, address] of Object.entries(this.chainIdsToAddresses)) {
      normalizedChainIdsToAddresses[normalizeChainId(chainId)] = address;
    }

    const request: RouteRequestV2 = {
      from_chain: normalizeChainId(this.fromChainId),
      from_token: normalizeDenom(
        this.chainStore,
        this.fromChainId,
        this.fromDenom
      ),
      to_chain: normalizeChainId(this.toChainId),
      to_token: normalizeDenom(this.chainStore, this.toChainId, this.toDenom),
      amount: this.fromAmount,
      chain_ids_to_addresses: normalizedChainIdsToAddresses,
      slippage: this.slippage,
    };

    const _result = await simpleFetch<RouteResponseV2>(this.baseURL, this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: abortController.signal,
    });
    const result = {
      headers: _result.headers,
      data: _result.data,
    };

    const validated = Schema.validate(result.data);

    if (validated.error) {
      console.log("Failed to validate route response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    const request: RouteRequestV2 = {
      from_chain: this.fromChainId,
      from_token: this.fromDenom,
      to_chain: this.toChainId,
      to_token: this.toDenom,
      amount: this.fromAmount,
      chain_ids_to_addresses: this.chainIdsToAddresses,
      slippage: this.slippage,
    };
    return `${super.getCacheKey()}-${JSON.stringify(request)}`;
  }
}

export class ObservableQueryRouteV2 extends HasMapStore<ObservableQueryRouteInnerV2> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((str) => {
      const parsed: RouteRequestV2 = JSON.parse(str);

      return new ObservableQueryRouteInnerV2(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        parsed.from_chain,
        parsed.from_token,
        parsed.to_chain,
        parsed.to_token,
        parsed.amount,
        parsed.chain_ids_to_addresses,
        parsed.slippage
      );
    });
  }

  getRoute(
    fromChainId: string,
    fromDenom: string,
    fromAmount: string,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number
  ): ObservableQueryRouteInnerV2 {
    const request: RouteRequestV2 = {
      from_chain: fromChainId,
      from_token: fromDenom,
      to_chain: toChainId,
      to_token: toDenom,
      amount: fromAmount,
      chain_ids_to_addresses: chainIdsToAddresses,
      slippage: slippage,
    };

    const str = JSON.stringify(request);

    return this.get(str);
  }
}
