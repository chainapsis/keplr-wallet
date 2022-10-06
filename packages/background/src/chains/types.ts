import { KeplrError } from "@keplr-wallet/router";
import {
  AppCurrency,
  Bech32Config,
  ChainInfo,
  Currency,
  CW20Currency,
  FeeCurrency,
  Secret20Currency,
  WithGasPriceStep,
  ERC20Currency,
} from "@keplr-wallet/types";

import Joi, { ObjectSchema } from "joi";

export type ChainInfoWithEmbed = ChainInfo & {
  embeded: boolean;
};

export const CurrencySchema = Joi.object<Currency>({
  coinDenom: Joi.string().required(),
  coinMinimalDenom: Joi.string().required(),
  coinDecimals: Joi.number().integer().min(0).max(18).required(),
  coinGeckoId: Joi.string(),
  coinImageUrl: Joi.string().uri(),
});

export const CW20CurrencySchema = (CurrencySchema as ObjectSchema<CW20Currency>)
  .keys({
    type: Joi.string().equal("cw20").required(),
    contractAddress: Joi.string().required(),
  })
  .custom((value: CW20Currency) => {
    if (
      value.coinMinimalDenom.startsWith(
        `${value.type}:${value.contractAddress}:`
      )
    ) {
      return value;
    } else {
      return {
        ...value,
        coinMinimalDenom:
          `${value.type}:${value.contractAddress}:` + value.coinMinimalDenom,
      };
    }
  });

export const Secret20CurrencySchema = (CurrencySchema as ObjectSchema<Secret20Currency>)
  .keys({
    type: Joi.string().equal("secret20").required(),
    contractAddress: Joi.string().required(),
    viewingKey: Joi.string().required(),
  })
  .custom((value: Secret20Currency) => {
    if (
      value.coinMinimalDenom.startsWith(
        `${value.type}:${value.contractAddress}:`
      )
    ) {
      return value;
    } else {
      return {
        ...value,
        coinMinimalDenom:
          `${value.type}:${value.contractAddress}:` + value.coinMinimalDenom,
      };
    }
  });

export const Erc20CurrencySchema = (CurrencySchema as ObjectSchema<ERC20Currency>)
  .keys({
    type: Joi.string().equal("erc20").required(),
    contractAddress: Joi.string().required(),
  })
  .custom((value: ERC20Currency) => {
    if (
      value.coinMinimalDenom.startsWith(
        `${value.type}:${value.contractAddress}:`
      )
    ) {
      return value;
    } else {
      return {
        ...value,
        coinMinimalDenom:
          `${value.type}:${value.contractAddress}:` + value.coinMinimalDenom,
      };
    }
  });

const GasPriceStepSchema = Joi.object<{
  readonly low: number;
  readonly average: number;
  readonly high: number;
}>({
  low: Joi.number().required(),
  average: Joi.number().required(),
  high: Joi.number().required(),
}).custom((value) => {
  if (value.low > value.average) {
    throw new Error("Low gas price step can not be greater than average");
  }
  if (value.average > value.high) {
    throw new Error("Average gas price step can not be greater than high");
  }

  return value;
});

export const FeeCurrencySchema = (CurrencySchema as Joi.ObjectSchema<
  WithGasPriceStep<Currency>
>).keys({
  gasPriceStep: GasPriceStepSchema,
});

export const Bech32ConfigSchema = Joi.object<Bech32Config>({
  bech32PrefixAccAddr: Joi.string().required(),
  bech32PrefixAccPub: Joi.string().required(),
  bech32PrefixValAddr: Joi.string().required(),
  bech32PrefixValPub: Joi.string().required(),
  bech32PrefixConsAddr: Joi.string().required(),
  bech32PrefixConsPub: Joi.string().required(),
});

export const SuggestingBIP44Schema = Joi.object<{ coinType: number }>({
  coinType: Joi.number().integer().min(0).required(),
  // Alow the any keys for compatibility of cosmosJS's BIP44 (for legacy).
}).unknown(true);

export const ChainInfoSchema = Joi.object<ChainInfo>({
  rpc: Joi.string().required().uri(),
  // TODO: Handle rpc config.
  rest: Joi.string().required().uri(),
  // TODO: Handle rest config.
  chainId: Joi.string().required().min(1).max(30),
  chainName: Joi.string().required().min(1).max(30),
  stakeCurrency: CurrencySchema.required(),
  walletUrl: Joi.string().uri(),
  walletUrlForStaking: Joi.string().uri(),
  bip44: SuggestingBIP44Schema.required(),
  bech32Config: Bech32ConfigSchema.required(),
  currencies: Joi.array()
    .min(1)
    .items(CurrencySchema, CW20CurrencySchema, Secret20CurrencySchema)
    .custom((values: AppCurrency[]) => {
      const dups: { [denom: string]: boolean | undefined } = {};

      for (const val of values) {
        if (dups[val.coinMinimalDenom]) {
          throw new Error(`${val.coinMinimalDenom} is duplicated`);
        }
        dups[val.coinMinimalDenom] = true;
      }

      return values;
    })
    .required(),
  feeCurrencies: Joi.array()
    .min(1)
    .items(FeeCurrencySchema)
    .custom((values: FeeCurrency[]) => {
      const dups: { [denom: string]: boolean | undefined } = {};

      for (const val of values) {
        if (dups[val.coinMinimalDenom]) {
          throw new Error(`${val.coinMinimalDenom} is duplicated`);
        }
        dups[val.coinMinimalDenom] = true;
      }

      return values;
    })
    .required(),
  coinType: Joi.number().integer(),
  beta: Joi.boolean(),
  features: Joi.array()
    .items(
      Joi.string().valid(
        "stargate",
        "cosmwasm",
        "wasmd_0.24+",
        "secretwasm",
        "ibc-transfer",
        "no-legacy-stdTx",
        "ibc-go",
        "eth-address-gen",
        "eth-key-sign",
        "query:/cosmos/bank/v1beta1/spendable_balances",
        "axelar-evm-bridge",
        "osmosis-txfees",
        "erc20"
      )
    )
    .unique()
    .custom((value: string[]) => {
      const numTokenContracts = [
        value.indexOf("cosmwasm"),
        value.indexOf("secretwasm"),
        value.indexOf("erc20"),
      ].filter((val) => val >= 0).length;
      if (numTokenContracts > 1) {
        throw new KeplrError(
          "chains",
          430,
          "cosmwasm, secretwasm, and erc20 are not compatible"
        );
      }

      return value;
    }),
  ethereumJsonRpc: Joi.string().uri(),
});
