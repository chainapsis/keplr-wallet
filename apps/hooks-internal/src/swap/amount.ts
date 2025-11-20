import {
  AmountConfig,
  InsufficientFeeError,
  ISenderConfig,
  UIProperties,
} from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, Int, RatePretty } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  IAccountStoreWithInjects,
  IQueriesStore,
  MakeTxResponse,
  WalletStatus,
} from "@keplr-wallet/stores";
import { useState } from "react";
import { action, computed, makeObservable, observable, override } from "mobx";
import {
  RouteResponseV2,
  RouteStepType,
  SwapQueries,
  SwapChainType,
  ObservableQuerySwapHelperInner,
  normalizeChainId,
  CosmosTxData,
  EVMTxData,
  SwapProvider,
} from "@keplr-wallet/stores-internal";
import {
  EthereumAccountStore,
  UnsignedEVMTransactionWithErc20Approvals,
} from "@keplr-wallet/stores-eth";

export class SwapAmountConfig extends AmountConfig {
  static readonly QueryMsgsDirectRefreshInterval = 10000;
  static readonly DefaultSlippage = 50; // TODO: 슬리피지를 이 클래스 안에서 관리해야할 수 있음

  @observable
  protected _outChainId: string;
  @observable.ref
  protected _outCurrency: AppCurrency;
  @observable
  protected _allowSwaps?: boolean;

  protected _oldValue: string;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    protected readonly accountStore: IAccountStoreWithInjects<
      [CosmosAccount, CosmwasmAccount]
    >,
    public readonly ethereumAccountStore: EthereumAccountStore,
    protected readonly swapQueries: SwapQueries,
    initialChainId: string,
    senderConfig: ISenderConfig,
    initialOutChainId: string,
    initialOutCurrency: AppCurrency,
    disableSubFeeFromFaction: boolean,
    allowSwaps?: boolean
  ) {
    super(
      chainGetter,
      queriesStore,
      initialChainId,
      senderConfig,
      disableSubFeeFromFaction
    );

    this._outChainId = initialOutChainId;
    this._outCurrency = initialOutCurrency;
    this._allowSwaps = allowSwaps;
    this._oldValue = this._value;
    makeObservable(this);

    // CHECK: autorun으로 in, out chain id가 변경되면 계정 초기화 하기 필요?
  }

  @computed
  get maxAmount(): CoinPretty {
    let result = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(this.senderConfig.sender)
      .getBalanceFromCurrency(this.currency);
    if (this.feeConfig && !this.disableSubFeeFromFaction) {
      for (const fee of this.feeConfig.fees) {
        result = result.sub(fee);
      }
    }
    if (result.toDec().lte(new Dec(0))) {
      return new CoinPretty(this.currency, "0");
    }

    return result;
  }

  @override
  override get value(): string {
    if (this.fraction > 0) {
      let result = this.maxAmount;

      const queryRoute = this.getQuerySwapHelper(result)?.getRoute(
        SwapAmountConfig.DefaultSlippage
      );
      if (queryRoute?.response != null) {
        const bridgeFee = queryRoute.bridgeFees.reduce(
          (acc: CoinPretty, fee: CoinPretty) => {
            if (
              fee.currency.coinMinimalDenom === this.currency.coinMinimalDenom
            ) {
              return acc.add(fee);
            }
            return acc;
          },
          new CoinPretty(this.currency, new Dec(0))
        );
        if (bridgeFee.toDec().gt(new Dec(0))) {
          result = result.sub(bridgeFee);
        }
      } else {
        return this._oldValue;
      }

      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      const newValue = result
        .mul(new Dec(this.fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
      this._oldValue = newValue;

      return newValue;
    }

    this._oldValue = this._value;

    return this._value;
  }

  get outAmount(): CoinPretty {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return new CoinPretty(this.outCurrency, "0");
    }

    return querySwapHelper.getRoute(SwapAmountConfig.DefaultSlippage).outAmount;
  }

  get outChainId(): string {
    return this._outChainId;
  }

  get outCurrency(): AppCurrency {
    return this._outCurrency;
  }

  get allowSwaps(): boolean | undefined {
    return this._allowSwaps;
  }

  get swapPriceImpact(): RatePretty | undefined {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return undefined;
    }

    return querySwapHelper.getRoute(SwapAmountConfig.DefaultSlippage)
      .swapPriceImpact;
  }

  get provider(): SwapProvider | undefined {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return undefined;
    }

    return querySwapHelper.getRoute(SwapAmountConfig.DefaultSlippage).provider;
  }

  @action
  setOutChainId(chainId: string): void {
    this._outChainId = chainId;
  }

  @action
  setOutCurrency(currency: AppCurrency): void {
    this._outCurrency = currency;
  }

  get otherFees(): CoinPretty[] {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return [new CoinPretty(this.outCurrency, "0")];
    }

    return querySwapHelper.getRoute(SwapAmountConfig.DefaultSlippage)
      .bridgeFees;
  }

  async fetch(): Promise<void> {
    const querySwapHelper = this.getQuerySwapHelper();
    if (querySwapHelper) {
      await querySwapHelper.getRoute(SwapAmountConfig.DefaultSlippage).fetch();
    }
  }

  get isFetchingInAmount(): boolean {
    if (this.fraction === 1) {
      return (
        this.getQuerySwapHelper(this.maxAmount)?.getRoute(
          SwapAmountConfig.DefaultSlippage
        ).isFetching ??
        this.getQuerySwapHelper()?.getRoute(SwapAmountConfig.DefaultSlippage)
          .isFetching ??
        false
      );
    }

    return false;
  }

  get isFetchingOutAmount(): boolean {
    return (
      this.getQuerySwapHelper()?.getRoute(SwapAmountConfig.DefaultSlippage)
        .isFetching ?? false
    );
  }

  get type(): "swap" | "transfer" | "not-ready" {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return "not-ready";
    }

    const res = querySwapHelper.getRoute(
      SwapAmountConfig.DefaultSlippage
    ).response;
    if (!res) {
      return "not-ready";
    }

    const containsSwap = res.data.steps.some(
      (step) => step.type === RouteStepType.SWAP
    );

    if (!containsSwap) {
      return "transfer";
    }

    return "swap";
  }

  async getTx(
    slippageTolerancePercent: number,
    priorOutAmount?: Int,
    customRecipient?: {
      chainId: string;
      recipient: string;
    }
  ): Promise<MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals> {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      throw new Error("Query Swap Helper is not initialized");
    }

    const fromAddress = await this.getAddressAsync(this.chainId);
    const toAddress = await this.getAddressAsync(this.outChainId);
    if (!fromAddress || !toAddress) {
      throw new Error("Address is not set");
    }

    const routeQuery = querySwapHelper.getRoute(slippageTolerancePercent);

    await routeQuery.waitResponse();

    const routeResponse = routeQuery.response;
    if (!routeResponse) {
      throw new Error("Failed to fetch route");
    }

    if (routeResponse.timestamp) {
      const diff = Date.now() - routeResponse.timestamp;
      // 오래전에 캐싱된 쿼리 응답으로 tx를 만들 경우 quote가 크게 변경될 수 있으므로 에러를 발생시킨다.
      // 쿼리 응답 오는데에 시간이 좀 드니, RefreshInterval에 5초를 더 추가한다.
      if (diff > SwapAmountConfig.QueryMsgsDirectRefreshInterval + 5000) {
        throw new Error("The quote is expired. Please try again.");
      }
    }

    const requiredChainIds = routeResponse.data.required_chain_ids;

    const chainIdsToAddresses: Record<string, string> = {};

    for (const chainId of requiredChainIds) {
      const address = await this.getAddressAsync(chainId);
      if (!address) {
        throw new Error("Address is not set");
      }

      chainIdsToAddresses[normalizeChainId(chainId)] = address;
    }

    if (customRecipient) {
      chainIdsToAddresses[normalizeChainId(customRecipient.chainId)] =
        customRecipient.recipient;
    }

    const txsQuery = querySwapHelper.getTx(
      chainIdsToAddresses,
      slippageTolerancePercent,
      routeResponse.data.provider,
      routeResponse.data.amount_out,
      routeResponse.data.required_chain_ids,
      "skip_operations" in routeResponse.data
        ? routeResponse.data.skip_operations
        : undefined
    );
    await txsQuery.waitResponse();

    const txsResponse = txsQuery.response;
    if (!txsResponse) {
      throw new Error("Failed to fetch txs");
    }

    if (txsQuery.error) {
      throw new Error(txsQuery.error.message);
    }

    // TODO: multiple txs support
    const tx = this.getTxIfReady(slippageTolerancePercent, customRecipient);
    if (!tx) {
      throw new Error("Tx is not ready");
    }

    if (priorOutAmount) {
      const currentAmountOut = new Int(routeResponse.data.amount_out);

      if (
        currentAmountOut.lt(priorOutAmount) &&
        currentAmountOut
          .sub(priorOutAmount)
          .abs()
          .toDec()
          .quo(priorOutAmount.toDec())
          .gte(new Dec(0.01)) // 1% 이상 변동
      ) {
        throw new Error(
          "Price change has been detected while building your transaction. Please try again"
        );
      }
    }

    return tx;
  }

  /**
   * Synchronously returns a transaction if all required data is currently available,
   * without waiting for any pending queries to complete.
   *
   * @param slippageTolerancePercent - The maximum slippage tolerance percentage
   * @param customRecipient - Optional custom recipient override for the destination chain
   * @returns The constructed transaction if ready, or `undefined` if data is not yet available
   */
  getTxIfReady(
    slippageTolerancePercent: number,
    customRecipient?: {
      chainId: string;
      recipient: string;
    }
  ): MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals | undefined {
    if (!this.currency) {
      return;
    }

    if (this.amount.length !== 1) {
      return;
    }

    if (this.amount[0].toDec().lte(new Dec(0))) {
      return;
    }

    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return;
    }

    const routeQuery = querySwapHelper.getRoute(slippageTolerancePercent);

    const routeResponse = routeQuery.response;
    if (!routeResponse) {
      return;
    }

    const requiredChainIds = routeResponse.data.required_chain_ids;

    const chainIdsToAddresses: Record<string, string> = {};

    for (const chainId of requiredChainIds) {
      const address = this.getAddressSync(chainId);
      if (!address) {
        return;
      }

      chainIdsToAddresses[normalizeChainId(chainId)] = address;
    }

    if (customRecipient) {
      chainIdsToAddresses[normalizeChainId(customRecipient.chainId)] =
        customRecipient.recipient;
    }

    const txsQuery = querySwapHelper.getTx(
      chainIdsToAddresses,
      slippageTolerancePercent,
      routeResponse.data.provider,
      routeResponse.data.amount_out,
      routeResponse.data.required_chain_ids,
      "skip_operations" in routeResponse.data
        ? routeResponse.data.skip_operations
        : undefined
    );

    const transactions = txsQuery.txs;
    if (transactions.length === 0) {
      return;
    }

    // TODO: multiple txs support
    if (transactions.length > 1) {
      return;
    }

    const firstTx = transactions[0];

    try {
      if (firstTx.chain_type === SwapChainType.COSMOS) {
        return this.buildCosmosTx(firstTx.tx_data);
      } else {
        return this.buildEVMTx(firstTx.tx_data);
      }
    } catch (error) {
      console.error(error);
      return;
    }
  }

  private getAddressSync(chainId: string): string | undefined {
    const evmLikeChainId = Number(normalizeChainId(chainId));
    const isEVMChainId = !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;

    const formattedChainId = isEVMChainId ? `eip155:${chainId}` : chainId;

    const account = this.accountStore.getAccount(formattedChainId);
    if (account.walletStatus === WalletStatus.NotInit) {
      account.init();
    }

    const isChainEVMOnly = formattedChainId.startsWith("eip155:");
    if (isChainEVMOnly ? !account.ethereumHexAddress : !account.bech32Address) {
      return;
    }

    return isChainEVMOnly ? account.ethereumHexAddress : account.bech32Address;
  }

  private async getAddressAsync(chainId: string): Promise<string | undefined> {
    const evmLikeChainId = Number(normalizeChainId(chainId));
    const isEVMChainId = !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;

    const formattedChainId = isEVMChainId ? `eip155:${chainId}` : chainId;

    const account = this.accountStore.getAccount(formattedChainId);
    if (account.walletStatus === WalletStatus.NotInit) {
      await account.init();
    }

    const isChainEVMOnly = formattedChainId.startsWith("eip155:");
    if (isChainEVMOnly ? !account.ethereumHexAddress : !account.bech32Address) {
      return;
    }

    return isChainEVMOnly ? account.ethereumHexAddress : account.bech32Address;
  }

  private buildCosmosTx(txData: CosmosTxData): MakeTxResponse {
    const sourceAccount = this.accountStore.getAccount(this.chainId);

    if (txData.msgs.length === 0) {
      throw new Error("No messages in transaction");
    }

    const msg = txData.msgs[0];

    switch (msg.type) {
      case "cosmos-sdk/MsgTransfer": {
        const tx = sourceAccount.cosmos.makeIBCTransferTx(
          {
            portId: msg.value.source_port,
            channelId: msg.value.source_channel,
            counterpartyChainId: "",
          },
          this.amount[0].toDec().toString(),
          this.amount[0].currency,
          msg.value.receiver,
          msg.value.memo,
          {
            // pretend that the counterparty chain info is already validated on the server
            skipCounterpartyChainInfoValidation: true,
          }
        );
        tx.ui.overrideType("ibc-swap");
        return tx;
      }
      case "wasm/MsgExecuteContract": {
        const tx = sourceAccount.cosmwasm.makeExecuteContractTx(
          "unknown",
          msg.value.contract,
          msg.value.msg,
          msg.value.funds
        );
        tx.ui.overrideType("ibc-swap");
        return tx;
      }
      case "cctp/DepositForBurn": {
        return sourceAccount.cosmos.makeCCTPDepositForBurnTx(
          msg.value.from,
          msg.value.amount,
          msg.value.destination_domain,
          msg.value.mint_recipient,
          msg.value.burn_token
        );
      }
      case "cctp/DepositForBurnWithCaller": {
        // DepositForBurnWithCaller and MsgSend should be together on skip
        // as squid don't charge cctp fee, this message won't appear frequently...
        if (txData.msgs.length !== 2) {
          throw new Error(
            "Invalid number of messages for DepositForBurnWithCaller"
          );
        }

        const sendMsg = txData.msgs[1];
        if (sendMsg.type !== "cosmos-sdk/MsgSend") {
          throw new Error(
            "Second message should be MsgSend for DepositForBurnWithCaller"
          );
        }

        const cctpMsgValue = {
          from: msg.value.from,
          amount: msg.value.amount,
          destination_domain: msg.value.destination_domain,
          mint_recipient: msg.value.mint_recipient,
          burn_token: msg.value.burn_token,
          destination_caller: msg.value.destination_caller,
        };

        const sendMsgValue = {
          from_address: sendMsg.value.from_address,
          to_address: sendMsg.value.to_address,
          amount: sendMsg.value.amount,
        };

        return sourceAccount.cosmos.makeCCTPDepositForBurnWithCallerTx(
          JSON.stringify(cctpMsgValue),
          JSON.stringify(sendMsgValue)
        );
      }
      default:
        throw new Error("Unsupported message type");
    }
  }

  private buildEVMTx(
    txData: EVMTxData
  ): UnsignedEVMTransactionWithErc20Approvals {
    const ethereumAccount = this.ethereumAccountStore.getAccount(this.chainId);
    const tx = ethereumAccount.makeTx(txData.to, txData.value, txData.data);

    return {
      ...tx,
      requiredErc20Approvals: txData.approvals?.map((approval) => ({
        amount: approval.amount,
        spender: approval.spender,
        tokenAddress: approval.token_contract,
      })),
    };
  }

  // CHECK: 브릿지만 사용한다는 플래그가 요청 필드에 필요할 수 있다.
  private isUseSwapInBridge(routeResponse: RouteResponseV2 | undefined) {
    const isForcedDisableSwap = this.allowSwaps === false;
    if (!isForcedDisableSwap || !routeResponse) {
      return false;
    }

    const steps = routeResponse.steps;
    const isContainsSwap = steps.some(
      (step) => step.type === RouteStepType.SWAP
    );

    return isContainsSwap;
  }

  @override
  override get uiProperties(): UIProperties {
    const prev = super.uiProperties;
    // max amount인 경우엔 route를 두 번 쿼리하기 때문에 첫 번째 쿼리도 체크한다.
    if (this.fraction === 1) {
      const querySwapHelper = this.getQuerySwapHelper(this.maxAmount);
      if (!querySwapHelper) {
        return {
          ...prev,
          error: new Error("Query IBC Swap is not initialized"),
        };
      }

      const routeQuery = querySwapHelper.getRoute(
        SwapAmountConfig.DefaultSlippage
      );
      if (routeQuery.isFetching) {
        return {
          ...prev,
          loadingState: "loading-block",
        };
      }

      // TODO: 현재 에러 메시지를 프로바이더에서 발생한 오류를 그대로 던져주는지 체크 필요
      const routeError = routeQuery.error;
      if (routeError) {
        const CCTP_BRIDGE_FEE_ERROR_MESSAGE =
          "Input amount is too low to cover CCTP bridge relay fee";

        //NOTE For expected error messages, convert the message to be more user-friendly
        if (routeError.message.includes(CCTP_BRIDGE_FEE_ERROR_MESSAGE)) {
          return {
            ...prev,
            error: new Error("Input amount too low to cover the bridge fees."),
          };
        }

        return {
          ...prev,
          error: new Error(routeError.message),
        };
      }

      //NOTE - 만약 swap을 의도적으로 다 disable 시켰는데
      //route로 부터 swap을 사용하는 경우가 있으면 에러를 발생시킨다.
      const routeResponse = routeQuery.response;
      if (routeResponse) {
        if (this.isUseSwapInBridge(routeResponse.data)) {
          return {
            ...prev,
            error: new Error("Swap in bridge is not allowed"),
          };
        }

        const bridgeFee = routeQuery.bridgeFees.reduce(
          (acc: CoinPretty, fee: CoinPretty) => {
            if (
              fee.currency.coinMinimalDenom === this.currency.coinMinimalDenom
            ) {
              return acc.add(fee);
            }
            return acc;
          },
          new CoinPretty(this.currency, new Dec(0))
        );

        if (bridgeFee.toDec().gte(this.maxAmount.toDec())) {
          return {
            ...prev,
            error: new Error(
              "Your balance is too low to cover the bridge fees."
            ),
          };
        }
      }
    }

    if (prev.error || prev.loadingState) {
      return prev;
    }

    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return {
        ...prev,
        error: new Error("Query IBC Swap is not initialized"),
      };
    }

    const routeQuery = querySwapHelper.getRoute(
      SwapAmountConfig.DefaultSlippage
    );
    if (routeQuery.isFetching) {
      return {
        ...prev,
        loadingState: "loading-block",
      };
    }

    // TODO: 현재 에러 메시지를 프로바이더에서 발생한 오류를 그대로 던져주는지 체크 필요
    const routeError = routeQuery.error;
    if (routeError) {
      const CCTP_BRIDGE_FEE_ERROR_MESSAGE =
        "Input amount is too low to cover CCTP bridge relay fee";

      //NOTE For expected error messages, convert the message to be more user-friendly
      if (routeError.message.includes(CCTP_BRIDGE_FEE_ERROR_MESSAGE)) {
        return {
          ...prev,
          error: new Error("Input amount too low to cover the bridge fees."),
        };
      }

      return {
        ...prev,
        error: new Error(routeError.message),
      };
    }

    //NOTE - 만약 swap을 의도적으로 다 disable 시켰는데
    //route로 부터 swap을 사용하는 경우가 있으면 에러를 발생시킨다.
    const routeResponse = routeQuery.response;
    if (routeResponse) {
      if (this.isUseSwapInBridge(routeResponse.data)) {
        return {
          ...prev,
          error: new Error("Swap in bridge is not allowed"),
        };
      }

      const bridgeFees = routeQuery.bridgeFees;

      const bridgeFee = bridgeFees.reduce(
        (acc: CoinPretty, fee: CoinPretty) => {
          if (
            fee.currency.coinMinimalDenom === this.currency.coinMinimalDenom
          ) {
            return acc.add(fee);
          }
          return acc;
        },
        new CoinPretty(this.currency, new Dec(0))
      );
      if (bridgeFee.toDec().gte(this.maxAmount.toDec())) {
        return {
          ...prev,
          error: new Error("Your balance is too low to cover the bridge fees."),
        };
      }
    }

    if (
      this.amount.length > 0 &&
      this.amount[0].currency.coinMinimalDenom ===
        this.outAmount.currency.coinMinimalDenom &&
      this.chainGetter.getChain(this.chainId).chainIdentifier ===
        this.chainGetter.getChain(this.outChainId).chainIdentifier
    ) {
      return {
        ...prev,
        error: new Error("In and out currency is same"),
      };
    }

    if (this.amount.length > 0) {
      if (
        !this.swapQueries.querySwapHelper.isSwappableCurrency(
          this.chainId,
          this.amount[0].currency
        )
      ) {
        return {
          ...prev,
          error: new Error(
            "The currency you are swapping from is currently not supported"
          ),
        };
      }
    }

    if (
      this.amount.length > 0 &&
      !this.swapQueries.querySwapHelper.isSwapDestinationOrAlternatives(
        this.chainId,
        this.amount[0].currency.coinMinimalDenom,
        this.outChainId,
        this.outCurrency.coinMinimalDenom
      )
    ) {
      return {
        ...prev,
        error: new Error(
          "The currency you are swapping to is currently not supported"
        ),
      };
    }

    if (this.feeConfig) {
      const feeUIProperties = this.feeConfig.uiProperties;
      if (
        !feeUIProperties.error ||
        !(feeUIProperties.error instanceof InsufficientFeeError)
      ) {
        const amount = this.amount;
        const fees = this.feeConfig.fees;

        const needs = this.otherFees.slice();
        for (let i = 0; i < needs.length; i++) {
          const need = needs[i];
          for (const amt of amount) {
            if (
              need.currency.coinMinimalDenom === amt.currency.coinMinimalDenom
            ) {
              needs[i] = needs[i].add(amt);
            }
          }
          for (const fee of fees) {
            if (
              need.currency.coinMinimalDenom === fee.currency.coinMinimalDenom
            ) {
              needs[i] = needs[i].add(fee);
            }
          }
        }

        for (let i = 0; i < needs.length; i++) {
          const need = needs[i];

          if (need.toDec().lte(new Dec(0))) {
            continue;
          }

          const bal = this.queriesStore
            .get(this.chainId)
            .queryBalances.getQueryBech32Address(this.senderConfig.value)
            .balances.find(
              (bal) =>
                bal.currency.coinMinimalDenom === need.currency.coinMinimalDenom
            );

          if (bal && !bal.response) {
            return {
              loadingState: "loading",
            };
          }

          if (bal && bal.balance.toDec().lt(need.toDec())) {
            return {
              error: new InsufficientFeeError("Insufficient fee"),
              loadingState: bal.isFetching ? "loading" : undefined,
            };
          }
        }
      }
    }

    return {
      ...prev,
    };
  }

  getQuerySwapHelper(
    amount?: CoinPretty
  ): ObservableQuerySwapHelperInner | undefined {
    if (!amount && this.amount.length === 0) {
      return;
    }

    const amountIn = amount ?? this.amount[0];
    const fromAddress = this.getAddressSync(this.chainId);
    const toAddress = this.getAddressSync(this.outChainId);
    if (!fromAddress || !toAddress) {
      return;
    }

    return this.swapQueries.querySwapHelper.getSwapHelper(
      this.chainId,
      amountIn.currency.coinMinimalDenom,
      amountIn.toCoin().amount,
      this.outChainId,
      this.outCurrency.coinMinimalDenom,
      fromAddress,
      toAddress
    );
  }
}

export const useSwapAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  ethereumAccountStore: EthereumAccountStore,
  swapQueries: SwapQueries,
  chainId: string,
  senderConfig: ISenderConfig,
  outChainId: string,
  outCurrency: AppCurrency,
  disableSubFeeFromFaction: boolean,
  allowSwaps?: boolean
) => {
  const [txConfig] = useState(
    () =>
      new SwapAmountConfig(
        chainGetter,
        queriesStore,
        accountStore,
        ethereumAccountStore,
        swapQueries,
        chainId,
        senderConfig,
        outChainId,
        outCurrency,
        disableSubFeeFromFaction,
        allowSwaps
      )
  );
  txConfig.setChain(chainId);
  txConfig.setOutChainId(outChainId);
  txConfig.setOutCurrency(outCurrency);
  txConfig.setDisableSubFeeFromFaction(disableSubFeeFromFaction);

  return txConfig;
};
