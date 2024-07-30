import {
  AppCurrency,
  Bech32Config,
  BIP44,
  ChainInfo,
  Currency,
  CW20Currency,
  ERC20Currency,
  FeeCurrency,
  Secret20Currency,
  WithGasPriceStep,
} from "@keplr-wallet/types";
import { SupportedChainFeatures } from "./feature";

import Joi, { ObjectSchema } from "joi";

export const CurrencySchema = Joi.object<
  Currency & {
    type?: undefined;
  }
>({
  coinDenom: Joi.string().required(),
  coinMinimalDenom: Joi.string().required(),
  coinDecimals: Joi.number().strict().integer().min(0).max(18).required(),
  coinGeckoId: Joi.string(),
  coinImageUrl: Joi.string().uri(),
}).keys({
  type: Joi.forbidden(),
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

export const Secret20CurrencySchema = (
  CurrencySchema as ObjectSchema<Secret20Currency>
)
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

export const ERC20CurrencySchema = (
  CurrencySchema as ObjectSchema<ERC20Currency>
)
  .keys({
    type: Joi.string().equal("erc20").required(),
    contractAddress: Joi.string()
      .pattern(/^(0x)[0-9a-fA-F]{40}$/)
      .required(),
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
        coinMinimalDenom: `${value.type}:${value.contractAddress}`,
      };
    }
  });

const GasPriceStepSchema = Joi.object<{
  readonly low: number;
  readonly average: number;
  readonly high: number;
}>({
  low: Joi.number().strict().required(),
  average: Joi.number().strict().required(),
  high: Joi.number().strict().required(),
}).custom((value) => {
  if (value.low > value.average) {
    throw new Error("Low gas price step can not be greater than average");
  }
  if (value.average > value.high) {
    throw new Error("Average gas price step can not be greater than high");
  }

  return value;
});

export const FeeCurrencySchema = (
  CurrencySchema as Joi.ObjectSchema<WithGasPriceStep<Currency>>
).keys({
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

// This EIP-155 Chain ID follows the format defined in CAIP-2
// https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
export const EIP155ChainIdSchema = Joi.string().custom((value: string) => {
  if (!value.includes(":")) {
    throw new Error("EIP155 chain id should have colon as defined in CAIP-2");
  } else {
    const splits = value.split(":");
    if (splits.length !== 2) {
      throw new Error(
        "EIP155 chain id should have only one colon as defined in CAIP-2"
      );
    }

    const [namespace, reference] = splits;
    if (namespace !== "eip155") {
      throw new Error("Namespace for EIP155 chain id should be 'eip155'");
    }

    const referenceFound = reference.match(/^[1-9]\d{0,31}$/);
    if (!referenceFound) {
      throw new Error(
        "Reference for EIP155 chain id should be 1~32 characters of number"
      );
    }
  }

  return value;
});

export const ChainIdSchema = Joi.alternatives().try(
  Joi.string().min(1).max(30),
  EIP155ChainIdSchema
);

export const SuggestingBIP44Schema = Joi.object<{ coinType: number }>({
  coinType: Joi.number().strict().integer().min(0).required(),
  // Alow the any keys for compatibility of cosmosJS's BIP44 (for legacy).
}).unknown(true);

export const ChainInfoSchema = Joi.object<ChainInfo>({
  rpc: Joi.string()
    .uri()
    .custom((value: string) => {
      if (value.includes("?")) {
        throw new Error("rpc should not have query string");
      }

      return value;
    })
    .required(),
  rest: Joi.string()
    .uri()
    .custom((value: string) => {
      if (value.includes("?")) {
        throw new Error("rest should not have query string");
      }

      return value;
    })
    .required(),
  evm: Joi.object({
    chainId: Joi.number().required(),
    rpc: Joi.string()
      .custom((value: string) => {
        if (value.includes("?")) {
          throw new Error("evm rpc should not have query string");
        }

        return value;
      })
      .required(),
  }).unknown(true),
  nodeProvider: Joi.object({
    name: Joi.string().min(1).max(30).required(),
    email: Joi.string()
      .email({
        tlds: {
          allow: false,
        },
      })
      .required(),
    website: Joi.string().uri(),
  }),
  chainId: ChainIdSchema.required(),
  chainName: Joi.string().required().min(1).max(30),
  stakeCurrency: CurrencySchema,
  walletUrl: Joi.string().uri(),
  walletUrlForStaking: Joi.string().uri(),
  bip44: SuggestingBIP44Schema.required(),
  alternativeBIP44s: Joi.array()
    .items(SuggestingBIP44Schema)
    .custom((values: BIP44[]) => {
      const dups: { [coinType: number]: boolean | undefined } = {};

      for (const val of values) {
        if (dups[val.coinType]) {
          throw new Error(`coin type ${val.coinType} is duplicated`);
        }
        dups[val.coinType] = true;
      }

      return values;
    }),
  bech32Config: Bech32ConfigSchema,
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
  beta: Joi.boolean(),
  features: Joi.array()
    .items(Joi.string().valid(...SupportedChainFeatures))
    .unique()
    .custom((value: string[]) => {
      if (value.indexOf("cosmwasm") >= 0 && value.indexOf("secretwasm") >= 0) {
        throw new Error("cosmwasm and secretwasm are not compatible");
      }

      return value;
    }),
  chainSymbolImageUrl: Joi.string().uri(),
  hideInUI: Joi.boolean(),
}).custom((value: ChainInfo) => {
  if (
    value.alternativeBIP44s?.find(
      (bip44) => bip44.coinType === value.bip44.coinType
    )
  ) {
    throw new Error(`coin type ${value.bip44.coinType} is duplicated`);
  }

  if (value.bip44.coinType === 60) {
    if (value.alternativeBIP44s && value.alternativeBIP44s.length > 0) {
      throw new Error(`coin type 60 can't have alternative BIP44s`);
    }
  } else {
    if (
      value.alternativeBIP44s &&
      value.alternativeBIP44s.find((bip44) => bip44.coinType === 60)
    ) {
      throw new Error(`coin type 60 can't be alternative BIP44`);
    }
  }

  if (
    value.stakeCurrency &&
    !value.currencies.find(
      (cur) => cur.coinMinimalDenom === value.stakeCurrency?.coinMinimalDenom
    )
  ) {
    throw new Error(
      `stake currency ${value.stakeCurrency.coinMinimalDenom} is not included in currencies`
    );
  }

  if (!EIP155ChainIdSchema.validate(value.chainId).error) {
    if (value.bip44.coinType !== 60) {
      throw new Error(
        "if chainId is EIP-155 chain id defined in CAIP-2, coin type should be 60"
      );
    }

    if (!value.evm) {
      throw new Error(
        "if chainId is EIP-155 chain id defined in CAIP-2, evm should be provided"
      );
    }

    if (value.bech32Config != null) {
      throw new Error(
        "if chainId is EIP-155 chain id defined in CAIP-2, bech32Config should be undefined"
      );
    }
  }

  if (!value.bech32Config) {
    if (value.bip44.coinType !== 60) {
      throw new Error("if bech32Config is undefined, coin type should be 60");
    }

    if (!value.evm) {
      throw new Error("if bech32Config is undefined, evm should be provided");
    }

    if (EIP155ChainIdSchema.validate(value.chainId).error) {
      throw new Error(
        "if bech32Config is undefined, chainId should be EIP-155 chain id defined in CAIP-2"
      );
    }
  }

  if (value.evm) {
    const firstCurrency = value.currencies[0];
    if (firstCurrency.coinDecimals !== 18) {
      throw new Error(
        "The first currency's coin decimals should be 18 for EVM chain"
      );
    }
    if (value.stakeCurrency) {
      if (value.stakeCurrency.coinDecimals !== 18) {
        throw new Error(
          "The stake currency's coin decimals should be 18 for EVM chain"
        );
      }
      const cur = value.currencies.find(
        (cur) => cur.coinMinimalDenom === value.stakeCurrency?.coinMinimalDenom
      );
      if (cur) {
        if (cur.coinDecimals !== 18) {
          throw new Error(
            "The stake currency's coin decimals should be 18 for EVM chain"
          );
        }
      }
    }

    const firstFeeCurrency = value.feeCurrencies[0];
    if (firstFeeCurrency.coinDecimals !== 18) {
      throw new Error(
        "The first fee currency's coin decimals should be 18 for EVM chain"
      );
    }
  }

  return value;
});
