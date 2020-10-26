import {
  AppCurrency,
  CW20Currency,
  Secret20Currency
} from "../../common/currency";
import {
  ChainInfo,
  CurrencySchema,
  CW20CurrencyShema,
  Secret20CurrencyShema
} from "../chains";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { ChainsKeeper } from "../chains/keeper";
import { KeyRingKeeper } from "../keyring/keeper";
import { KVStore } from "../../common/kvstore";
import { KeyRingStatus } from "../keyring";
import { ChainUpdaterKeeper } from "../updater/keeper";

const Buffer = require("buffer/").Buffer;

export class TokensKeeper {
  private chainsKeeper!: ChainsKeeper;
  private keyRingKeeper!: KeyRingKeeper;

  constructor(private readonly kvStore: KVStore) {}

  init(chainsKeeper: ChainsKeeper, keyRingKeeper: KeyRingKeeper) {
    this.chainsKeeper = chainsKeeper;
    this.keyRingKeeper = keyRingKeeper;
  }

  async addToken(chainId: string, currency: AppCurrency) {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    currency = await TokensKeeper.validateCurrency(chainInfo, currency);

    const chainCurrencies = chainInfo.currencies;

    const isTokenForAccount =
      "type" in currency && currency.type === "secret20";
    let isCurrencyUpdated = false;

    for (const chainCurrency of chainCurrencies) {
      if (currency.coinMinimalDenom === chainCurrency.coinMinimalDenom) {
        if (!isTokenForAccount) {
          // If currency is already registered, do nothing.
          return;
        }

        isCurrencyUpdated = true;
      }
    }

    if (!isTokenForAccount) {
      const currencies = await this.getTokensFromChain(chainId);
      currencies.push(currency);
      await this.saveTokensToChain(chainId, currencies);
    } else {
      const currencies = await this.getTokensFromChainAndAccount(chainId);
      if (!isCurrencyUpdated) {
        currencies.push(currency);
        await this.saveTokensToChainAndAccount(chainId, currencies);
      } else {
        const index = currencies.findIndex(
          cur => cur.coinMinimalDenom === currency.coinMinimalDenom
        );
        if (index >= 0) {
          currencies[index] = currency;
          await this.saveTokensToChainAndAccount(chainId, currencies);
        }
      }
    }
  }

  public async getTokens(
    chainId: string,
    defaultCurrencies: AppCurrency[]
  ): Promise<AppCurrency[]> {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    let chainCurrencies =
      (await this.kvStore.get<AppCurrency[]>(version.identifier)) ?? [];

    if (chainCurrencies.length === 0) {
      // If the token hasn't been inited, just set the default currencies as
      await this.saveTokensToChain(chainId, defaultCurrencies);
      chainCurrencies = defaultCurrencies;
    }

    let keyCurrencies: AppCurrency[] = [];
    if (this.keyRingKeeper.keyRingStatus === KeyRingStatus.UNLOCKED) {
      const currentKey = await this.keyRingKeeper.getKeyByCoinType(118);

      keyCurrencies =
        (await this.kvStore.get<AppCurrency[]>(
          `${version.identifier}-${Buffer.from(currentKey.address).toString(
            "hex"
          )}`
        )) ?? [];
    }

    return chainCurrencies.concat(keyCurrencies);
  }

  private async getTokensFromChain(chainId: string): Promise<AppCurrency[]> {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    return (await this.kvStore.get<AppCurrency[]>(version.identifier)) ?? [];
  }

  private async saveTokensToChain(chainId: string, currencies: AppCurrency[]) {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    await this.kvStore.set(version.identifier, currencies);
  }

  private async getTokensFromChainAndAccount(
    chainId: string
  ): Promise<AppCurrency[]> {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    const currentKey = await this.keyRingKeeper.getKey(chainId);
    return (
      (await this.kvStore.get<Promise<AppCurrency[]>>(
        `${version.identifier}-${Buffer.from(currentKey.address).toString(
          "hex"
        )}`
      )) ?? []
    );
  }

  private async saveTokensToChainAndAccount(
    chainId: string,
    currencies: AppCurrency[]
  ) {
    const version = ChainUpdaterKeeper.getChainVersion(chainId);

    const currentKey = await this.keyRingKeeper.getKey(chainId);
    await this.kvStore.set(
      `${version.identifier}-${Buffer.from(currentKey.address).toString(
        "hex"
      )}`,
      currencies
    );
  }

  static async validateCurrency(
    chainInfo: ChainInfo,
    currency: AppCurrency
  ): Promise<AppCurrency> {
    // Validate the schema.
    if ("type" in currency) {
      switch (currency.type) {
        case "cw20":
          currency = await TokensKeeper.validateCW20Currency(
            chainInfo,
            currency
          );
          break;
        case "secret20":
          currency = await TokensKeeper.validateSecret20Currency(
            chainInfo,
            currency
          );
          break;
        default:
          throw new Error("Unknown type of currency");
      }
    } else {
      currency = await CurrencySchema.validateAsync(currency);
    }

    return currency;
  }

  static async validateCW20Currency(
    chainInfo: ChainInfo,
    currency: CW20Currency
  ): Promise<CW20Currency> {
    // Validate the schema.
    currency = await CW20CurrencyShema.validateAsync(currency);

    // Validate the contract address.
    AccAddress.fromBech32(
      currency.contractAddress,
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    return currency;
  }

  static async validateSecret20Currency(
    chainInfo: ChainInfo,
    currency: Secret20Currency
  ): Promise<Secret20Currency> {
    // Validate the schema.
    currency = await Secret20CurrencyShema.validateAsync(currency);

    // Validate the contract address.
    AccAddress.fromBech32(
      currency.contractAddress,
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    return currency;
  }
}
