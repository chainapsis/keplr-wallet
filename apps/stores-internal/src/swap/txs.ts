import {
  HasMapStore,
  IChainStore,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import {
  SwapChainType,
  SwapProvider,
  SkipOperation,
  SwapTransaction,
  TxRequest,
  TxRequestBase,
  TxResponse,
  CosmosTxData,
  EVMTxData,
} from "./types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { computed, makeObservable } from "mobx";
import Joi from "joi";
import { normalizeChainId, normalizeDenom } from "./utils";

const CosmosTxDataSchema = Joi.object<CosmosTxData>({
  chain_id: Joi.string().required(),
  signer_address: Joi.string().required(),
  msgs: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "cosmos-sdk/MsgTransfer",
            "wasm/MsgExecuteContract",
            "cctp/DepositForBurn",
            "cctp/DepositForBurnWithCaller",
            "cosmos-sdk/MsgSend"
          )
          .required(),
        value: Joi.alternatives()
          .conditional("type", {
            switch: [
              {
                is: "cosmos-sdk/MsgTransfer",
                then: Joi.object({
                  source_port: Joi.string().required(),
                  source_channel: Joi.string().required(),
                  token: Joi.object({
                    denom: Joi.string().required(),
                    amount: Joi.string().required(),
                  })
                    .required()
                    .unknown(true),
                  sender: Joi.string().required(),
                  receiver: Joi.string().required(),
                  timeout_timestamp: Joi.any()
                    .custom((value) =>
                      typeof value === "number" ? value.toString() : value
                    )
                    .required(),
                  memo: Joi.string().optional(),
                }).unknown(true),
              },
              {
                is: "wasm/MsgExecuteContract",
                then: Joi.object({
                  sender: Joi.string().required(),
                  contract: Joi.string().required(),
                  msg: Joi.object().required(),
                  funds: Joi.array()
                    .items(
                      Joi.object({
                        denom: Joi.string().required(),
                        amount: Joi.string().required(),
                      }).unknown(true)
                    )
                    .required(),
                }).unknown(true),
              },
              {
                is: "cctp/DepositForBurn",
                then: Joi.object({
                  from: Joi.string().required(),
                  amount: Joi.string().required(),
                  destination_domain: Joi.number().required(),
                  mint_recipient: Joi.string().required(),
                  burn_token: Joi.string().required(),
                }).unknown(true),
              },
              {
                is: "cctp/DepositForBurnWithCaller",
                then: Joi.object({
                  from: Joi.string().required(),
                  amount: Joi.string().required(),
                  destination_domain: Joi.number().required(),
                  mint_recipient: Joi.string().required(),
                  burn_token: Joi.string().required(),
                  destination_caller: Joi.string().required(),
                }).unknown(true),
              },
              {
                is: "cosmos-sdk/MsgSend",
                then: Joi.object({
                  from_address: Joi.string().required(),
                  to_address: Joi.string().required(),
                  amount: Joi.array()
                    .items(
                      Joi.object({
                        denom: Joi.string().required(),
                        amount: Joi.string().required(),
                      }).unknown(true)
                    )
                    .required(),
                }).unknown(true),
              },
            ],
            otherwise: Joi.object().unknown(true),
          })
          .required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

const EVMTxDataSchema = Joi.object<EVMTxData>({
  chain_id: Joi.string().required(),
  to: Joi.string().required(),
  data: Joi.string().required(),
  value: Joi.string().required(),
  gas_limit: Joi.string().empty("").optional(),
  gas_price: Joi.string().empty("").optional(),
  max_fee_per_gas: Joi.string().empty("").optional(),
  max_priority_fee_per_gas: Joi.string().empty("").optional(),
  approvals: Joi.array()
    .items(
      Joi.object({
        token_contract: Joi.string().required(),
        spender: Joi.string().required(),
        amount: Joi.string().required(),
      }).unknown(true)
    )
    .optional(),
}).unknown(true);

const TxResponseSchema = Joi.object<TxResponse>({
  provider: Joi.string()
    .valid(SwapProvider.SKIP, SwapProvider.SQUID)
    .required(),
  amount_out: Joi.string().required(),
  transactions: Joi.array()
    .items(
      Joi.object({
        chain_type: Joi.string()
          .valid(SwapChainType.COSMOS, SwapChainType.EVM)
          .required(),
        tx_data: Joi.alternatives()
          .conditional("chain_type", {
            is: SwapChainType.COSMOS,
            then: CosmosTxDataSchema,
          })
          .conditional("chain_type", {
            is: SwapChainType.EVM,
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
    public readonly fromAmount: string,
    public readonly toChainId: string,
    public readonly toDenom: string,
    public readonly chainIdsToAddresses: Record<string, string>,
    public readonly slippage: number,
    public readonly provider: SwapProvider,
    // provided only for SKIP provider
    public readonly amountOut?: string,
    public readonly requiredChainIds?: string[],
    public readonly skipOperations?: SkipOperation[]
  ) {
    super(sharedContext, baseURL, "/v2/swap/tx");

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    if (this.provider === SwapProvider.SKIP) {
      return (
        !!this.amountOut && !!this.requiredChainIds && !!this.skipOperations
      );
    }

    return super.canFetch();
  }

  @computed
  get transactions(): SwapTransaction[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.transactions;
  }

  private buildRequest(): TxRequest {
    const normalizedChainIdsToAddresses = Object.fromEntries(
      Object.entries(this.chainIdsToAddresses).map(([chainId, address]) => [
        normalizeChainId(chainId),
        address,
      ])
    );

    const requestBase: TxRequestBase = {
      from_chain: normalizeChainId(this.fromChainId),
      from_token: normalizeDenom(
        this.chainStore,
        this.fromChainId,
        this.fromDenom
      ),
      amount: this.fromAmount,
      to_chain: normalizeChainId(this.toChainId),
      to_token: normalizeDenom(this.chainStore, this.toChainId, this.toDenom),
      chain_ids_to_addresses: normalizedChainIdsToAddresses,
      slippage: this.slippage,
    };

    if (this.provider === SwapProvider.SKIP) {
      // canFetch ensures these are defined
      return {
        ...requestBase,
        provider: SwapProvider.SKIP,
        amount_out: this.amountOut!,
        skip_operations: this.skipOperations!,
        required_chain_ids: this.requiredChainIds!,
      };
    } else {
      return {
        ...requestBase,
        provider: SwapProvider.SQUID,
      };
    }
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: TxResponse }> {
    const request = this.buildRequest();

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
    const request = this.buildRequest();

    if (this.provider === SwapProvider.SKIP && "skip_operations" in request) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { skip_operations: _, ...rest } = request;

      // CHECK: skip_operations를 제거하고 키를 생성해도 괜찮은지
      return `${super.getCacheKey()}-${JSON.stringify(rest)}`;
    }

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
      const parsed = JSON.parse(str);

      return new ObservableQueryTxInnerV2(
        this.sharedContext,
        this.chainStore,
        this.baseURL,
        parsed.fromChainId,
        parsed.fromDenom,
        parsed.fromAmount,
        parsed.toChainId,
        parsed.toDenom,
        parsed.chainIdsToAddresses,
        parsed.slippage,
        parsed.provider,
        parsed.amountOut,
        parsed.requiredChainIds,
        parsed.skipOperations
      );
    });
  }

  getTx(
    fromChainId: string,
    fromDenom: string,
    fromAmount: string,
    toChainId: string,
    toDenom: string,
    chainIdsToAddresses: Record<string, string>,
    slippage: number,
    provider: SwapProvider,
    amountOut?: string,
    requiredChainIds?: string[],
    skipOperations?: SkipOperation[]
  ): ObservableQueryTxInnerV2 {
    let str: string;

    if (provider === SwapProvider.SKIP) {
      if (!amountOut || !requiredChainIds || !skipOperations) {
        throw new Error(
          "SKIP provider requires amountOut, requiredChainIds, and skipOperations"
        );
      }
      str = JSON.stringify({
        fromChainId,
        fromDenom,
        fromAmount,
        toChainId,
        toDenom,
        chainIdsToAddresses,
        slippage,
        provider: SwapProvider.SKIP,
        amountOut,
        requiredChainIds,
        skipOperations,
      });
    } else {
      str = JSON.stringify({
        fromChainId,
        fromDenom,
        fromAmount,
        toChainId,
        toDenom,
        chainIdsToAddresses,
        slippage,
        provider: SwapProvider.SQUID,
      });
    }

    return this.get(str);
  }
}
