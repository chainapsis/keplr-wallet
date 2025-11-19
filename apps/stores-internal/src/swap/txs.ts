import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  ChainType,
  Provider,
  SkipOperation,
  SwapTransaction,
  TxRequest,
  TxRequestBase,
  TxResponse,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import { CoinPretty } from "@keplr-wallet/unit";
import Joi from "joi";
import { normalizeChainId, normalizeDenom } from "./utils";

const CosmosTxDataSchema = Joi.object({
  chain_id: Joi.string().required(),
  signer_address: Joi.string().required(),
  msgs: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "cosmos-sdk/MsgTransfer",
            "wasm/MsgExecuteContract",
            "cctp/DepositForBurn"
          )
          .required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

const EVMTxDataSchema = Joi.object({
  chain_id: Joi.string().required(),
  to: Joi.string().required(),
  data: Joi.string().required(),
  value: Joi.string().required(),
  gas_limit: Joi.string(),
  gas_price: Joi.string(),
  max_fee_per_gas: Joi.string(),
  max_priority_fee_per_gas: Joi.string(),
  approvals: Joi.array()
    .items(
      Joi.object({
        token_contract: Joi.string().required(),
        spender: Joi.string().required(),
        amount: Joi.string().required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

const TxResponseSchema = Joi.object<TxResponse>({
  provider: Joi.string().valid(Provider.SKIP, Provider.SQUID).required(),
  txs: Joi.array()
    .items(
      Joi.object({
        chain_type: Joi.string()
          .valid(ChainType.COSMOS, ChainType.EVM)
          .required(),
        tx_data: Joi.alternatives()
          .conditional("chain_type", {
            is: ChainType.COSMOS,
            then: CosmosTxDataSchema,
          })
          .conditional("chain_type", {
            is: ChainType.EVM,
            then: EVMTxDataSchema,
          })
          .required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

export class ObservableQueryTxInnerV2 extends ObservableQuery<TxResponse> {
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    baseURL: string,
    public readonly fromChainId: string,
    public readonly fromDenom: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly fromAmount: string,
    public readonly chainIdsToAddresses: Record<string, string>,
    public readonly slippage: number,
    public readonly provider: Provider,
    // provided only for SKIP provider
    public readonly amountOut?: string,
    public readonly required_chain_ids?: string[],
    public readonly skip_operations?: SkipOperation[]
  ) {
    super(sharedContext, baseURL, "/v2/swap/tx");

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (this.provider === Provider.SKIP) {
      return (
        !!this.amountOut && !!this.required_chain_ids && !!this.skip_operations
      );
    }

    return super.canFetch();
  }

  @computed
  get txs(): SwapTransaction[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.txs;
  }

  private buildRequest(normalize: boolean): TxRequest {
    const requestBase: TxRequestBase = normalize
      ? {
          from_chain: normalizeChainId(this.fromChainId),
          from_token: normalizeDenom(
            this.chainStore,
            this.fromChainId,
            this.fromDenom
          ),
          to_chain: normalizeChainId(this.toChainId),
          to_token: normalizeDenom(
            this.chainStore,
            this.toChainId,
            this.toDenom
          ),
          amount: this.fromAmount,
          chain_ids_to_addresses: this.chainIdsToAddresses,
          slippage: this.slippage,
        }
      : {
          from_chain: this.fromChainId,
          from_token: this.fromDenom,
          to_chain: this.toChainId,
          to_token: this.toDenom,
          amount: this.fromAmount,
          slippage: this.slippage,
          chain_ids_to_addresses: this.chainIdsToAddresses,
        };

    if (this.provider === Provider.SKIP) {
      // canFetch ensures these are defined
      return {
        ...requestBase,
        provider: Provider.SKIP,
        amount_out: this.amountOut as string,
        skip_operations: this.skip_operations as SkipOperation[],
        required_chain_ids: this.required_chain_ids as string[],
      };
    } else {
      return {
        ...requestBase,
        provider: Provider.SQUID,
      };
    }
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: TxResponse }> {
    const request = this.buildRequest(true);

    const _result = await simpleFetch<TxResponse>(this.baseURL, this.url, {
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

    const validated = TxResponseSchema.validate(result.data);

    if (validated.error) {
      console.error("Failed to validate tx response", validated.error);
      throw validated.error;
    }

    return {
      headers: result.headers,
      data: validated.value,
    };
  }

  protected override getCacheKey(): string {
    const request = this.buildRequest(false);
    // CHECK: skip_operations가 포함된 상태에서 stringify해도 괜찮은가? 너무 길어지는 것 아닌가?
    return `${super.getCacheKey()}-${JSON.stringify(request)}`;
  }
}

export class ObservableQueryTxV2 extends HasMapStore<ObservableQueryTxInnerV2> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainStore: IChainStore,
    protected readonly baseURL: string
  ) {
    super((str) => {
      const parsed: TxRequest = JSON.parse(str);

      return new ObservableQueryTxInnerV2(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        parsed.from_chain,
        parsed.from_token,
        parsed.to_chain,
        parsed.to_token,
        parsed.amount,
        parsed.chain_ids_to_addresses,
        parsed.slippage,
        parsed.provider,
        "amount_out" in parsed ? parsed.amount_out : undefined,
        "required_chain_ids" in parsed ? parsed.required_chain_ids : undefined,
        "skip_operations" in parsed ? parsed.skip_operations : undefined
      );
    });
  }

  // Overload for SKIP provider
  getTx(
    fromChainId: string,
    amount: CoinPretty,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number,
    provider: Provider.SKIP,
    amountOut: string,
    required_chain_ids: string[],
    skip_operations: SkipOperation[]
  ): ObservableQueryTxInnerV2;

  // Overload for SQUID provider
  getTx(
    fromChainId: string,
    amount: CoinPretty,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number,
    provider: Provider.SQUID
  ): ObservableQueryTxInnerV2;

  getTx(
    fromChainId: string,
    amount: CoinPretty,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number,
    provider: Provider,
    amountOut?: string,
    required_chain_ids?: string[],
    skip_operations?: SkipOperation[]
  ): ObservableQueryTxInnerV2 {
    // NOTE: not normalized yet, should be normalized before fetching
    let rawRequest: TxRequest;

    if (provider === Provider.SKIP) {
      if (!amountOut || !required_chain_ids || !skip_operations) {
        throw new Error(
          "SKIP provider requires amountOut, required_chain_ids, and skip_operations"
        );
      }
      rawRequest = {
        from_chain: fromChainId,
        from_token: amount.currency.coinMinimalDenom,
        to_chain: toChainId,
        to_token: toDenom,
        chain_ids_to_addresses: chainIdsToAddresses,
        amount: amount.toCoin().amount,
        slippage: slippage,
        provider: Provider.SKIP,
        amount_out: amountOut,
        required_chain_ids: required_chain_ids,
        skip_operations: skip_operations,
      };
    } else {
      rawRequest = {
        from_chain: fromChainId,
        from_token: amount.currency.coinMinimalDenom,
        to_chain: toChainId,
        to_token: toDenom,
        chain_ids_to_addresses: chainIdsToAddresses,
        amount: amount.toCoin().amount,
        slippage: slippage,
        provider: Provider.SQUID,
      };
    }

    const str = JSON.stringify(rawRequest);

    return this.get(str);
  }
}
