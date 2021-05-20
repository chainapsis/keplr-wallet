import assert from "assert";
import {
  Bech32ConfigSchema,
  ChainInfoSchema,
  CurrencySchema,
  CW20CurrencyShema,
} from "./types";
import {
  AppCurrency,
  ChainInfo,
  Currency,
  CW20Currency,
} from "@keplr-wallet/types";
import { Bech32Config } from "@keplr-wallet/types";
import Joi from "joi";

const AppCurrencyShemaTest = Joi.array().items(
  CurrencySchema,
  CW20CurrencyShema
);

/* eslint-disable @typescript-eslint/ban-ts-comment */

describe("Test chain info schema", () => {
  it("test currency schema", async () => {
    await assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
      };

      await CurrencySchema.validateAsync(currency);
    });

    await assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 18,
      };

      await CurrencySchema.validateAsync(currency);
    });

    await assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      await CurrencySchema.validateAsync(currency);
    });

    await assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
      };

      await CurrencySchema.validateAsync(currency);
    });

    await assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
        coinImageUrl: "http://test.com/test.jpg",
      };

      await CurrencySchema.validateAsync(currency);
    });

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
        coinImageUrl: "",
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error if coin image url is empty string");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
        coinImageUrl: "test",
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error if coin image url is not url");

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        // coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin denom is missing");

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        coinDenom: "TEST",
        // coinMinimalDenom: "utest",
        coinDecimals: 6,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin minimal denom is missing");

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        // coinDecimals: 6,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimals is missing");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        // @ts-ignore
        coinDecimals: "should number",
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimals is not number");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        // @ts-ignore
        coinGeckoId: 45,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coingecko id is not string");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 19,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is too big");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: -1,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is negative");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 1.5,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is not integer");

    await assert.doesNotReject(async () => {
      let currency: CW20Currency = {
        type: "cw20",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      currency = await CW20CurrencyShema.validateAsync(currency);
      if (
        currency.coinMinimalDenom !==
        "cw20:this should be validated in the keeper:utest"
      ) {
        throw new Error(
          "actual denom doens't start with `type:contract-address:`"
        );
      }
    });

    await assert.doesNotReject(async () => {
      let currency: CW20Currency = {
        type: "cw20",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "cw20:this should be validated in the keeper:utest",
        coinDecimals: 0,
      };

      currency = await CW20CurrencyShema.validateAsync(currency);
      if (
        currency.coinMinimalDenom !==
        "cw20:this should be validated in the keeper:utest"
      ) {
        throw new Error(
          "actual denom doens't start with `type:contract-address:`"
        );
      }
    });

    await assert.rejects(async () => {
      const currency: CW20Currency = {
        // @ts-ignore
        type: "?",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when type is not cw20");

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when type is missing");

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        type: "cw20",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when contract address is missing");

    await assert.doesNotReject(async () => {
      let currency: AppCurrency = {
        type: "cw20",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      const currencies = await AppCurrencyShemaTest.validateAsync([currency]);
      if (
        currencies[0].coinMinimalDenom !==
        "cw20:this should be validated in the keeper:utest"
      ) {
        throw new Error(
          "actual denom doens't start with `cw20:contract-address:`"
        );
      }

      currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test",
      };

      await AppCurrencyShemaTest.validateAsync([currency]);
    });

    await assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        type: "cw20",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0,
      };

      await AppCurrencyShemaTest.validateAsync([currency]);
    }, "Should throw error when contract address is missing");

    await assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 1.5,
      };

      await AppCurrencyShemaTest.validateAsync([currency]);
    }, "Should throw error when coin decimal is not integer");
  });

  it("test bech32 config schema", async () => {
    await assert.doesNotReject(async () => {
      const bech32Config: Bech32Config = {
        bech32PrefixAccAddr: "test",
        bech32PrefixAccPub: "test",
        bech32PrefixValAddr: "test",
        bech32PrefixValPub: "test",
        bech32PrefixConsAddr: "test",
        bech32PrefixConsPub: "test",
      };

      await Bech32ConfigSchema.validateAsync(bech32Config);
    });

    const validateNullField = async <K extends keyof Bech32Config>(
      field: K
    ) => {
      const bech32Config: Bech32Config = {
        bech32PrefixAccAddr: "test",
        bech32PrefixAccPub: "test",
        bech32PrefixValAddr: "test",
        bech32PrefixValPub: "test",
        bech32PrefixConsAddr: "test",
        bech32PrefixConsPub: "test",
      };

      // @ts-ignore
      bech32Config[field] = undefined;

      await Bech32ConfigSchema.validateAsync(bech32Config);
    };

    const validateNonStringField = async <K extends keyof Bech32Config>(
      field: K
    ) => {
      const bech32Config: Bech32Config = {
        bech32PrefixAccAddr: "test",
        bech32PrefixAccPub: "test",
        bech32PrefixValAddr: "test",
        bech32PrefixValPub: "test",
        bech32PrefixConsAddr: "test",
        bech32PrefixConsPub: "test",
      };

      // @ts-ignore
      bech32Config[field] = 123;

      await Bech32ConfigSchema.validateAsync(bech32Config);
    };

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixAccAddr");
    });

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixAccPub");
    });

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixValAddr");
    });

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixValPub");
    });

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixConsAddr");
    });

    await assert.rejects(async () => {
      await validateNullField("bech32PrefixConsPub");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixAccAddr");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixAccPub");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixValAddr");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixValPub");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixConsAddr");
    });

    await assert.rejects(async () => {
      await validateNonStringField("bech32PrefixConsPub");
    });
  });

  it("test chain info schema", async () => {
    const generatePlainChainInfo = (): ChainInfo => {
      return {
        rpc: "http://test.com",
        rest: "http://test.com",
        chainId: "test-1",
        chainName: "Test",
        stakeCurrency: {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "test",
          bech32PrefixAccPub: "test",
          bech32PrefixValAddr: "test",
          bech32PrefixValPub: "test",
          bech32PrefixConsAddr: "test",
          bech32PrefixConsPub: "test",
        },
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6,
          },
        ],
      };
    };

    await assert.doesNotReject(async () => {
      const chainInfo = generatePlainChainInfo();

      await ChainInfoSchema.validateAsync(chainInfo);
    });

    await assert.doesNotReject(async () => {
      const plainChainInfo = generatePlainChainInfo();
      const chainInfoWithUnknownField = {
        ...plainChainInfo,
        unknownField: "unknown",
      };

      // Should not reject the chain info with unknown field
      const validated = await ChainInfoSchema.validateAsync(
        chainInfoWithUnknownField,
        {
          stripUnknown: true,
        }
      );

      // But, after being validated, the unknown field should be stripped.
      assert.strictEqual(validated["unknownField"], undefined);
    });

    await assert.doesNotReject(async () => {
      let chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
        {
          type: "cw20",
          contractAddress: "this should be validated in the keeper",
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
      ];

      chainInfo = await ChainInfoSchema.validateAsync(chainInfo);
      if (chainInfo.currencies[0].coinMinimalDenom !== "utest") {
        throw new Error("native currency's actual denom should not be changed");
      }
      if (
        chainInfo.currencies[1].coinMinimalDenom !==
        "cw20:this should be validated in the keeper:utest"
      ) {
        throw new Error(
          "actual denom doens't start with `cw20:contract-address:`"
        );
      }
    });

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rpc"] = "asd";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rpc is not uri");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rpc"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rpc is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rest"] = "asd";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rest is not uri");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rest"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rest is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainId"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain id is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainId"] = "";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain id is empty string");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainName"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain name is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainName"] = "";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain name is empty string");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = "should-throw-error";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is non object");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = {
        // coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
      };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is invalid");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = {};

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has no coinType");

    await assert.doesNotReject(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: 0 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "BIP44 coinType can be 0");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: -1 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has negative coinType");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: 1.1 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has non integer coinType");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = {};

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 is not instance of BIP44");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bech32Config"] = "should-throw-error";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bech32config is non object");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bech32Config"] = {
        bech32PrefixAccAddr: "test",
      };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bech32Config is invalid");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = [];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies has no item");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
        {
          // coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
      ];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies has invalid item");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies is undefined");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = [];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies has no item");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
        {
          // coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6,
        },
      ];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies has invalid item");

    const stargate = "stargate";
    const cosmwasm = "cosmwasm";
    const secretwasm = "secretwasm";

    await assert.doesNotReject(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["features"] = [stargate, cosmwasm];

      await ChainInfoSchema.validateAsync(chainInfo);

      // @ts-ignore
      chainInfo["features"] = [stargate, secretwasm];

      await ChainInfoSchema.validateAsync(chainInfo);
    });

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["features"] = ["unknown"];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when the features include the unknown feature");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["features"] = [stargate, stargate];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when the features include the duplicated feature");

    await assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["features"] = [cosmwasm, secretwasm];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when the features has cosmwasm and secretwasm at the same time");
  });
});
