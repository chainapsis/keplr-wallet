import { ChainStore } from "../chain";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  IAccountStore,
  IChainInfoImpl,
  IQueriesStore,
  QueryError,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { action, autorun, computed, runInAction } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { computedFn } from "mobx-utils";
import { BinarySortArray } from "./sort";
import { StarknetQueriesStore } from "@keplr-wallet/stores-starknet";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ModularChainInfo } from "@keplr-wallet/types";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { UIConfigStore } from "../ui-config";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { AllTokenMapByChainIdentifierState } from "./all-token-map-state";

interface ViewToken {
  chainInfo: IChainInfoImpl | ModularChainInfo;
  token: CoinPretty;
  price: PricePretty | undefined;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

export interface ViewStakedToken extends ViewToken {
  stakingUrl?: string;
}

export interface ViewUnbondingToken extends ViewStakedToken {
  completeTime: string | number;
  omitCompleteTimeFraction?: boolean;
}

export type ViewRewardToken = ViewStakedToken;

/**
 * 거대한 쿼리를 만든다.
 * 거대하기 때문에 로직을 분리하기 위해서 따로 만들었다.
 * 근데 이름그대로 거대한 쿼리를 만들기 때문에 꼭 필요할때만 써야한다.
 * 특정 밸런스가 필요하다고 여기서 balance를 다 가져와서 그 중에 한개만 찾아서 쓰고 그러면 안된다.
 * 꼭 필요할때만 쓰자
 */
export class HugeQueriesStore {
  protected static zeroDec = new Dec(0);

  protected balanceBinarySort: BinarySortArray<ViewToken>;
  protected delegationBinarySort: BinarySortArray<ViewStakedToken>;
  protected unbondingBinarySort: BinarySortArray<ViewUnbondingToken>;
  protected claimableRewardsBinarySort: BinarySortArray<ViewRewardToken>;

  protected allTokenMapByChainIdentifierState: AllTokenMapByChainIdentifierState;
  constructor(
    protected readonly chainStore: ChainStore,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly starknetQueriesStore: StarknetQueriesStore,
    protected readonly bitcoinQueriesStore: BitcoinQueriesStore,
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly uiConfigStore: UIConfigStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    let balanceDisposal: (() => void) | undefined;
    this.balanceBinarySort = new BinarySortArray<ViewToken>(
      this.sortByPrice,
      () => {
        balanceDisposal = autorun(() => {
          this.updateBalances();
        });
      },
      () => {
        if (balanceDisposal) {
          balanceDisposal();
        }
      }
    );
    let delegationDisposal: (() => void) | undefined;
    this.delegationBinarySort = new BinarySortArray<ViewStakedToken>(
      this.sortByPrice,
      () => {
        delegationDisposal = autorun(() => {
          this.updateDelegations();
        });
      },
      () => {
        if (delegationDisposal) {
          delegationDisposal();
        }
      }
    );
    let unbondingDisposal: (() => void) | undefined;
    this.unbondingBinarySort = new BinarySortArray<ViewUnbondingToken>(
      (a, b) => {
        return this.sortByPrice(a, b);
      },
      () => {
        unbondingDisposal = autorun(() => {
          this.updateUnbondings();
        });
      },
      () => {
        if (unbondingDisposal) {
          unbondingDisposal();
        }
      }
    );
    let claimableRewardsDisposal: (() => void) | undefined;
    this.claimableRewardsBinarySort = new BinarySortArray<ViewStakedToken>(
      this.sortByPrice,
      () => {
        claimableRewardsDisposal = autorun(() => {
          this.updateClaimableRewards();
        });
      },
      () => {
        if (claimableRewardsDisposal) {
          claimableRewardsDisposal();
        }
      }
    );

    let allTokenMapByChainIdentifierDisposal: (() => void) | undefined;
    this.allTokenMapByChainIdentifierState =
      new AllTokenMapByChainIdentifierState(
        () => {
          allTokenMapByChainIdentifierDisposal = autorun(() => {
            this.getAllTokenMapByChainIdentifier();
          });
        },
        () => {
          if (allTokenMapByChainIdentifierDisposal) {
            allTokenMapByChainIdentifierDisposal();
          }
        }
      );
  }

  @action
  protected updateBalances() {
    const keysUsed = new Map<string, boolean>();
    const prevKeyMap = new Map(this.balanceBinarySort.indexForKeyMap());

    for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
      const account = this.accountStore.getAccount(modularChainInfo.chainId);
      if ("cosmos" in modularChainInfo) {
        const chainInfo = this.chainStore.getChain(modularChainInfo.chainId);

        const mainCurrency = chainInfo.stakeCurrency || chainInfo.currencies[0];

        if (account.bech32Address === "") {
          continue;
        }
        const queries = this.queriesStore.get(chainInfo.chainId);

        const currencies = [...chainInfo.currencies];
        if (chainInfo.stakeCurrency) {
          currencies.push(chainInfo.stakeCurrency);
        }
        for (const currency of currencies) {
          const denomHelper = new DenomHelper(currency.coinMinimalDenom);
          const isERC20 = denomHelper.type === "erc20";
          const isMainCurrency =
            mainCurrency.coinMinimalDenom === currency.coinMinimalDenom;
          const queryBalance =
            this.chainStore.isEvmChain(chainInfo.chainId) &&
            (isMainCurrency || isERC20)
              ? queries.queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                )
              : queries.queryBalances.getQueryBech32Address(
                  account.bech32Address
                );

          if (this.chainStore.getChain(chainInfo.chainId).bech32Config) {
            // ethermint 계열의 체인인 경우 ibc token을 보여주기 위해서 native 토큰에 대해서
            // cosmos 방식의 쿼리를 꼭 발생시켜야 한다.
            for (const bal of queries.queryBalances.getQueryBech32Address(
              account.bech32Address
            ).balances) {
              if (
                new DenomHelper(bal.currency.coinMinimalDenom).type === "native"
              ) {
                bal.balance;
                break;
              }
            }
          }

          const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
          if (!keysUsed.get(key)) {
            if (
              chainInfo.stakeCurrency?.coinMinimalDenom ===
              currency.coinMinimalDenom
            ) {
              const balance = queryBalance.stakable?.balance;
              if (!balance) {
                continue;
              }
              // If the balance is zero, don't show it.
              // 다시 제로 일때 보여주기 위해서 아래코드를 주석처리함
              // if (balance.toDec().equals(HugeQueriesStore.zeroDec)) {
              //   continue;
              // }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo,
                token: balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance)
                  : undefined,
                isFetching: queryBalance.stakable.isFetching,
                error: queryBalance.stakable.error,
              });
            } else {
              const balance = queryBalance.getBalance(currency);
              if (balance) {
                if (balance.balance.toDec().equals(HugeQueriesStore.zeroDec)) {
                  const denomHelper = new DenomHelper(
                    currency.coinMinimalDenom
                  );
                  // If the balance is zero and currency is "native" or "erc20", don't show it.
                  if (
                    denomHelper.type === "native" ||
                    denomHelper.type === "erc20"
                  ) {
                    // However, if currency is native currency and not ibc, and same with currencies[0],
                    // just show it as 0 balance.
                    if (
                      chainInfo.currencies.length > 0 &&
                      chainInfo.currencies[0].coinMinimalDenom ===
                        currency.coinMinimalDenom &&
                      !currency.coinMinimalDenom.startsWith("ibc/")
                    ) {
                      // 위의 if 문을 뒤집기(?) 귀찮아서 그냥 빈 if-else로 처리한다...
                    } else {
                      continue;
                    }
                  }
                }

                keysUsed.set(key, true);
                prevKeyMap.delete(key);
                this.balanceBinarySort.pushAndSort(key, {
                  chainInfo,
                  token: balance.balance,
                  price: currency.coinGeckoId
                    ? this.priceStore.calculatePrice(balance.balance)
                    : undefined,
                  isFetching: balance.isFetching,
                  error: balance.error,
                });
              }
            }
          }
        }
      }

      if ("starknet" in modularChainInfo) {
        if (account.starknetHexAddress === "") {
          continue;
        }

        const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
          modularChainInfo.chainId
        );
        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const currencies = modularChainInfoImpl.getCurrencies("starknet");

        for (const currency of currencies) {
          const queryBalance = queries.queryStarknetERC20Balance.getBalance(
            modularChainInfo.chainId,
            this.chainStore,
            account.starknetHexAddress,
            currency.coinMinimalDenom
          );

          if (!queryBalance) {
            continue;
          }

          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;
          if (!keysUsed.get(key)) {
            const isNative =
              currency.coinMinimalDenom ===
                `erc20:${modularChainInfo.starknet.strkContractAddress}` ||
              currency.coinMinimalDenom ===
                `erc20:${modularChainInfo.starknet.ethContractAddress}`;
            if (
              !isNative &&
              queryBalance.balance.toDec().equals(HugeQueriesStore.zeroDec)
            ) {
              continue;
            }

            keysUsed.set(key, true);
            prevKeyMap.delete(key);
            this.balanceBinarySort.pushAndSort(key, {
              chainInfo: modularChainInfo,
              token: queryBalance.balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(queryBalance.balance)
                : undefined,
              isFetching: queryBalance.isFetching,
              error: queryBalance.error,
            });
          }
        }
      }

      if ("bitcoin" in modularChainInfo) {
        if (!account.bitcoinAddress) {
          continue;
        }

        const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
          modularChainInfo.chainId
        );
        const queries = this.bitcoinQueriesStore.get(modularChainInfo.chainId);
        const currencies = modularChainInfoImpl.getCurrencies("bitcoin");

        const currency = currencies[0];

        const queryBalance = queries.queryBitcoinBalance.getBalance(
          modularChainInfo.chainId,
          this.chainStore,
          account.bitcoinAddress.bech32Address,
          currency.coinMinimalDenom
        );

        if (!queryBalance) {
          continue;
        }

        const key = `${
          ChainIdHelper.parse(modularChainInfo.chainId).identifier
        }/${currency.coinMinimalDenom}`;
        if (!keysUsed.get(key)) {
          keysUsed.set(key, true);
          prevKeyMap.delete(key);
          this.balanceBinarySort.pushAndSort(key, {
            chainInfo: modularChainInfo,
            token: queryBalance.balance,
            price: currency.coinGeckoId
              ? this.priceStore.calculatePrice(queryBalance.balance)
              : undefined,
            isFetching: queryBalance.isFetching,
            error: queryBalance.error,
          });
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.balanceBinarySort.remove(removedKey);
    }
  }

  get allTokenMapByChainIdentifier(): Map<string, ViewToken[]> {
    return this.allTokenMapByChainIdentifierState.map;
  }

  @action
  protected getAllTokenMapByChainIdentifier() {
    const tokensByChainId = new Map<string, ViewToken[]>();
    const modularChainInfos = this.chainStore.groupedModularChainInfos.filter(
      (chainInfo) => {
        if ("cosmos" in chainInfo && chainInfo.cosmos.hideInUI) {
          return false;
        }
        return true;
      }
    );

    for (const modularChainInfo of modularChainInfos) {
      const baseChainId =
        "bitcoin" in modularChainInfo
          ? modularChainInfo.bitcoin.chainId
          : modularChainInfo.chainId;

      const chainIdentifier = ChainIdHelper.parse(baseChainId).identifier;

      if (!tokensByChainId.has(chainIdentifier)) {
        tokensByChainId.set(chainIdentifier, []);
      }

      const account = this.accountStore.getAccount(modularChainInfo.chainId);
      if ("cosmos" in modularChainInfo) {
        const chainInfo = this.chainStore.getChain(modularChainInfo.chainId);

        const mainCurrency = chainInfo.stakeCurrency || chainInfo.currencies[0];

        if (account.bech32Address === "") {
          continue;
        }
        const queries = this.queriesStore.get(chainInfo.chainId);

        const currencies = [...chainInfo.currencies];
        if (chainInfo.stakeCurrency) {
          currencies.push(chainInfo.stakeCurrency);
        }

        for (const currency of currencies) {
          const denomHelper = new DenomHelper(currency.coinMinimalDenom);
          const isERC20 = denomHelper.type === "erc20";
          const isMainCurrency =
            mainCurrency.coinMinimalDenom === currency.coinMinimalDenom;
          const queryBalance =
            this.chainStore.isEvmChain(chainInfo.chainId) &&
            (isMainCurrency || isERC20)
              ? queries.queryBalances.getQueryEthereumHexAddress(
                  account.ethereumHexAddress
                )
              : queries.queryBalances.getQueryBech32Address(
                  account.bech32Address
                );

          if (
            chainInfo.stakeCurrency?.coinMinimalDenom ===
            currency.coinMinimalDenom
          ) {
            const balance = queryBalance.stakable?.balance;
            if (!balance) {
              continue;
            }

            if (
              tokensByChainId
                .get(chainIdentifier)!
                .find(
                  (token) =>
                    token.token.currency.coinMinimalDenom ===
                    currency.coinMinimalDenom
                )
            ) {
              continue;
            }

            tokensByChainId.get(chainIdentifier)!.push({
              chainInfo,
              token: balance,
              price: currency.coinGeckoId
                ? this.priceStore.calculatePrice(balance)
                : undefined,
              isFetching: queryBalance.stakable.isFetching,
              error: queryBalance.stakable.error,
            });
          } else {
            const balance = queryBalance.getBalance(currency);
            if (balance) {
              if (balance.balance.toDec().equals(HugeQueriesStore.zeroDec)) {
                const denomHelper = new DenomHelper(currency.coinMinimalDenom);
                // If the balance is zero and currency is "native" or "erc20", don't show it.
                if (
                  denomHelper.type === "native" ||
                  denomHelper.type === "erc20"
                ) {
                  // However, if currency is native currency and not ibc, and same with currencies[0],
                  // just show it as 0 balance.
                  if (
                    chainInfo.currencies.length > 0 &&
                    chainInfo.currencies[0].coinMinimalDenom ===
                      currency.coinMinimalDenom &&
                    !currency.coinMinimalDenom.startsWith("ibc/")
                  ) {
                    // 위의 if 문을 뒤집기(?) 귀찮아서 그냥 빈 if-else로 처리한다...
                  } else {
                    continue;
                  }
                }
              }

              tokensByChainId.get(chainIdentifier)!.push({
                chainInfo,
                token: balance.balance,
                price: currency.coinGeckoId
                  ? this.priceStore.calculatePrice(balance.balance)
                  : undefined,
                isFetching: balance.isFetching,
                error: balance.error,
              });
            }
          }
        }
      }

      if ("starknet" in modularChainInfo) {
        if (account.starknetHexAddress === "") {
          continue;
        }

        const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
          modularChainInfo.chainId
        );
        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const currencies = modularChainInfoImpl.getCurrencies("starknet");

        for (const currency of currencies) {
          const queryBalance = queries.queryStarknetERC20Balance.getBalance(
            modularChainInfo.chainId,
            this.chainStore,
            account.starknetHexAddress,
            currency.coinMinimalDenom
          );

          if (!queryBalance) {
            continue;
          }

          const isNative =
            currency.coinMinimalDenom ===
              `erc20:${modularChainInfo.starknet.strkContractAddress}` ||
            currency.coinMinimalDenom ===
              `erc20:${modularChainInfo.starknet.ethContractAddress}`;
          if (
            !isNative &&
            queryBalance.balance.toDec().equals(HugeQueriesStore.zeroDec)
          ) {
            continue;
          }

          tokensByChainId.get(chainIdentifier)!.push({
            chainInfo: modularChainInfo,
            token: queryBalance.balance,
            price: currency.coinGeckoId
              ? this.priceStore.calculatePrice(queryBalance.balance)
              : undefined,
            isFetching: queryBalance.isFetching,
            error: queryBalance.error,
          });
        }
      }

      if ("bitcoin" in modularChainInfo) {
        if (account.bitcoinAddress) {
          const currency = modularChainInfo.bitcoin.currencies[0];
          const balance = this.bitcoinQueriesStore
            .get(modularChainInfo.chainId)
            .queryBitcoinBalance.getBalance(
              modularChainInfo.chainId,
              this.chainStore,
              account.bitcoinAddress.bech32Address,
              currency.coinMinimalDenom
            );
          if (balance) {
            tokensByChainId.get(chainIdentifier)!.push({
              chainInfo: modularChainInfo,
              token: balance.balance,
              price: this.priceStore.calculatePrice(balance.balance),
              isFetching: balance.isFetching,
              error: balance.error,
            });
          }

          if (modularChainInfo.linkedModularChainInfos) {
            for (const linkedChain of modularChainInfo.linkedModularChainInfos) {
              const linkedAccount = this.accountStore.getAccount(
                linkedChain.chainId
              );
              if (!linkedAccount.bitcoinAddress) {
                continue;
              }

              if (!("bitcoin" in linkedChain)) {
                continue;
              }

              const linkedCurrency = linkedChain.bitcoin.currencies[0];

              const balance = this.bitcoinQueriesStore
                .get(linkedChain.chainId)
                .queryBitcoinBalance.getBalance(
                  linkedChain.chainId,
                  this.chainStore,
                  linkedAccount.bitcoinAddress.bech32Address,
                  linkedCurrency.coinMinimalDenom
                );
              if (balance) {
                tokensByChainId.get(chainIdentifier)!.push({
                  chainInfo: linkedChain,
                  token: balance.balance,
                  price: this.priceStore.calculatePrice(balance.balance),
                  isFetching: balance.isFetching,
                  error: balance.error,
                });
              }
            }
          }
        }
      }
    }

    for (const [chainId, tokens] of tokensByChainId.entries()) {
      tokensByChainId.set(
        chainId,
        tokens.sort((a, b) => this.sortByPrice(a, b))
      );
    }

    runInAction(() => {
      this.allTokenMapByChainIdentifierState.map = tokensByChainId;
    });
  }

  @computed
  get allKnownBalances(): ReadonlyArray<ViewToken> {
    return this.balanceBinarySort.arr;
  }

  getAllBalances = computedFn(
    ({
      allowIBCToken,
      enableFilterDisabledAssetToken = true,
    }: {
      allowIBCToken?: boolean;
      enableFilterDisabledAssetToken?: boolean;
    }): ReadonlyArray<ViewToken> => {
      const keys: Map<string, boolean> = new Map();

      const disabledViewAssetTokenMap =
        this.uiConfigStore.manageViewAssetTokenConfig.getViewAssetTokenMapByVaultId(
          this.keyRingStore.selectedKeyInfo?.id ?? ""
        );
      for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
        if ("cosmos" in modularChainInfo) {
          const chainInfo = this.chainStore.getChain(modularChainInfo.chainId);
          for (const currency of chainInfo.currencies) {
            const denomHelper = new DenomHelper(currency.coinMinimalDenom);
            if (
              !allowIBCToken &&
              denomHelper.type === "native" &&
              denomHelper.denom.startsWith("ibc/")
            ) {
              continue;
            }

            const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
            keys.set(key, true);
          }
        }
        if ("starknet" in modularChainInfo || "bitcoin" in modularChainInfo) {
          const module =
            "starknet" in modularChainInfo ? "starknet" : "bitcoin";

          const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
            modularChainInfo.chainId
          );
          for (const currency of modularChainInfoImpl.getCurrencies(module)) {
            const key = `${
              ChainIdHelper.parse(modularChainInfo.chainId).identifier
            }/${currency.coinMinimalDenom}`;
            keys.set(key, true);
          }
        }
      }
      return this.balanceBinarySort.arr.filter((viewToken) => {
        const key = viewToken[BinarySortArray.SymbolKey];
        if (enableFilterDisabledAssetToken) {
          const chainIdentifier = ChainIdHelper.parse(
            viewToken.chainInfo.chainId
          ).identifier;
          const disabledCoinSet =
            disabledViewAssetTokenMap.get(chainIdentifier);
          const isDisabled = disabledCoinSet?.has(
            viewToken.token.currency.coinMinimalDenom
          );

          if (isDisabled) return false;
        }
        return keys.get(key);
      });
    }
  );

  filterLowBalanceTokens = computedFn(
    (
      viewTokens: ReadonlyArray<ViewToken>
    ): {
      filteredTokens: ViewToken[];
      lowBalanceTokens: ViewToken[];
    } => {
      const lowBalanceTokens: ViewToken[] = [];
      const filteredTokens = viewTokens.filter((viewToken) => {
        // Hide the unknown ibc tokens.
        if (
          "paths" in viewToken.token.currency &&
          !viewToken.token.currency.originCurrency
        ) {
          lowBalanceTokens.push(viewToken);
          return false;
        }

        // If currency has coinGeckoId, hide the low price tokens (under $1)
        if (viewToken.token.currency.coinGeckoId != null) {
          const isNotLowPrice =
            this.priceStore
              .calculatePrice(viewToken.token, "usd")
              ?.toDec()
              .gte(new Dec("1")) ?? false;

          if (!isNotLowPrice) {
            lowBalanceTokens.push(viewToken);
          }
          return isNotLowPrice;
        }

        // Else, hide the low balance tokens (under 0.001)
        const isNotLowBalance = viewToken.token.toDec().gte(new Dec("0.001"));
        if (!isNotLowBalance) {
          lowBalanceTokens.push(viewToken);
        }
        return isNotLowBalance;
      });

      return {
        filteredTokens,
        lowBalanceTokens,
      };
    }
  );

  // CHECK: starknet 스테이킹 관련 로직 추가 필요 여부.
  //        현재 익스텐션에서 stakables, notStakbles, ibcTokens, claimableRewards를 참조하는 곳은 없음.
  @computed
  get stakables(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      if (!chainInfo.stakeCurrency) {
        continue;
      }
      const key = `${chainInfo.chainIdentifier}/${chainInfo.stakeCurrency.coinMinimalDenom}`;
      keys.set(key, true);
    }

    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get notStakbles(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        if (
          currency.coinMinimalDenom ===
          chainInfo.stakeCurrency?.coinMinimalDenom
        ) {
          continue;
        }
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          continue;
        }

        const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
        keys.set(key, true);
      }
    }
    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @computed
  get ibcTokens(): ViewToken[] {
    const keys: Map<string, boolean> = new Map();
    for (const chainInfo of this.chainStore.chainInfosInUI) {
      for (const currency of chainInfo.currencies) {
        const denomHelper = new DenomHelper(currency.coinMinimalDenom);
        if (
          denomHelper.type === "native" &&
          denomHelper.denom.startsWith("ibc/")
        ) {
          const key = `${chainInfo.chainIdentifier}/${currency.coinMinimalDenom}`;
          keys.set(key, true);
        }
      }
    }
    return this.balanceBinarySort.arr.filter((viewToken) => {
      const key = viewToken[BinarySortArray.SymbolKey];
      return keys.get(key);
    });
  }

  @action
  protected updateDelegations(): void {
    const prevKeyMap = new Map(this.delegationBinarySort.indexForKeyMap());

    for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
      const account = this.accountStore.getAccount(modularChainInfo.chainId);

      if ("cosmos" in modularChainInfo) {
        if (account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryDelegation =
          queries.cosmos.queryDelegations.getQueryBech32Address(
            account.bech32Address
          );
        if (!queryDelegation.total) {
          continue;
        }

        const chainInfo = this.chainStore.getChain(modularChainInfo.chainId);

        const key = `${modularChainInfo.chainId}/${account.bech32Address}`;
        prevKeyMap.delete(key);
        this.delegationBinarySort.pushAndSort(key, {
          chainInfo,
          token: queryDelegation.total,
          price: this.priceStore.calculatePrice(queryDelegation.total),
          isFetching: queryDelegation.isFetching,
          error: queryDelegation.error,
          stakingUrl: chainInfo.walletUrlForStaking,
        });
      }

      if ("starknet" in modularChainInfo) {
        if (account.starknetHexAddress === "") {
          continue;
        }

        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const queryStakingInfo = queries.stakingInfoManager.getStakingInfo(
          account.starknetHexAddress
        );

        const totalStakedAmount = queryStakingInfo.totalStakedAmount;
        if (!totalStakedAmount) {
          continue;
        }

        const key = `${modularChainInfo.chainId}/${account.starknetHexAddress}`;
        prevKeyMap.delete(key);
        this.delegationBinarySort.pushAndSort(key, {
          chainInfo: modularChainInfo,
          token: totalStakedAmount,
          price: this.priceStore.calculatePrice(totalStakedAmount),
          isFetching: queryStakingInfo.isFetching,
          error: queryStakingInfo.error,
          stakingUrl: "https://dashboard.endur.fi/stake",
        });
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.delegationBinarySort.remove(removedKey);
    }
  }

  @computed
  get delegations(): ReadonlyArray<ViewStakedToken> {
    return this.delegationBinarySort.arr;
  }

  @action
  protected updateUnbondings(): void {
    const prevKeyMap = new Map(this.unbondingBinarySort.indexForKeyMap());

    for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
      const account = this.accountStore.getAccount(modularChainInfo.chainId);

      if ("cosmos" in modularChainInfo) {
        if (account.bech32Address === "") {
          continue;
        }

        const chainInfo = this.chainStore.getChain(modularChainInfo.chainId);

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryUnbonding =
          queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
            account.bech32Address
          );

        for (let i = 0; i < queryUnbonding.unbondings.length; i++) {
          const unbonding = queryUnbonding.unbondings[i];
          for (let j = 0; j < unbonding.entries.length; j++) {
            const entry = unbonding.entries[j];
            if (!chainInfo.stakeCurrency) {
              continue;
            }
            const balance = new CoinPretty(
              chainInfo.stakeCurrency,
              entry.balance
            );

            const key = `${chainInfo.chainId}/${account.bech32Address}/${i}/${j}`;
            prevKeyMap.delete(key);
            this.unbondingBinarySort.pushAndSort(key, {
              chainInfo,
              token: balance,
              price: this.priceStore.calculatePrice(balance),
              isFetching: queryUnbonding.isFetching,
              error: queryUnbonding.error,
              completeTime: entry.completion_time,
              stakingUrl: chainInfo.walletUrlForStaking,
            });
          }
        }
      }

      if ("starknet" in modularChainInfo) {
        if (account.starknetHexAddress === "") {
          continue;
        }

        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const queryUnbonding = queries.stakingInfoManager.getStakingInfo(
          account.starknetHexAddress
        );

        const unbondingsData = queryUnbonding.unbondings;
        if (!unbondingsData || unbondingsData.unbondings.length === 0) {
          continue;
        }

        for (const unbonding of unbondingsData.unbondings) {
          const key = `${modularChainInfo.chainId}/${account.starknetHexAddress}/${unbonding.validatorAddress}`;
          prevKeyMap.delete(key);
          this.unbondingBinarySort.pushAndSort(key, {
            chainInfo: modularChainInfo,
            token: unbonding.amount,
            price: this.priceStore.calculatePrice(unbonding.amount),
            completeTime: unbonding.completeTime * 1000, // required to convert unix timestamp to ms or iso string
            isFetching: queryUnbonding.isFetching,
            error: queryUnbonding.error,
            stakingUrl: "https://dashboard.endur.fi/stake",
            omitCompleteTimeFraction: true, // endur.fi와 동일하게 표기하기 위한 옵션
          });
        }
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.unbondingBinarySort.remove(removedKey);
    }
  }

  @computed
  get unbondings(): ReadonlyArray<ViewUnbondingToken> {
    return this.unbondingBinarySort.arr;
  }

  @action
  protected updateClaimableRewards(): void {
    const prevKeyMap = new Map(
      this.claimableRewardsBinarySort.indexForKeyMap()
    );

    for (const chainInfo of this.chainStore.chainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      if (account.bech32Address === "") {
        continue;
      }
      const queries = this.queriesStore.get(chainInfo.chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );

      if (
        queryRewards.stakableReward &&
        queryRewards.stakableReward.toDec().gt(new Dec(0))
      ) {
        const key = `${chainInfo.chainId}/${account.bech32Address}`;
        prevKeyMap.delete(key);
        this.claimableRewardsBinarySort.pushAndSort(key, {
          chainInfo,
          token: queryRewards.stakableReward,
          price: this.priceStore.calculatePrice(queryRewards.stakableReward),
          isFetching: queryRewards.isFetching,
          error: queryRewards.error,
        });
      }
    }

    for (const removedKey of prevKeyMap.keys()) {
      this.claimableRewardsBinarySort.remove(removedKey);
    }
  }

  @computed
  get claimableRewards(): ReadonlyArray<ViewRewardToken> {
    return this.claimableRewardsBinarySort.arr;
  }

  protected sortByPrice(a: ViewToken, b: ViewToken): number {
    const aPrice = a.price?.toDec() ?? HugeQueriesStore.zeroDec;
    const bPrice = b.price?.toDec() ?? HugeQueriesStore.zeroDec;

    if (aPrice.equals(bPrice)) {
      if (aPrice.equals(HugeQueriesStore.zeroDec)) {
        const aHasBalance = a.token.toDec().gt(HugeQueriesStore.zeroDec);
        const bHasBalance = b.token.toDec().gt(HugeQueriesStore.zeroDec);

        if (aHasBalance && !bHasBalance) {
          return -1;
        } else if (!aHasBalance && bHasBalance) {
          return 1;
        } else {
          return 0;
        }
      }
      return 0;
    } else if (aPrice.gt(bPrice)) {
      return -1;
    } else {
      return 1;
    }
  }

  @computed
  get groupedTokensMap(): Map<string, ViewToken[]> {
    const tokensMap = new Map<string, ViewToken[]>();

    for (const viewToken of this.allKnownBalances) {
      const currency = viewToken.token.currency;

      if (
        "paths" in currency &&
        currency.originChainId &&
        currency.originCurrency?.coinMinimalDenom
      ) {
        // IBC
        const originChainId = currency.originChainId;
        const coinMinimalDenom = currency.originCurrency.coinMinimalDenom;

        const groupKey = `${originChainId}/${coinMinimalDenom}`;

        if (!tokensMap.has(groupKey)) {
          tokensMap.set(groupKey, []);
        }

        tokensMap.get(groupKey)!.push(viewToken);
      }

      // TODO: EVM 토큰 처리
      else {
        const groupKey = `${viewToken.chainInfo.chainId}/${currency.coinMinimalDenom}`;

        if (!tokensMap.has(groupKey)) {
          tokensMap.set(groupKey, [viewToken]);
        }
      }
    }

    return tokensMap;
  }
}
