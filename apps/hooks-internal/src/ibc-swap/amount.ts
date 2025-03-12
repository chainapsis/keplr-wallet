import { AmountConfig, ISenderConfig, UIProperties } from "@keplr-wallet/hooks";
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
import { action, makeObservable, observable, override } from "mobx";
import {
  MsgsDirectResponse,
  RouteResponse,
  SkipQueries,
  ObservableQueryIBCSwapInner,
} from "@keplr-wallet/stores-internal";
import {
  EthereumAccountStore,
  UnsignedEVMTransactionWithErc20Approvals,
} from "@keplr-wallet/stores-eth";

export class IBCSwapAmountConfig extends AmountConfig {
  @observable
  protected _outChainId: string;
  @observable.ref
  protected _outCurrency: AppCurrency;
  @observable
  protected _swapFeeBps: number;
  @observable
  protected _allowSwaps?: boolean;
  @observable
  protected _smartSwapOptions?: {
    evmSwaps?: boolean;
    splitRoutes?: boolean;
  };

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    protected readonly accountStore: IAccountStoreWithInjects<
      [CosmosAccount, CosmwasmAccount]
    >,
    public readonly ethereumAccountStore: EthereumAccountStore,
    protected readonly skipQueries: SkipQueries,
    initialChainId: string,
    senderConfig: ISenderConfig,
    initialOutChainId: string,
    initialOutCurrency: AppCurrency,
    swapFeeBps: number,
    allowSwaps?: boolean,
    smartSwapOptions?: {
      evmSwaps?: boolean;
      splitRoutes?: boolean;
    }
  ) {
    super(chainGetter, queriesStore, initialChainId, senderConfig);

    this._outChainId = initialOutChainId;
    this._outCurrency = initialOutCurrency;
    this._swapFeeBps = swapFeeBps;
    this._allowSwaps = allowSwaps;
    this._smartSwapOptions = smartSwapOptions;
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

  get allowSwaps(): boolean | undefined {
    return this._allowSwaps;
  }

  get smartSwapOptions():
    | {
        evmSwaps?: boolean;
        splitRoutes?: boolean;
      }
    | undefined {
    return this._smartSwapOptions;
  }

  get swapPriceImpact(): RatePretty | undefined {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return undefined;
    }
    return queryIBCSwap.getQueryRoute().swapPriceImpact;
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

  get otherFees(): CoinPretty[] {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return [new CoinPretty(this.outCurrency, "0")];
    }

    return queryIBCSwap.getQueryRoute().otherFees;
  }

  async fetch(): Promise<void> {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (queryIBCSwap) {
      await queryIBCSwap.getQueryRoute().fetch();
    }
  }

  get isFetching(): boolean {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (queryIBCSwap) {
      return queryIBCSwap.getQueryRoute().isFetching;
    }
    return false;
  }

  get type(): "swap" | "transfer" | "not-ready" {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return "not-ready";
    }

    const res = queryIBCSwap.getQueryRoute().response;
    if (!res) {
      return "not-ready";
    }

    if (res.data.does_swap === false) {
      return "transfer";
    }

    return "swap";
  }

  async getTx(
    slippageTolerancePercent: number,
    affiliateFeeReceiver: string | undefined,
    priorOutAmount?: Int,
    customRecipient?: {
      chainId: string;
      recipient: string;
    }
  ): Promise<MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals> {
    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      throw new Error("Query IBC Swap is not initialized");
    }

    await queryIBCSwap.getQueryRoute().waitFreshResponse();
    const queryRouteResponse = queryIBCSwap.getQueryRoute().response;
    if (!queryRouteResponse) {
      throw new Error("Failed to fetch route");
    }

    const chainIdsToAddresses: Record<string, string> = {};

    const sourceAccount = this.accountStore.getAccount(this.chainId);
    if (sourceAccount.walletStatus === WalletStatus.NotInit) {
      await sourceAccount.init();
    }

    const isSourceAccountEVMOnly = this.chainId.startsWith("eip155:");
    if (
      isSourceAccountEVMOnly
        ? !sourceAccount.ethereumHexAddress
        : !sourceAccount.bech32Address
    ) {
      throw new Error("Source account is not set");
    }
    chainIdsToAddresses[this.chainId.replace("eip155:", "")] =
      isSourceAccountEVMOnly
        ? sourceAccount.ethereumHexAddress
        : sourceAccount.bech32Address;

    const destinationChainIds = queryRouteResponse.data.chain_ids.map(
      (chainId) => {
        const evmLikeChainId = Number(chainId);
        const isEVMChainId =
          !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
        if (isEVMChainId) {
          return `eip155:${chainId}`;
        }
        return chainId;
      }
    );
    for (const destinationChainId of destinationChainIds) {
      const destinationAccount =
        this.accountStore.getAccount(destinationChainId);
      if (destinationAccount.walletStatus === WalletStatus.NotInit) {
        await destinationAccount.init();
      }

      const isDestinationChainEVMOnly =
        destinationChainId.startsWith("eip155:");
      if (
        isDestinationChainEVMOnly
          ? !destinationAccount.ethereumHexAddress
          : !destinationAccount.bech32Address
      ) {
        throw new Error("Destination account is not set");
      }
      chainIdsToAddresses[destinationChainId.replace("eip155:", "")] =
        isDestinationChainEVMOnly
          ? destinationAccount.ethereumHexAddress
          : destinationAccount.bech32Address;
    }

    if (customRecipient) {
      chainIdsToAddresses[customRecipient.chainId.replace("eip155:", "")] =
        customRecipient.recipient;
    }

    for (const swapVenue of queryRouteResponse.data.swap_venues ?? [
      queryRouteResponse.data.swap_venue,
    ]) {
      if (swapVenue) {
        const swapVenueChainId = (() => {
          const evmLikeChainId = Number(swapVenue.chain_id);
          const isEVMChainId =
            !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
          if (isEVMChainId) {
            return `eip155:${swapVenue.chain_id}`;
          }

          return swapVenue.chain_id;
        })();
        const swapAccount = this.accountStore.getAccount(swapVenueChainId);
        if (swapAccount.walletStatus === WalletStatus.NotInit) {
          await swapAccount.init();
        }

        const isSwapVenueChainEVMOnly = swapVenueChainId.startsWith("eip155:");
        if (
          isSwapVenueChainEVMOnly
            ? !swapAccount.ethereumHexAddress
            : !swapAccount.bech32Address
        ) {
          const swapVenueChainInfo =
            this.chainGetter.hasChain(swapVenueChainId) &&
            this.chainGetter.getChain(swapVenueChainId);
          if (
            swapAccount.isNanoLedger &&
            swapVenueChainInfo &&
            (swapVenueChainInfo.bip44.coinType === 60 ||
              swapVenueChainInfo.features.includes("eth-address-gen") ||
              swapVenueChainInfo.features.includes("eth-key-sign") ||
              swapVenueChainInfo.evm != null)
          ) {
            throw new Error(
              "Please connect Ethereum app on Ledger with Keplr to get the address"
            );
          }

          throw new Error("Swap account is not set");
        }
        chainIdsToAddresses[swapVenueChainId.replace("eip155:", "")] =
          isSwapVenueChainEVMOnly
            ? swapAccount.ethereumHexAddress
            : swapAccount.bech32Address;
      }
    }

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
      affiliateFeeReceiver,
      customRecipient
    );
    if (!tx) {
      throw new Error("Tx is not ready");
    }

    if (priorOutAmount) {
      const queryMsgsDirect = queryIBCSwap.getQueryMsgsDirect(
        chainIdsToAddresses,
        slippageTolerancePercent,
        affiliateFeeReceiver
      );
      if (!queryMsgsDirect.response) {
        throw new Error("Can't happen: queryMsgsDirect is not ready");
      }

      const currentAmountOut = new Int(
        queryMsgsDirect.response.data.route.amount_out
      );

      if (
        currentAmountOut.lt(priorOutAmount) &&
        currentAmountOut
          .sub(priorOutAmount)
          .abs()
          .toDec()
          .quo(priorOutAmount.toDec())
          .gte(new Dec(0.01))
      ) {
        throw new Error(
          "Price change has been detected while building your transaction. Please try again"
        );
      }
    }

    return tx;
  }

  getTxIfReady(
    slippageTolerancePercent: number,
    affiliateFeeReceiver?: string,
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

    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return;
    }

    const queryRouteResponse = queryIBCSwap.getQueryRoute().response;
    if (!queryRouteResponse) {
      return;
    }

    const chainIdsToAddresses: Record<string, string> = {};

    const sourceAccount = this.accountStore.getAccount(this.chainId);
    if (sourceAccount.walletStatus === WalletStatus.NotInit) {
      sourceAccount.init();
    }

    const isSourceAccountEVMOnly = this.chainId.startsWith("eip155:");
    if (
      isSourceAccountEVMOnly
        ? !sourceAccount.ethereumHexAddress
        : !sourceAccount.bech32Address
    ) {
      return;
    }
    chainIdsToAddresses[this.chainId.replace("eip155:", "")] =
      isSourceAccountEVMOnly
        ? sourceAccount.ethereumHexAddress
        : sourceAccount.bech32Address;

    const destinationChainIds = queryRouteResponse.data.chain_ids.map(
      (chainId) => {
        const evmLikeChainId = Number(chainId);
        const isEVMChainId =
          !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
        if (isEVMChainId) {
          return `eip155:${chainId}`;
        }
        return chainId;
      }
    );
    for (const destinationChainId of destinationChainIds) {
      const destinationAccount =
        this.accountStore.getAccount(destinationChainId);

      if (destinationAccount.walletStatus === WalletStatus.NotInit) {
        destinationAccount.init();
      }

      const isDestinationChainEVMOnly =
        destinationChainId.startsWith("eip155:");
      if (
        isDestinationChainEVMOnly
          ? !destinationAccount.ethereumHexAddress
          : !destinationAccount.bech32Address
      ) {
        return;
      }
      chainIdsToAddresses[destinationChainId.replace("eip155:", "")] =
        isDestinationChainEVMOnly
          ? destinationAccount.ethereumHexAddress
          : destinationAccount.bech32Address;
    }

    if (customRecipient) {
      chainIdsToAddresses[customRecipient.chainId.replace("eip155:", "")] =
        customRecipient.recipient;
    }

    for (const swapVenue of queryRouteResponse.data.swap_venues ?? [
      queryRouteResponse.data.swap_venue,
    ]) {
      if (swapVenue) {
        const swapVenueChainId = (() => {
          const evmLikeChainId = Number(swapVenue.chain_id);
          const isEVMChainId =
            !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
          if (isEVMChainId) {
            return `eip155:${swapVenue.chain_id}`;
          }

          return swapVenue.chain_id;
        })();
        const swapAccount = this.accountStore.getAccount(swapVenueChainId);
        if (swapAccount.walletStatus === WalletStatus.NotInit) {
          swapAccount.init();
        }

        const isSwapVenueChainEVMOnly = swapVenueChainId.startsWith("eip155:");
        if (
          isSwapVenueChainEVMOnly
            ? !swapAccount.ethereumHexAddress
            : !swapAccount.bech32Address
        ) {
          return;
        }
        chainIdsToAddresses[swapVenueChainId.replace("eip155:", "")] =
          isSwapVenueChainEVMOnly
            ? swapAccount.ethereumHexAddress
            : swapAccount.bech32Address;
      }
    }

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
      const tx = sourceAccount.cosmos.makeIBCTransferTx(
        {
          portId: msg.sourcePort,
          channelId: msg.sourceChannel,
          counterpartyChainId: msg.counterpartyChainId,
        },
        this.amount[0].toDec().toString(),
        this.amount[0].currency,
        msg.receiver,
        msg.memo
      );
      tx.ui.overrideType("ibc-swap");
      return tx;
    } else if (msg.type === "MsgExecuteContract") {
      const tx = sourceAccount.cosmwasm.makeExecuteContractTx(
        "unknown",
        msg.contract,
        msg.msg,
        msg.funds.map((fund) => fund.toCoin())
      );
      tx.ui.overrideType("ibc-swap");
      return tx;
    } else if (msg.type === "evmTx") {
      const ethereumAccount = this.ethereumAccountStore.getAccount(msg.chainId);
      const tx = ethereumAccount.makeTx(msg.to, msg.value, msg.data);
      return {
        ...tx,
        requiredErc20Approvals: msg.requiredErc20Approvals,
      };
    } else if (msg.type === "MsgCCTP") {
      const tx = sourceAccount.cosmos.makeCCTPTx(
        msg.msgs[0].msg,
        msg.msgs[1].msg
      );
      return tx;
    }
  }

  // /route query의 결과와 /msgs_direct query의 결과를 비교하기 위한 키를 생성한다.
  createSwapRouteKeyFromRouteResponse(response: RouteResponse): string {
    let key = "";

    for (const operation of response.operations) {
      if ("swap" in operation) {
        if (operation.swap.swap_in) {
          for (const swapOperation of operation.swap.swap_in.swap_operations) {
            key += `/${swapOperation.pool}/${swapOperation.denom_in}/${swapOperation.denom_out}`;
          }
        } else if (operation.swap.smart_swap_in) {
          for (const swapRoute of operation.swap.smart_swap_in.swap_routes) {
            for (const swapOperation of swapRoute.swap_operations) {
              key += `/${swapOperation.pool}/${swapOperation.denom_in}/${swapOperation.denom_out}`;
            }
          }
        }
      }
    }

    return key;
  }

  // /route query의 결과와 /msgs_direct query의 결과를 비교하기 위한 키를 생성한다.
  createSwapRouteKeyFromMsgsDirectResponse(
    response: MsgsDirectResponse
  ): string {
    let key = "";

    for (const msg of response.txs) {
      if (msg.cosmos_tx) {
        const cosmosMsg = msg.cosmos_tx.msgs[0];
        if (
          cosmosMsg.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer"
        ) {
          const memo = JSON.parse(cosmosMsg.msg).memo;
          if (memo) {
            const obj = JSON.parse(memo);
            const wasms: any = [];

            if (obj.wasm) {
              wasms.push(obj.wasm);
            }

            let forward = obj.forward;
            if (forward) {
              while (true) {
                if (forward) {
                  if (forward.memo) {
                    const obj = JSON.parse(forward.memo);
                    if (obj.wasm) {
                      wasms.push(obj.wasm);
                    }
                  }

                  if (forward.wasm) {
                    wasms.push(forward.wasm);
                  }

                  if (forward.next) {
                    const obj =
                      typeof forward.next === "string"
                        ? JSON.parse(forward.next)
                        : forward.next;

                    if (obj.forward) {
                      forward = obj.forward;
                    } else {
                      forward = obj;
                    }
                  } else {
                    break;
                  }
                } else {
                  break;
                }
              }
            }

            for (const wasm of wasms) {
              for (const operation of wasm.msg.swap_and_action.user_swap
                .swap_exact_asset_in.operations) {
                key += `/${operation.pool}/${operation.denom_in}/${operation.denom_out}`;
              }
            }
          }
        }
        if (cosmosMsg.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
          const obj = JSON.parse(cosmosMsg.msg);
          for (const operation of obj.msg.swap_and_action.user_swap
            .swap_exact_asset_in.operations) {
            key += `/${operation.pool}/${operation.denom_in}/${operation.denom_out}`;
          }
        }
      }
    }

    return key;
  }

  _isUseSwapInBridge(routeResponse: RouteResponse | undefined) {
    const isForcedDisableSwap =
      this.allowSwaps === false && this._smartSwapOptions?.evmSwaps === false;

    if (!isForcedDisableSwap || !routeResponse) {
      return false;
    }

    const operations = routeResponse.operations;
    const isContainsSwap = operations.some(
      (operation) => "swap" in operation || "evm_swap" in operation
    );
    const isUseSwap = routeResponse.does_swap || isContainsSwap;

    return isUseSwap;
  }

  @override
  override get uiProperties(): UIProperties {
    const prev = super.uiProperties;
    if (prev.error || prev.loadingState) {
      return prev;
    }

    const queryIBCSwap = this.getQueryIBCSwap();
    if (!queryIBCSwap) {
      return {
        ...prev,
        error: new Error("Query IBC Swap is not initialized"),
      };
    }

    if (queryIBCSwap.getQueryRoute().isFetching) {
      return {
        ...prev,
        loadingState: "loading-block",
      };
    }

    const routeError = queryIBCSwap.getQueryRoute().error;
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
    const routeResponse = queryIBCSwap.getQueryRoute().response;
    if (routeResponse && this._isUseSwapInBridge(routeResponse.data)) {
      return {
        ...prev,
        error: new Error("Swap in bridge is not allowed"),
      };
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
        !this.skipQueries.queryIBCSwap.isSwappableCurrency(
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
      !this.skipQueries.queryIBCSwap.isSwapDestinationOrAlternatives(
        this.outChainId,
        this.outAmount.currency
      )
    ) {
      return {
        ...prev,
        error: new Error(
          "The currency you are swapping to is currently not supported"
        ),
      };
    }

    if (queryIBCSwap.getQueryRoute().response?.data.txs_required !== 1) {
      return {
        ...prev,
        error: new Error("Swap can't be executed with ibc pfm"),
      };
    }

    return {
      ...prev,
    };
  }

  getQueryIBCSwap(): ObservableQueryIBCSwapInner | undefined {
    if (this.amount.length === 0) {
      return;
    }

    return this.skipQueries.queryIBCSwap.getIBCSwap(
      this.chainId,
      this.amount[0],
      this.outChainId,
      this.outCurrency.coinMinimalDenom,
      this.swapFeeBps,
      this.allowSwaps,
      this.smartSwapOptions
    );
  }
}

export const useIBCSwapAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  accountStore: IAccountStoreWithInjects<[CosmosAccount, CosmwasmAccount]>,
  ethereumAccountStore: EthereumAccountStore,
  skipQueries: SkipQueries,
  chainId: string,
  senderConfig: ISenderConfig,
  outChainId: string,
  outCurrency: AppCurrency,
  swapFeeBps: number,
  allowSwaps?: boolean,
  smartSwapOptions?: {
    evmSwaps?: boolean;
    splitRoutes?: boolean;
  }
) => {
  const [txConfig] = useState(
    () =>
      new IBCSwapAmountConfig(
        chainGetter,
        queriesStore,
        accountStore,
        ethereumAccountStore,
        skipQueries,
        chainId,
        senderConfig,
        outChainId,
        outCurrency,
        swapFeeBps,
        allowSwaps,
        smartSwapOptions
      )
  );
  txConfig.setChain(chainId);
  txConfig.setOutChainId(outChainId);
  txConfig.setOutCurrency(outCurrency);
  txConfig.setSwapFeeBps(swapFeeBps);

  return txConfig;
};
