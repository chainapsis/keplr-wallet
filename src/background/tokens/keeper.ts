import { AppCurrency, CW20Currency } from "../../common/currency";
import { ChainInfo, CurrencySchema, CW20CurrencyShema } from "../chains";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { ChainsKeeper } from "../chains/keeper";
import { ChainUpdaterKeeper } from "../updater/keeper";

export class TokensKeeper {
  constructor(
    private readonly chainsKeeper: ChainsKeeper,
    private readonly chainUpdaterKeeper: ChainUpdaterKeeper
  ) {}

  async addToken(chainId: string, currency: AppCurrency) {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    currency = await TokensKeeper.validateCurrency(chainInfo, currency);

    for (const chainCurrency of chainInfo.currencies) {
      // If the same currency was already registered, just return.
      if (chainCurrency.coinMinimalDenom === currency.coinMinimalDenom) {
        return;
      }

      if ("type" in chainCurrency && "type" in currency) {
        if (chainCurrency.contractAddress === currency.contractAddress) {
          return;
        }
      }
    }

    await this.chainUpdaterKeeper.updateChainCurrencies(chainId, [
      ...chainInfo.currencies,
      currency
    ]);
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
}
