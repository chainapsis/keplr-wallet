import { Env, KeplrError } from "@keplr-wallet/router";
import {
  AppCurrency,
  ChainInfo,
  CW20Currency,
  Secret20Currency,
} from "@keplr-wallet/types";
import {
  CW20CurrencySchema,
  Secret20CurrencySchema,
} from "@keplr-wallet/chain-validator";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainsService } from "../chains";
import { KVStore, PrefixKVStore } from "@keplr-wallet/common";
import { InteractionService } from "../interaction";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { computedFn } from "mobx-utils";
import { TokenInfo } from "./types";
import { Buffer } from "buffer/";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

const REFRESH_TIME_INTERVAL = 1000 * 30 * 60 * 24; // 24 hours
export class TokenCW20Service {
  protected readonly legacyKVStore: KVStore;
  protected readonly kvStore: KVStore;

  @observable
  protected tokenMap: Map<string, TokenInfo[]> = new Map();

  constructor(
    kvStore: KVStore,
    protected chainsService: ChainsService,
    protected interactionService: InteractionService,
    protected tokenContractListURL: string
  ) {
    this.legacyKVStore = kvStore;
    this.kvStore = new PrefixKVStore(kvStore, "v2");

    makeObservable(this);
  }

  async init(): Promise<void> {
    const migrated = await this.kvStore.get<boolean>("migrated/v2");
    if (!migrated) {
      for (const chainInfo of this.chainsService.getModularChainInfos()) {
        const identifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
        const globalTokens = await this.legacyKVStore.get<AppCurrency[]>(
          identifier
        );
        if (globalTokens && globalTokens.length > 0) {
          this.tokenMap.set(
            identifier,
            globalTokens.map((currency) => {
              return {
                currency,
              };
            })
          );
        }

        const reverseAddresses = await this.legacyKVStore.get<string[]>(
          `${identifier}-addresses`
        );
        if (reverseAddresses && reverseAddresses.length > 0) {
          for (const reverseAddress of reverseAddresses) {
            const currencies = await this.legacyKVStore.get<AppCurrency[]>(
              `${identifier}-${reverseAddress}`
            );
            if (currencies && currencies.length > 0) {
              this.tokenMap.set(
                identifier,
                currencies.map((currency) => {
                  return {
                    associatedAccountAddress: reverseAddress,
                    currency,
                  };
                })
              );
            }
          }
        }
      }

      await this.kvStore.set<boolean>("migrated/v2", true);
    }

    {
      const saved = await this.kvStore.get<Record<string, TokenInfo[]>>(
        "tokenMap"
      );
      if (saved) {
        const refreshInInitTimestamp = await this.kvStore.get<number>(
          "refreshInInitTimestamp"
        );
        const now = Date.now();
        const shouldRefresh =
          !refreshInInitTimestamp ||
          refreshInInitTimestamp + REFRESH_TIME_INTERVAL < now;

        for (const [key, value] of Object.entries(saved)) {
          this.tokenMap.set(key, value);
          if (shouldRefresh) {
            this.refreshTokenInfo(key);
          }
        }

        if (shouldRefresh) {
          this.kvStore.set<number>("refreshInInitTimestamp", now);
        }
      }
      autorun(() => {
        const js = toJS(this.tokenMap);
        const obj = Object.fromEntries(js);
        this.kvStore.set<Record<string, TokenInfo[]>>("tokenMap", obj);
      });
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
    runInAction(() => {
      this.tokenMap.delete(chainIdentifier);
    });
  };

  protected async refreshTokenInfo(chainIdentifier: string) {
    const tokenContracts = await simpleFetch<
      {
        contractAddress: string;
        imageUrl?: string;
        metadata: {
          name: string;
          symbol: string;
          decimals: number;
        };
        coinGeckoId?: string;
      }[]
    >(`${this.tokenContractListURL}/tokens/${chainIdentifier}`);

    const tokens = this.tokenMap.get(chainIdentifier);
    if (!tokens) {
      return;
    }

    runInAction(() => {
      const refreshedTokens = tokens.map((token) => {
        if ("contractAddress" in token.currency) {
          const tokenContractFound = tokenContracts.data?.find(
            (tokenContract) =>
              "contractAddress" in token.currency &&
              token.currency.contractAddress === tokenContract.contractAddress
          );

          if (tokenContractFound) {
            return {
              ...token,
              currency: {
                ...token.currency,
                coinImageUrl: tokenContractFound.imageUrl,
                coinGeckoId: tokenContractFound.coinGeckoId,
              },
            };
          }
        }

        return token;
      });

      this.tokenMap.set(chainIdentifier, refreshedTokens);
    });
  }

  getAllTokenInfos = computedFn((): Record<string, TokenInfo[] | undefined> => {
    const js = toJS(this.tokenMap);
    return Object.fromEntries(js);
  });

  protected validateAssociatedAccountAddress(value: string) {
    if (!value) {
      throw new Error("Please provide the associated account address");
    }

    if (Buffer.from(value, "hex").toString("hex") !== value) {
      throw new Error("Invalid associated account address");
    }
  }

  protected validateChainInfoFeatures(chainInfo: ChainInfo) {
    if (
      !chainInfo.features ||
      !(
        chainInfo.features.includes("cosmwasm") ||
        chainInfo.features.includes("secretwasm")
      )
    ) {
      throw new Error("The chain doesn't support cosmwasm");
    }
  }

  async suggestToken(
    env: Env,
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string,
    viewingKey?: string
  ) {
    this.validateAssociatedAccountAddress(associatedAccountAddress);
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("cosmos" in chainInfo)) {
      throw new Error(`${chainId} is not a cosmos chain`);
    }

    this.validateChainInfoFeatures(chainInfo.cosmos);

    const existing = this.getToken(
      chainId,
      contractAddress,
      associatedAccountAddress
    );

    // If the same currency is already registered, do nothing.
    if (existing) {
      // If the secret20 token,
      // just try to change the viewing key.
      if (viewingKey) {
        if (
          "type" in existing.currency &&
          existing.currency.type === "secret20" &&
          existing.currency.viewingKey !== viewingKey
        ) {
          await this.setToken(
            chainId,
            {
              ...existing.currency,
              viewingKey,
            },
            associatedAccountAddress
          );
        }
        return;
      }
      return;
    }

    // Validate the contract address.
    Bech32Address.validate(
      contractAddress,
      chainInfo.cosmos.bech32Config?.bech32PrefixAccAddr
    );

    const params = {
      chainId,
      contractAddress,
      viewingKey,
    };

    const appCurrency = (await this.interactionService.waitApprove(
      env,
      `/setting/token/add`,
      "suggest-token-cw20",
      params
    )) as AppCurrency;

    await this.setToken(chainId, appCurrency, associatedAccountAddress);
  }

  getToken = computedFn(
    (
      chainId: string,
      contractAddress: string,
      // Should be hex encoded. (not bech32)
      associatedAccountAddress: string
    ): TokenInfo | undefined => {
      const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
      const tokens = this.tokenMap.get(chainIdentifier);
      if (!tokens) {
        return undefined;
      }
      return tokens.find((token) => {
        if (
          token.associatedAccountAddress &&
          token.associatedAccountAddress !== associatedAccountAddress
        ) {
          return false;
        }

        if ("contractAddress" in token.currency) {
          return token.currency.contractAddress === contractAddress;
        }
        return false;
      });
    }
  );

  async setToken(
    chainId: string,
    currency: AppCurrency,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ): Promise<void> {
    this.validateAssociatedAccountAddress(associatedAccountAddress);
    const chainInfo = this.chainsService.getModularChainInfoOrThrow(chainId);
    if (!("cosmos" in chainInfo)) {
      throw new Error(`${chainId} is not a cosmos chain`);
    }

    this.validateChainInfoFeatures(chainInfo.cosmos);
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    if (!this.tokenMap.has(chainIdentifier)) {
      runInAction(() => {
        this.tokenMap.set(chainIdentifier, []);
      });
    }

    const tokens = this.tokenMap.get(chainIdentifier)!;

    currency = await TokenCW20Service.validateCurrency(
      chainInfo.cosmos,
      currency
    );

    if (
      !("type" in currency) ||
      (currency.type !== "cw20" && currency.type !== "secret20")
    ) {
      throw new Error("Unknown type of currency");
    }

    if (currency.type === "secret20" && !currency.viewingKey) {
      throw new Error("Viewing key must be set");
    }

    const contractAddress = currency.contractAddress;
    const needAssociateAccount = currency.type === "secret20";

    const find = tokens.find((token) => {
      if (
        token.associatedAccountAddress &&
        token.associatedAccountAddress !== associatedAccountAddress
      ) {
        return false;
      }

      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    runInAction(() => {
      if (find) {
        find.currency = currency;
      } else {
        tokens.push({
          associatedAccountAddress: needAssociateAccount
            ? associatedAccountAddress
            : undefined,
          currency,
        });
      }
    });

    this.refreshTokenInfo(chainIdentifier);
  }

  @action
  removeToken(
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ) {
    // 얘는 associatedAccountAddress가 empty string이더라도 허용된다.
    // tokenInfo 안에 contract address와 associatedAccountAddress가 존재하므로
    // 프론트에서 계정 초기화없이 token info만 보고 remove를 가능하게 하도록 하기 위함임.

    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const tokens = this.tokenMap.get(chainIdentifier);
    if (!tokens) {
      return;
    }
    const findIndex = tokens.findIndex((token) => {
      if (
        token.associatedAccountAddress &&
        token.associatedAccountAddress !== associatedAccountAddress
      ) {
        return false;
      }

      if ("contractAddress" in token.currency) {
        return token.currency.contractAddress === contractAddress;
      }
      return false;
    });

    if (findIndex >= 0) {
      tokens.splice(findIndex, 1);
    }
  }

  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string,
    // Should be hex encoded. (not bech32)
    associatedAccountAddress: string
  ): string {
    this.validateAssociatedAccountAddress(associatedAccountAddress);

    const token = this.getToken(
      chainId,
      contractAddress,
      associatedAccountAddress
    );

    if (token) {
      if ("type" in token.currency && token.currency.type === "secret20") {
        return token.currency.viewingKey;
      }
    }

    throw new KeplrError("token-cw20", 111, "There is no matched secret20");
  }

  static async validateCurrency(
    chainInfo: ChainInfo,
    currency: AppCurrency
  ): Promise<AppCurrency> {
    // Validate the schema.
    if ("type" in currency) {
      switch (currency.type) {
        case "cw20":
          currency = await TokenCW20Service.validateCW20Currency(
            chainInfo,
            currency
          );
          break;
        case "secret20":
          currency = await TokenCW20Service.validateSecret20Currency(
            chainInfo,
            currency
          );
          break;
        default:
          throw new KeplrError("tokens", 110, "Unknown type of currency");
      }
    } else {
      throw new Error("Unknown type of currency");
    }

    return currency;
  }

  static async validateCW20Currency(
    chainInfo: ChainInfo,
    currency: CW20Currency
  ): Promise<CW20Currency> {
    // Validate the schema.
    currency = await CW20CurrencySchema.validateAsync(currency);

    // Validate the contract address.
    Bech32Address.validate(
      currency.contractAddress,
      chainInfo.bech32Config?.bech32PrefixAccAddr
    );

    return currency;
  }

  static async validateSecret20Currency(
    chainInfo: ChainInfo,
    currency: Secret20Currency
  ): Promise<Secret20Currency> {
    // Validate the schema.
    currency = await Secret20CurrencySchema.validateAsync(currency);

    // Validate the contract address.
    Bech32Address.validate(
      currency.contractAddress,
      chainInfo.bech32Config?.bech32PrefixAccAddr
    );

    return currency;
  }
}
