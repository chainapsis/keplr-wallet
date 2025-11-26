import { ChainStore } from "../chain";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  IAccountStore,
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
import {
  AppCurrency,
  IBCCurrency,
  ModularChainInfo,
} from "@keplr-wallet/types";
import { BitcoinQueriesStore } from "@keplr-wallet/stores-bitcoin";
import { UIConfigStore } from "../ui-config";
import { KeyRingStore, TokensStore } from "@keplr-wallet/stores-core";
import { AllTokenMapByChainIdentifierState } from "./all-token-map-state";
import { Asset, SkipQueries } from "@keplr-wallet/stores-internal";
import { getBabylonUnbondingRemainingTime } from "../../utils/get-babylon-unbonding-remaining-time";
import { INITIA_CHAIN_ID } from "../../config.ui";

interface ViewToken {
  chainInfo: ModularChainInfo;
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
    protected readonly keyRingStore: KeyRingStore,
    protected readonly skipQueriesStore: SkipQueries,
    protected readonly tokensStore: TokensStore
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

      const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
        modularChainInfo.chainId
      );

      if ("evm" in modularChainInfo) {
        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryEthereumHexAddress(
          account.ethereumHexAddress
        );

        // 외부에 요청된 balance를 기다려야 modularChainInfoImpl.getCurrenciesByModule("evm")에서 currencies 목록을 전부 얻을 수 있다.
        queryBalance.balances.forEach((b) => b.waitResponse());

        const currencies = modularChainInfoImpl.getCurrenciesByModule("evm");

        for (const currency of currencies) {
          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;

          if (!keysUsed.get(key)) {
            const balance = queryBalance.getBalance(currency);

            if (balance) {
              if (
                balance.balance.toDec().isZero() &&
                !this.tokensStore.tokenIsRegistered(
                  modularChainInfo.chainId,
                  currency.coinMinimalDenom
                )
              ) {
                continue;
              }

              keysUsed.set(key, true);
              prevKeyMap.delete(key);
              this.balanceBinarySort.pushAndSort(key, {
                chainInfo: modularChainInfo,
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

      if ("cosmos" in modularChainInfo) {
        const cosmosChainInfo = modularChainInfo.cosmos;

        if (!cosmosChainInfo || account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryBech32Address(
          account.bech32Address
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("cosmos"),
        ];

        for (const currency of currencies) {
          if (cosmosChainInfo.bech32Config) {
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

          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;
          if (!keysUsed.get(key)) {
            if (
              cosmosChainInfo.stakeCurrency?.coinMinimalDenom ===
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
                chainInfo: modularChainInfo,
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
                    (denomHelper.type === "erc20" &&
                      !this.tokensStore.tokenIsRegistered(
                        modularChainInfo.chainId,
                        denomHelper.denom
                      ))
                  ) {
                    // However, if currency is native currency and not ibc, and same with currencies[0],
                    // just show it as 0 balance.
                    if (
                      cosmosChainInfo.currencies.length > 0 &&
                      cosmosChainInfo.currencies[0].coinMinimalDenom ===
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
                  chainInfo: modularChainInfo,
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

        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const currencies =
          modularChainInfoImpl.getCurrenciesByModule("starknet");

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
              queryBalance.balance.toDec().equals(HugeQueriesStore.zeroDec) &&
              !this.tokensStore.tokenIsRegistered(
                modularChainInfo.chainId,
                currency.coinMinimalDenom
              )
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

        const queries = this.bitcoinQueriesStore.get(modularChainInfo.chainId);
        const currencies =
          modularChainInfoImpl.getCurrenciesByModule("bitcoin");

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

      const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
        modularChainInfo.chainId
      );

      if ("evm" in modularChainInfo && !("cosmos" in modularChainInfo)) {
        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryEthereumHexAddress(
          account.ethereumHexAddress
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("evm"),
        ];

        for (const currency of currencies) {
          const balance = queryBalance.getBalance(currency);
          if (!balance) {
            continue;
          }

          const denomHelper = new DenomHelper(currency.coinMinimalDenom);

          if (
            balance.balance.toDec().equals(HugeQueriesStore.zeroDec) &&
            (denomHelper.type === "native" || denomHelper.type === "erc20")
          ) {
            continue;
          }

          tokensByChainId.get(chainIdentifier)!.push({
            chainInfo: modularChainInfo,
            token: balance.balance,
            price: currency.coinGeckoId
              ? this.priceStore.calculatePrice(balance.balance)
              : undefined,
            isFetching: balance.isFetching,
            error: balance.error,
          });
        }
      }
      if ("cosmos" in modularChainInfo) {
        const cosmosChainInfo = modularChainInfo.cosmos;

        if (!cosmosChainInfo || account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryBalance = queries.queryBalances.getQueryBech32Address(
          account.bech32Address
        );

        const currencies = [
          ...modularChainInfoImpl.getCurrenciesByModule("cosmos"),
        ];

        for (const currency of currencies) {
          if (
            cosmosChainInfo.stakeCurrency?.coinMinimalDenom ===
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
              chainInfo: modularChainInfo,
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
                    cosmosChainInfo.currencies.length > 0 &&
                    cosmosChainInfo.currencies[0].coinMinimalDenom ===
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
                chainInfo: modularChainInfo,
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

        const queries = this.starknetQueriesStore.get(modularChainInfo.chainId);
        const currencies =
          modularChainInfoImpl.getCurrenciesByModule("starknet");

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
        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId
        ).identifier;

        if ("cosmos" in modularChainInfo) {
          const currencies = this.chainStore
            .getModularChainInfoImpl(modularChainInfo.chainId)
            .getCurrenciesByModule("cosmos");

          for (const currency of currencies) {
            const denomHelper = new DenomHelper(currency.coinMinimalDenom);
            if (
              !allowIBCToken &&
              denomHelper.type === "native" &&
              denomHelper.denom.startsWith("ibc/")
            ) {
              continue;
            }

            const key = `${chainIdentifier}/${currency.coinMinimalDenom}`;
            keys.set(key, true);
          }
        }

        const modularChainInfoImpl = this.chainStore.getModularChainInfoImpl(
          modularChainInfo.chainId
        );
        for (const currency of modularChainInfoImpl.getCurrencies()) {
          const key = `${
            ChainIdHelper.parse(modularChainInfo.chainId).identifier
          }/${currency.coinMinimalDenom}`;
          keys.set(key, true);
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

        // Else, if testnet hide all tokens
        if (
          "isTestnet" in viewToken.chainInfo &&
          viewToken.chainInfo.isTestnet
        ) {
          lowBalanceTokens.push(viewToken);
          return false;
        }

        if (viewToken.token.currency.coinGeckoId == null) {
          // Else, hide the low balance tokens (under 0.001)
          const isNotLowBalance = viewToken.token.toDec().gte(new Dec("0.001"));
          if (!isNotLowBalance) {
            lowBalanceTokens.push(viewToken);
          }
          return isNotLowBalance;
        }

        return true;
      });

      return {
        filteredTokens,
        lowBalanceTokens,
      };
    }
  );

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

    for (const modularChainInfo of this.chainStore.modularChainInfosInUI) {
      if ("starknet" in modularChainInfo) {
        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId
        ).identifier;
        const strkContractAddress =
          modularChainInfo.starknet.strkContractAddress;
        const strkKey = `${chainIdentifier}/erc20:${strkContractAddress.toLowerCase()}`;
        keys.set(strkKey, true);
      }
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
        const isEVMOnly = this.chainStore.isEvmOnlyChain(
          modularChainInfo.chainId
        );
        if (isEVMOnly || account.bech32Address === "") {
          continue;
        }

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const isInitia = modularChainInfo.chainId === INITIA_CHAIN_ID;
        const queryDelegation = isInitia
          ? queries.cosmos.queryInitiaDelegations.getQueryBech32Address(
              account.bech32Address
            )
          : queries.cosmos.queryDelegations.getQueryBech32Address(
              account.bech32Address
            );
        if (!queryDelegation.total) {
          continue;
        }

        const key = `${modularChainInfo.chainId}/${account.bech32Address}`;
        prevKeyMap.delete(key);
        this.delegationBinarySort.pushAndSort(key, {
          chainInfo: modularChainInfo,
          token: queryDelegation.total,
          price: this.priceStore.calculatePrice(queryDelegation.total),
          isFetching: queryDelegation.isFetching,
          error: queryDelegation.error,
          stakingUrl: modularChainInfo.cosmos.walletUrlForStaking,
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
        const isEVMOnly = this.chainStore.isEvmOnlyChain(
          modularChainInfo.chainId
        );
        if (isEVMOnly || account.bech32Address === "") {
          continue;
        }

        const chainIdentifier = ChainIdHelper.parse(
          modularChainInfo.chainId
        ).identifier;
        const isBabylon = chainIdentifier === "bbn";

        const queries = this.queriesStore.get(modularChainInfo.chainId);
        const queryUnbonding =
          modularChainInfo.chainId === INITIA_CHAIN_ID
            ? queries.cosmos.queryInitiaUnbondingDelegations.getQueryBech32Address(
                account.bech32Address
              )
            : queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
                account.bech32Address
              );

        for (let i = 0; i < queryUnbonding.unbondings.length; i++) {
          const unbonding = queryUnbonding.unbondings[i];
          for (let j = 0; j < unbonding.entries.length; j++) {
            const entry = unbonding.entries[j];
            if (!modularChainInfo.cosmos.stakeCurrency) {
              continue;
            }
            const balance = new CoinPretty(
              modularChainInfo.cosmos.stakeCurrency,
              entry.balance
            );

            const key = `${modularChainInfo.chainId}/${account.bech32Address}/${i}/${j}`;
            prevKeyMap.delete(key);
            this.unbondingBinarySort.pushAndSort(key, {
              chainInfo: modularChainInfo,
              token: balance,
              price: this.priceStore.calculatePrice(balance),
              isFetching: queryUnbonding.isFetching,
              error: queryUnbonding.error,
              completeTime: isBabylon
                ? getBabylonUnbondingRemainingTime(
                    this.queriesStore.simpleQuery,
                    modularChainInfo.cosmos.rest,
                    entry.creation_height
                  )
                : entry.completion_time,
              stakingUrl: modularChainInfo.cosmos.walletUrlForStaking,
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

    for (const chainInfo of this.chainStore.modularChainInfosInUI) {
      const account = this.accountStore.getAccount(chainInfo.chainId);
      const isEVMOnly = this.chainStore.isEvmOnlyChain(chainInfo.chainId);
      if (isEVMOnly || account.bech32Address === "") {
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
          chainInfo: chainInfo,
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

  // 그룹화 로직
  // 1. 먼저 IBC 토큰들을 originChainId와 originCurrency.coinMinimalDenom으로 그룹화
  // 2. ERC20 토큰 처리:
  //    - 토큰의 minimalDenom이 erc20:으로 시작하고, 그 뒤의 contractAddress가 skip asset의 contractAddress와 일치하면 정상 ERC20 토큰으로 간주
  //    - 토큰의 recommendedSymbol이 이미 존재하는 그룹의 originCurrency.coinDenom과 일치하거나(ERC20 & IBC 혼합 그룹),
  //    - 토큰의 recommendedSymbol이 이미 존재하는 그룹의 coinDenom과 일치하면(ERC20 그룹) 해당 그룹에 추가
  //    - 일치하는 그룹이 없으면 recommendedSymbol을 키로 새 그룹 생성
  // 3. BTC 토큰들은 linkedChainKey를 키로 그룹화
  // 4. 나머지 Unknown 토큰들은 단일 그룹으로 처리
  @computed
  get groupedTokensMap(): Map<string, ViewToken[]> {
    const tokensMap = new Map<string, ViewToken[]>();
    const processedTokens = new Map<ViewToken, boolean>();
    const allKnownBalances = this.getAllBalances({
      allowIBCToken: true,
    });

    // IBC
    for (const viewToken of allKnownBalances) {
      const currency = viewToken.token.currency;

      if (
        "paths" in currency &&
        currency.originChainId &&
        currency.originCurrency?.coinMinimalDenom
      ) {
        const originChainId = currency.originChainId;
        const coinMinimalDenom = currency.originCurrency.coinMinimalDenom;

        const groupKey = `${originChainId}/${coinMinimalDenom}`;

        if (!tokensMap.has(groupKey)) {
          tokensMap.set(groupKey, []);
        }

        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // ERC20
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      const chainId = viewToken.chainInfo.chainId;

      const erc20Asset = this.getErc20AssetForToken(chainId, currency);

      if (erc20Asset && erc20Asset.recommendedSymbol && currency.coinGeckoId) {
        const groupKey = this.findERC20GroupKey(
          erc20Asset.recommendedSymbol,
          currency.coinGeckoId,
          tokensMap
        );

        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // ETH
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      if (currency.coinDenom === "ETH" && currency.coinGeckoId === "ethereum") {
        const groupKey = `${currency.coinGeckoId}`;
        this.addTokenToGroup(groupKey, viewToken, tokensMap);
        processedTokens.set(viewToken, true);
      }
    }

    // BTC
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const modularChainInfo = viewToken.chainInfo;
      if ("bitcoin" in modularChainInfo) {
        const groupKey = this.findBitcoinGroupKey(modularChainInfo.chainId);

        if (groupKey) {
          if (!tokensMap.has(groupKey)) {
            tokensMap.set(groupKey, []);
          }

          this.addTokenToGroup(groupKey, viewToken, tokensMap);
          processedTokens.set(viewToken, true);
        }
      }
    }

    // Unknown
    for (const viewToken of allKnownBalances) {
      if (processedTokens.has(viewToken)) {
        continue;
      }

      const currency = viewToken.token.currency;
      const chainId = viewToken.chainInfo.chainId;
      const coinMinimalDenom = currency.coinMinimalDenom;

      this.addTokenToGroup(
        `${chainId}/${coinMinimalDenom}`,
        viewToken,
        tokensMap
      );
    }

    for (const tokens of tokensMap.values()) {
      tokens.sort(this.sortByPrice);
    }

    const sortedEntries = Array.from(tokensMap.entries()).sort(
      ([, tokensA], [, tokensB]) => this.sortTokenGroups(tokensA, tokensB)
    );

    return new Map(sortedEntries);
  }

  protected sortTokenGroups = (
    tokensA: ViewToken[],
    tokensB: ViewToken[]
  ): number => {
    let valueA = new Dec(0);
    let valueB = new Dec(0);

    let aHasBalance = false;
    let bHasBalance = false;

    for (const token of tokensA) {
      if (token.price) {
        valueA = valueA.add(token.price.toDec());
      }

      if (
        (!token.price ||
          token.price.toDec().equals(HugeQueriesStore.zeroDec)) &&
        token.token.toDec().gt(HugeQueriesStore.zeroDec)
      ) {
        aHasBalance = true;
      }
    }

    for (const token of tokensB) {
      if (token.price) {
        valueB = valueB.add(token.price.toDec());
      }

      if (
        (!token.price ||
          token.price.toDec().equals(HugeQueriesStore.zeroDec)) &&
        token.token.toDec().gt(HugeQueriesStore.zeroDec)
      ) {
        bHasBalance = true;
      }
    }

    if (valueA.equals(valueB)) {
      if (valueA.equals(HugeQueriesStore.zeroDec)) {
        if (aHasBalance && !bHasBalance) {
          return -1;
        } else if (!aHasBalance && bHasBalance) {
          return 1;
        } else {
          return 0;
        }
      }
      return 0;
    } else if (valueA.gt(valueB)) {
      return -1;
    } else {
      return 1;
    }
  };

  protected getIBCAssetForToken = computedFn(
    (currency: IBCCurrency): Asset | undefined => {
      const originChainId = currency.originChainId;
      const coinMinimalDenom = currency.originCurrency?.coinMinimalDenom;

      if (!originChainId || !coinMinimalDenom) {
        return undefined;
      }

      return this.skipQueriesStore.queryAssets
        .getAssets(originChainId)
        .assetsRaw.find((asset) => asset.originDenom === coinMinimalDenom);
    }
  );

  protected getErc20AssetForToken = computedFn(
    (chainId: string, currency: AppCurrency): Asset | undefined => {
      if (!currency.coinMinimalDenom.startsWith("erc20:")) {
        return undefined;
      }

      return this.skipQueriesStore.queryAssets
        .getAssets(chainId)
        .assetsRaw.find(
          (asset) =>
            asset.tokenContract?.toLowerCase() ===
            currency.coinMinimalDenom.split(":")[1].toLowerCase()
        );
    }
  );

  protected findBitcoinGroupKey = computedFn(
    (chainId: string): string | undefined => {
      const groupedModularChainInfo =
        this.chainStore.groupedModularChainInfos.find(
          (group) =>
            "linkedChainKey" in group &&
            group.linkedChainKey &&
            (group.chainId === chainId ||
              (group.linkedModularChainInfos &&
                group.linkedModularChainInfos.some(
                  (linkedChain) => linkedChain.chainId === chainId
                )))
        );

      if (
        groupedModularChainInfo &&
        "linkedChainKey" in groupedModularChainInfo
      ) {
        return `btc:${groupedModularChainInfo.linkedChainKey}`;
      }

      return undefined;
    }
  );

  protected findERC20GroupKey(
    recommendedSymbol: string,
    coinGeckoId: string,
    tokensMap: Map<string, ViewToken[]>
  ): string {
    for (const [key, viewTokens] of tokensMap.entries()) {
      if (viewTokens.length === 0) continue;

      const tokenCurrency = viewTokens[0].token.currency;

      if ("paths" in tokenCurrency) {
        const ibcAsset = this.getIBCAssetForToken(tokenCurrency);

        if (
          ibcAsset?.recommendedSymbol === recommendedSymbol &&
          tokenCurrency.coinGeckoId === coinGeckoId
        ) {
          return key;
        }
      }
    }

    return `erc20:${recommendedSymbol}/${coinGeckoId}`;
  }

  protected addTokenToGroup(
    groupKey: string,
    token: ViewToken,
    tokensMap: Map<string, ViewToken[]>
  ): void {
    if (!tokensMap.has(groupKey)) {
      tokensMap.set(groupKey, []);
    }

    tokensMap.get(groupKey)!.push(token);
  }
}
