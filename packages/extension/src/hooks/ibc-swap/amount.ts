import { AmountConfig, ISenderConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  IAccountStoreWithInjects,
  MakeTxResponse,
  WalletStatus,
} from "@keplr-wallet/stores";
// TODO: 이거 import path 문제 해결하기
import { QueriesStore } from "@keplr-wallet/hooks/build/tx/internal";
import { useState } from "react";
import { action, makeObservable, observable } from "mobx";
import { SkipQueries } from "../../stores/skip";
import { ObservableQueryIBCSwapInner } from "../../stores/skip/ibc-swap";

export class IBCSwapAmountConfig extends AmountConfig {
  @observable
  protected _outChainId: string;
  @observable.ref
  protected _outCurrency: AppCurrency;
  @observable
  protected _swapFeeBps: number;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: QueriesStore,
    protected readonly accountStore: IAccountStoreWithInjects<
      [CosmosAccount, CosmwasmAccount]
    >,
    protected readonly skipQueries: SkipQueries,
    initialChainId: string,
    senderConfig: ISenderConfig,
    initialOutChainId: string,
    initialOutCurrency: AppCurrency,
    swapFeeBps: number
  ) {
    super(chainGetter, queriesStore, initialChainId, senderConfig);

    this._outChainId = initialOutChainId;
    this._outCurrency = initialOutCurrency;
    this._swapFeeBps = swapFeeBps;

    makeObservable(this);
  }

  get outAmount(): CoinPretty {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return new CoinPretty(this.outCurrency, "0");
    }
    return queryIBCSwap.getQueryRoute().outAmount;
  }

  get outChainId(): string {
    return this._outChainId;
  }

  get outCurrency(): AppCurrency {
    return this._outCurrency;
  }

  @action
  setOutChainId(chainId: string): void {
    this._outChainId = chainId;
  }

  @action
  setOutCurrency(currency: AppCurrency): void {
    this._outCurrency = currency;
  }

  @action
  setSwapFeeBps(swapFeeBps: number): void {
    this._swapFeeBps = swapFeeBps;
  }

  get swapFeeBps(): number {
    return this._swapFeeBps;
  }

  get swapFee(): CoinPretty[] {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return [new CoinPretty(this.outCurrency, "0")];
    }

    return queryIBCSwap.getQueryRoute().swapFee;
  }

  async fetch(): Promise<void> {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (queryIBCSwap) {
      await queryIBCSwap.getQueryRoute().fetch();
    }
  }

  isFetching(): boolean {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (queryIBCSwap) {
      return queryIBCSwap.getQueryRoute().isFetching;
    }
    return false;
  }

  async getTx(
    slippageTolerancePercent: number,
    affiliateFeeReceiver: string
  ): Promise<MakeTxResponse> {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      throw new Error("Query IBC Swap is not initialized");
    }

    const chainIdsToAddresses: Record<string, string> = {};
    const sourceAccount = this.accountStore.getAccount(this.chainId);
    const swapAccount = this.accountStore.getAccount(
      queryIBCSwap.swapVenue.chainId
    );
    const destinationAccount = this.accountStore.getAccount(this.outChainId);
    if (sourceAccount.walletStatus === WalletStatus.NotInit) {
      await sourceAccount.init();
    }
    if (swapAccount.walletStatus === WalletStatus.NotInit) {
      await swapAccount.init();
    }
    if (destinationAccount.walletStatus === WalletStatus.NotInit) {
      await destinationAccount.init();
    }
    if (!sourceAccount.bech32Address) {
      throw new Error("Source account is not set");
    }
    if (!swapAccount.bech32Address) {
      throw new Error("Swap account is not set");
    }
    if (!destinationAccount.bech32Address) {
      throw new Error("Destination account is not set");
    }

    chainIdsToAddresses[this.chainId] = sourceAccount.bech32Address;
    chainIdsToAddresses[queryIBCSwap.swapVenue.chainId] =
      swapAccount.bech32Address;
    chainIdsToAddresses[this.outChainId] = destinationAccount.bech32Address;

    const queryMsgsDirect = queryIBCSwap.getQueryMsgsDirect(
      chainIdsToAddresses,
      slippageTolerancePercent,
      affiliateFeeReceiver
    );

    await queryMsgsDirect.waitFreshResponse();
    if (queryMsgsDirect.error) {
      throw new Error(queryMsgsDirect.error.message);
    }

    const tx = this.getTxIfReady(
      slippageTolerancePercent,
      affiliateFeeReceiver
    );
    if (!tx) {
      throw new Error("Tx is not ready");
    }

    return tx;
  }

  getTxIfReady(
    slippageTolerancePercent: number,
    affiliateFeeReceiver: string
  ): MakeTxResponse | undefined {
    if (!this.currency) {
      return;
    }

    if (this.amount.length !== 1) {
      return;
    }

    if (this.amount[0].toDec().lte(new Dec(0))) {
      return;
    }

    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return;
    }

    const chainIdsToAddresses: Record<string, string> = {};
    const sourceAccount = this.accountStore.getAccount(this.chainId);
    const swapAccount = this.accountStore.getAccount(
      queryIBCSwap.swapVenue.chainId
    );
    const destinationAccount = this.accountStore.getAccount(this.outChainId);
    if (sourceAccount.walletStatus === WalletStatus.NotInit) {
      sourceAccount.init();
    }
    if (swapAccount.walletStatus === WalletStatus.NotInit) {
      swapAccount.init();
    }
    if (destinationAccount.walletStatus === WalletStatus.NotInit) {
      destinationAccount.init();
    }
    if (!sourceAccount.bech32Address) {
      return;
    }
    if (!swapAccount.bech32Address) {
      return;
    }
    if (!destinationAccount.bech32Address) {
      return;
    }

    chainIdsToAddresses[this.chainId] = sourceAccount.bech32Address;
    chainIdsToAddresses[queryIBCSwap.swapVenue.chainId] =
      swapAccount.bech32Address;
    chainIdsToAddresses[this.outChainId] = destinationAccount.bech32Address;

    const queryMsgsDirect = queryIBCSwap.getQueryMsgsDirect(
      chainIdsToAddresses,
      slippageTolerancePercent,
      affiliateFeeReceiver
    );
    const msg = queryMsgsDirect.msg;
    if (!msg) {
      return;
    }

    if (msg.type === "MsgTransfer") {
      return sourceAccount.cosmos.makeIBCTransferTx(
        {
          portId: msg.sourcePort,
          channelId: msg.sourceChannel,
          counterpartyChainId: queryIBCSwap.swapVenue.chainId,
        },
        this.amount[0].toDec().toString(),
        this.amount[0].currency,
        msg.receiver,
        msg.memo
      );
    } else if (msg.type === "MsgExecuteContract") {
      return sourceAccount.cosmwasm.makeExecuteContractTx(
        // TODO: 흠... 일단 "unknown"을 어케 처리해야하는데... + 로 위에 makeIBCTransferTx에서도 type을 같이 처리해야함...
        "unknown",
        msg.contract,
        msg.msg,
        msg.funds.map((fund) => fund.toCoin())
      );
    }
  }

  protected getQueryIBCSwap(): ObservableQueryIBCSwapInner | undefined {
    if (this.amount.length === 0) {
      return;
    }

    return this.skipQueries.queryIBCSwap.getIBCSwap(
      this.chainId,
      this.amount[0],
      this.outChainId,
      this.outCurrency.coinMinimalDenom,
      this.swapFeeBps
    );
  }
}

export const useIBCSwapAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: QueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  skipQueries: SkipQueries,
  chainId: string,
  senderConfig: ISenderConfig,
  outChainId: string,
  outCurrency: AppCurrency,
  swapFeeBps: number
) => {
  const [txConfig] = useState(
    () =>
      new IBCSwapAmountConfig(
        chainGetter,
        queriesStore,
        accountStore,
        skipQueries,
        chainId,
        senderConfig,
        outChainId,
        outCurrency,
        swapFeeBps
      )
  );
  txConfig.setChain(chainId);
  txConfig.setOutChainId(outChainId);
  txConfig.setOutCurrency(outCurrency);
  txConfig.setSwapFeeBps(swapFeeBps);

  return txConfig;
};
