import {
  AmountConfig,
  InsufficientFeeError,
  ISenderConfig,
  UIProperties,
} from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosAccount,
  CosmwasmAccount,
  IAccountStoreWithInjects,
  IQueriesStore,
  // MakeTxResponse,
  // WalletStatus,
} from "@keplr-wallet/stores";
import { useState } from "react";
import { action, computed, makeObservable, observable, override } from "mobx";
import {
  RouteResponseV2,
  RouteStepType,
  SwapQueries,
} from "@keplr-wallet/stores-internal";
import {
  EthereumAccountStore,
  // UnsignedEVMTransactionWithErc20Approvals,
} from "@keplr-wallet/stores-eth";
import { ObservableQuerySwapHelperInner } from "@keplr-wallet/stores-internal/build/swap/swap-helper";

export class SwapAmountConfig extends AmountConfig {
  static readonly QueryMsgsDirectRefreshInterval = 10000;

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

      // TODO: route query와 txs query 분리
      const queryRoute = this.getQuerySwapHelper(result)?.getRoute({}, 5);
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
    return new CoinPretty(
      this.outCurrency,
      querySwapHelper.getRoute({}, 5).response?.data.amount_out ?? "0"
    );
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

  // CHECK: 백엔드에서 같이 내려줘야 하는 데이터로 판단됨. 추후 구현 필요
  // get swapPriceImpact(): RatePretty | undefined {
  //   const queryIBCSwap = this.getQueryIBCSwap();
  //   if (!queryIBCSwap) {
  //     return undefined;
  //   }
  //   return queryIBCSwap.getQueryRoute().swapPriceImpact;
  // }

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

    // TODO: route query와 txs query 분리
    return querySwapHelper.getRoute({}, 5).bridgeFees;
  }

  async fetch(): Promise<void> {
    const querySwapHelper = this.getQuerySwapHelper();
    if (querySwapHelper) {
      // await querySwapHelper.getRoute({}, 5).fetch();
      await querySwapHelper.getRoute({}, 5).waitResponse();
    }
  }

  get isFetchingInAmount(): boolean {
    if (this.fraction === 1) {
      return (
        this.getQuerySwapHelper(this.maxAmount)?.getRoute({}, 5).isFetching ??
        this.getQuerySwapHelper()?.getRoute({}, 5).isFetching ??
        false
      );
    }

    return false;
  }

  get isFetchingOutAmount(): boolean {
    return this.getQuerySwapHelper()?.getRoute({}, 5).isFetching ?? false;
  }

  get type(): "swap" | "transfer" | "not-ready" {
    const querySwapHelper = this.getQuerySwapHelper();
    if (!querySwapHelper) {
      return "not-ready";
    }

    const res = querySwapHelper.getRoute({}, 5).response;
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

  // TODO: txs 처리 필요

  // async getTxs(
  //   slippageTolerancePercent: number,
  //   priorOutAmount?: Int,
  //   customRecipient?: {
  //     chainId: string;
  //     recipient: string;
  //   }
  // ): Promise<MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals> {
  //   const querySwapHelper = this.getQuerySwapHelper();
  //   if (!querySwapHelper) {
  //     throw new Error("Query Swap Helper is not initialized");
  //   }

  //   const queryRouteResponse = querySwapHelper.getRoute({}, 5).response;
  //   if (!queryRouteResponse) {
  //     throw new Error("Failed to fetch route");
  //   }

  //   if (queryRouteResponse.timestamp) {
  //     const now = new Date();
  //     const diff = now.getTime() - queryRouteResponse.timestamp;
  //     // 오래전에 캐싱된 쿼리 응답으로 tx를 만들 경우 quote가 크게 변경될 수 있으므로 에러를 발생시킨다.
  //     // 쿼리 응답 오는데에 시간이 좀 드니, RefreshInterval에 5초를 더 추가한다.
  //     if (diff > IBCSwapAmountConfig.QueryMsgsDirectRefreshInterval + 5000) {
  //       throw new Error("The quote is expired. Please try again.");
  //     }
  //   }

  //   const chainIdsToAddresses: Record<string, string> = {};

  //   const sourceAccount = this.accountStore.getAccount(this.chainId);
  //   if (sourceAccount.walletStatus === WalletStatus.NotInit) {
  //     await sourceAccount.init();
  //   }

  //   const isSourceAccountEVMOnly = this.chainId.startsWith("eip155:");
  //   if (
  //     isSourceAccountEVMOnly
  //       ? !sourceAccount.ethereumHexAddress
  //       : !sourceAccount.bech32Address
  //   ) {
  //     throw new Error("Source account is not set");
  //   }
  //   chainIdsToAddresses[this.chainId.replace("eip155:", "")] =
  //     isSourceAccountEVMOnly
  //       ? sourceAccount.ethereumHexAddress
  //       : sourceAccount.bech32Address;

  //   const destinationChainIds = queryRouteResponse.data.chain_ids.map(
  //     (chainId) => {
  //       const evmLikeChainId = Number(chainId);
  //       const isEVMChainId =
  //         !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
  //       if (isEVMChainId) {
  //         return `eip155:${chainId}`;
  //       }
  //       return chainId;
  //     }
  //   );
  //   for (const destinationChainId of destinationChainIds) {
  //     const destinationAccount =
  //       this.accountStore.getAccount(destinationChainId);
  //     if (destinationAccount.walletStatus === WalletStatus.NotInit) {
  //       await destinationAccount.init();
  //     }

  //     const isDestinationChainEVMOnly =
  //       destinationChainId.startsWith("eip155:");
  //     if (
  //       isDestinationChainEVMOnly
  //         ? !destinationAccount.ethereumHexAddress
  //         : !destinationAccount.bech32Address
  //     ) {
  //       throw new Error("Destination account is not set");
  //     }
  //     chainIdsToAddresses[destinationChainId.replace("eip155:", "")] =
  //       isDestinationChainEVMOnly
  //         ? destinationAccount.ethereumHexAddress
  //         : destinationAccount.bech32Address;
  //   }

  //   for (const swapVenue of queryRouteResponse.data.swap_venues ?? [
  //     queryRouteResponse.data.swap_venue,
  //   ]) {
  //     if (swapVenue) {
  //       const swapVenueChainId = (() => {
  //         const evmLikeChainId = Number(swapVenue.chain_id);
  //         const isEVMChainId =
  //           !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
  //         if (isEVMChainId) {
  //           return `eip155:${swapVenue.chain_id}`;
  //         }

  //         return swapVenue.chain_id;
  //       })();
  //       const swapAccount = this.accountStore.getAccount(swapVenueChainId);
  //       if (swapAccount.walletStatus === WalletStatus.NotInit) {
  //         await swapAccount.init();
  //       }

  //       const isSwapVenueChainEVMOnly = swapVenueChainId.startsWith("eip155:");
  //       if (
  //         isSwapVenueChainEVMOnly
  //           ? !swapAccount.ethereumHexAddress
  //           : !swapAccount.bech32Address
  //       ) {
  //         const swapVenueChainInfo =
  //           this.chainGetter.hasChain(swapVenueChainId) &&
  //           this.chainGetter.getChain(swapVenueChainId);
  //         if (
  //           swapAccount.isNanoLedger &&
  //           swapVenueChainInfo &&
  //           (swapVenueChainInfo.bip44.coinType === 60 ||
  //             swapVenueChainInfo.features.includes("eth-address-gen") ||
  //             swapVenueChainInfo.features.includes("eth-key-sign") ||
  //             swapVenueChainInfo.evm != null)
  //         ) {
  //           throw new Error(
  //             "Please connect Ethereum app on Ledger with Keplr to get the address"
  //           );
  //         }

  //         throw new Error("Swap account is not set");
  //       }
  //       chainIdsToAddresses[swapVenueChainId.replace("eip155:", "")] =
  //         isSwapVenueChainEVMOnly
  //           ? swapAccount.ethereumHexAddress
  //           : swapAccount.bech32Address;
  //     }
  //   }

  //   if (customRecipient) {
  //     chainIdsToAddresses[customRecipient.chainId.replace("eip155:", "")] =
  //       customRecipient.recipient;
  //   }

  //   // const queryMsgsDirect = querySwapHelper.getTxs(
  //   //   chainIdsToAddresses,
  //   //   slippageTolerancePercent
  //   // );

  //   // await queryMsgsDirect.waitFreshResponse();
  //   // if (queryMsgsDirect.error) {
  //   //   throw new Error(queryMsgsDirect.error.message);
  //   // }

  //   const tx = this.getTxsIfReady(slippageTolerancePercent, customRecipient);
  //   if (!tx) {
  //     throw new Error("Tx is not ready");
  //   }

  //   if (priorOutAmount) {
  //     // const queryMsgsDirect = querySwapHelper.getTxs(
  //     //   chainIdsToAddresses,
  //     //   slippageTolerancePercent,
  //     // );
  //     // if (!queryMsgsDirect.response) {
  //     // throw new Error("Can't happen: queryMsgsDirect is not ready");
  //     // }

  //     const currentAmountOut = new Int(queryRouteResponse.data.amount_out);

  //     if (
  //       currentAmountOut.lt(priorOutAmount) &&
  //       currentAmountOut
  //         .sub(priorOutAmount)
  //         .abs()
  //         .toDec()
  //         .quo(priorOutAmount.toDec())
  //         .gte(new Dec(0.01))
  //     ) {
  //       throw new Error(
  //         "Price change has been detected while building your transaction. Please try again"
  //       );
  //     }
  //   }

  //   return tx;
  // }

  // getTxsIfReady(
  //   slippageTolerancePercent: number,
  //   customRecipient?: {
  //     chainId: string;
  //     recipient: string;
  //   }
  // ): MakeTxResponse | UnsignedEVMTransactionWithErc20Approvals | undefined {
  //   if (!this.currency) {
  //     return;
  //   }

  //   if (this.amount.length !== 1) {
  //     return;
  //   }

  //   if (this.amount[0].toDec().lte(new Dec(0))) {
  //     return;
  //   }

  //   const querySwapHelper = this.getQuerySwapHelper();
  //   if (!querySwapHelper) {
  //     return;
  //   }

  //   // TODO: route query와 txs query 분리
  //   const queryRouteResponse = querySwapHelper.getRoute({}, 5).response;
  //   if (!queryRouteResponse) {
  //     return;
  //   }

  //   const chainIdsToAddresses: Record<string, string> = {};

  //   const sourceAccount = this.accountStore.getAccount(this.chainId);
  //   if (sourceAccount.walletStatus === WalletStatus.NotInit) {
  //     sourceAccount.init();
  //   }

  //   const isSourceAccountEVMOnly = this.chainId.startsWith("eip155:");
  //   if (
  //     isSourceAccountEVMOnly
  //       ? !sourceAccount.ethereumHexAddress
  //       : !sourceAccount.bech32Address
  //   ) {
  //     return;
  //   }
  //   chainIdsToAddresses[this.chainId.replace("eip155:", "")] =
  //     isSourceAccountEVMOnly
  //       ? sourceAccount.ethereumHexAddress
  //       : sourceAccount.bech32Address;

  //   const destinationChainIds = queryRouteResponse.data.chain_ids.map(
  //     (chainId) => {
  //       const evmLikeChainId = Number(chainId);
  //       const isEVMChainId =
  //         !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
  //       if (isEVMChainId) {
  //         return `eip155:${chainId}`;
  //       }
  //       return chainId;
  //     }
  //   );
  //   for (const destinationChainId of destinationChainIds) {
  //     const destinationAccount =
  //       this.accountStore.getAccount(destinationChainId);

  //     if (destinationAccount.walletStatus === WalletStatus.NotInit) {
  //       destinationAccount.init();
  //     }

  //     const isDestinationChainEVMOnly =
  //       destinationChainId.startsWith("eip155:");
  //     if (
  //       isDestinationChainEVMOnly
  //         ? !destinationAccount.ethereumHexAddress
  //         : !destinationAccount.bech32Address
  //     ) {
  //       return;
  //     }
  //     chainIdsToAddresses[destinationChainId.replace("eip155:", "")] =
  //       isDestinationChainEVMOnly
  //         ? destinationAccount.ethereumHexAddress
  //         : destinationAccount.bech32Address;
  //   }

  //   for (const swapVenue of queryRouteResponse.data.swap_venues ?? [
  //     queryRouteResponse.data.swap_venue,
  //   ]) {
  //     if (swapVenue) {
  //       const swapVenueChainId = (() => {
  //         const evmLikeChainId = Number(swapVenue.chain_id);
  //         const isEVMChainId =
  //           !Number.isNaN(evmLikeChainId) && evmLikeChainId !== 0;
  //         if (isEVMChainId) {
  //           return `eip155:${swapVenue.chain_id}`;
  //         }

  //         return swapVenue.chain_id;
  //       })();
  //       const swapAccount = this.accountStore.getAccount(swapVenueChainId);
  //       if (swapAccount.walletStatus === WalletStatus.NotInit) {
  //         swapAccount.init();
  //       }

  //       const isSwapVenueChainEVMOnly = swapVenueChainId.startsWith("eip155:");
  //       if (
  //         isSwapVenueChainEVMOnly
  //           ? !swapAccount.ethereumHexAddress
  //           : !swapAccount.bech32Address
  //       ) {
  //         return;
  //       }
  //       chainIdsToAddresses[swapVenueChainId.replace("eip155:", "")] =
  //         isSwapVenueChainEVMOnly
  //           ? swapAccount.ethereumHexAddress
  //           : swapAccount.bech32Address;
  //     }
  //   }

  //   if (customRecipient) {
  //     chainIdsToAddresses[customRecipient.chainId.replace("eip155:", "")] =
  //       customRecipient.recipient;
  //   }

  //   const queryMsgsDirect = queryIBCSwap.getQueryMsgsDirect(
  //     chainIdsToAddresses,
  //     slippageTolerancePercent,
  //     affiliateFeeReceiver
  //   );
  //   const msg = queryMsgsDirect.msg;
  //   if (!msg) {
  //     return;
  //   }

  //   if (msg.type === "MsgTransfer") {
  //     const tx = sourceAccount.cosmos.makeIBCTransferTx(
  //       {
  //         portId: msg.sourcePort,
  //         channelId: msg.sourceChannel,
  //         counterpartyChainId: msg.counterpartyChainId,
  //       },
  //       this.amount[0].toDec().toString(),
  //       this.amount[0].currency,
  //       msg.receiver,
  //       msg.memo
  //     );
  //     tx.ui.overrideType("ibc-swap");
  //     return tx;
  //   } else if (msg.type === "MsgExecuteContract") {
  //     const tx = sourceAccount.cosmwasm.makeExecuteContractTx(
  //       "unknown",
  //       msg.contract,
  //       msg.msg,
  //       msg.funds.map((fund) => fund.toCoin())
  //     );
  //     tx.ui.overrideType("ibc-swap");
  //     return tx;
  //   } else if (msg.type === "evmTx") {
  //     const ethereumAccount = this.ethereumAccountStore.getAccount(msg.chainId);
  //     const tx = ethereumAccount.makeTx(msg.to, msg.value, msg.data);
  //     return {
  //       ...tx,
  //       requiredErc20Approvals: msg.requiredErc20Approvals,
  //     };
  //   } else if (msg.type === "MsgCCTP") {
  //     const tx = sourceAccount.cosmos.makeCCTPTx(
  //       msg.msgs[0].msg,
  //       msg.msgs[1].msg
  //     );
  //     return tx;
  //   }
  // }

  // CHECK: 브릿지만 사용한다는 플래그가 요청 필드에 필요할 수 있다.
  _isUseSwapInBridge(routeResponse: RouteResponseV2 | undefined) {
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

      // TODO: route와 txs 쿼리 분리
      const routeQuery = querySwapHelper.getRoute({}, 5);
      if (routeQuery.isFetching) {
        return {
          ...prev,
          loadingState: "loading-block",
        };
      }

      // TODO: 현재 에러 메시지를 다이렉트로 받을 수 있는 구조가 아니라 수정 필요할 수 있음.
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
        if (this._isUseSwapInBridge(routeResponse.data)) {
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

    // TODO: route와 txs 쿼리 분리
    const routeQuery = querySwapHelper.getRoute({}, 5);
    if (routeQuery.isFetching) {
      return {
        ...prev,
        loadingState: "loading-block",
      };
    }

    // TODO: 현재 에러 메시지를 다이렉트로 받을 수 있는 구조가 아니라 수정 필요할 수 있음.
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
      if (this._isUseSwapInBridge(routeResponse.data)) {
        return {
          ...prev,
          error: new Error("Swap in bridge is not allowed"),
        };
      }

      // NOTE: now we support multiple txs
      // if (routeResponse?.data.txs_required !== 1) {
      //   return {
      //     ...prev,
      //     error: new Error("Swap can't be executed with ibc pfm"),
      //   };
      // }

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

    return this.swapQueries.querySwapHelper.getSwapHelper(
      this.chainId,
      amountIn.toCoin().amount,
      amountIn.currency.coinMinimalDenom,
      this.outChainId,
      this.outCurrency.coinMinimalDenom
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
