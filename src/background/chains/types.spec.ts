import assert from "assert";
import "mocha";
import {
  AppCurrencyShema,
  Bech32ConfigSchema,
  ChainInfoSchema,
  CurrencySchema,
  CW20CurrencyShema,
  SuggestingChainInfo
} from "./types";
import { AppCurrency, Currency, CW20Currency } from "../../common/currency";
import { Bech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

/* eslint-disable @typescript-eslint/ban-ts-ignore */

describe("Test chain info schema", () => {
  it("test currency schema", () => {
    assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6
      };

      await CurrencySchema.validateAsync(currency);
    });

    assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 18
      };

      await CurrencySchema.validateAsync(currency);
    });

    assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await CurrencySchema.validateAsync(currency);
    });

    assert.doesNotReject(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test"
      };

      await CurrencySchema.validateAsync(currency);
    });

    assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        // coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test"
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin denom is missing");

    assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        coinDenom: "TEST",
        // coinMinimalDenom: "utest",
        coinDecimals: 6
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin minimal denom is missing");

    assert.rejects(async () => {
      // @ts-ignore
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest"
        // coinDecimals: 6,
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimals is missing");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        // @ts-ignore
        coinDecimals: "should number"
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimals is not number");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        // @ts-ignore
        coinGeckoId: 45
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coingecko id is not string");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 19
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is too big");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: -1
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is negative");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 1.5
      };

      await CurrencySchema.validateAsync(currency);
    }, "Should throw error when coin decimal is not integer");

    assert.doesNotReject(async () => {
      const currency: CW20Currency = {
        type: "cw20",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await CW20CurrencyShema.validateAsync(currency);
    });

    assert.rejects(async () => {
      const currency: CW20Currency = {
        // @ts-ignore
        type: "?",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when type is not cw20");

    assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when type is missing");

    assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        type: "cw20",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await CW20CurrencyShema.validateAsync(currency);
    }, "Should throw error when contract address is missing");

    assert.doesNotReject(async () => {
      let currency: AppCurrency = {
        type: "cw20",
        contractAddress: "this should be validated in the keeper",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await AppCurrencyShema.validateAsync(currency);

      currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6,
        coinGeckoId: "test"
      };

      await AppCurrencyShema.validateAsync(currency);
    });

    assert.rejects(async () => {
      // @ts-ignore
      const currency: CW20Currency = {
        type: "cw20",
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 0
      };

      await AppCurrencyShema.validateAsync(currency);
    }, "Should throw error when contract address is missing");

    assert.rejects(async () => {
      const currency: Currency = {
        coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 1.5
      };

      await AppCurrencyShema.validateAsync(currency);
    }, "Should throw error when coin decimal is not integer");
  });

  it("test bech32 config schema", () => {
    assert.doesNotReject(async () => {
      const bech32Config: Bech32Config = {
        bech32PrefixAccAddr: "test",
        bech32PrefixAccPub: "test",
        bech32PrefixValAddr: "test",
        bech32PrefixValPub: "test",
        bech32PrefixConsAddr: "test",
        bech32PrefixConsPub: "test"
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
        bech32PrefixConsPub: "test"
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
        bech32PrefixConsPub: "test"
      };

      // @ts-ignore
      bech32Config[field] = 123;

      await Bech32ConfigSchema.validateAsync(bech32Config);
    };

    assert.rejects(async () => {
      await validateNullField("bech32PrefixAccAddr");
    });

    assert.rejects(async () => {
      await validateNullField("bech32PrefixAccPub");
    });

    assert.rejects(async () => {
      await validateNullField("bech32PrefixValAddr");
    });

    assert.rejects(async () => {
      await validateNullField("bech32PrefixValPub");
    });

    assert.rejects(async () => {
      await validateNullField("bech32PrefixConsAddr");
    });

    assert.rejects(async () => {
      await validateNullField("bech32PrefixConsPub");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixAccAddr");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixAccPub");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixValAddr");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixValPub");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixConsAddr");
    });

    assert.rejects(async () => {
      await validateNonStringField("bech32PrefixConsPub");
    });
  });

  it("test chain info schema", () => {
    const generatePlainChainInfo = (): SuggestingChainInfo => {
      return {
        rpc: "http://test.com",
        rest: "http://test.com",
        chainId: "test-1",
        chainName: "Test",
        stakeCurrency: {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6
        },
        bip44: {
          coinType: 118
        },
        bech32Config: {
          bech32PrefixAccAddr: "test",
          bech32PrefixAccPub: "test",
          bech32PrefixValAddr: "test",
          bech32PrefixValPub: "test",
          bech32PrefixConsAddr: "test",
          bech32PrefixConsPub: "test"
        },
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6
          }
        ],
        feeCurrencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "utest",
            coinDecimals: 6
          }
        ]
      };
    };

    assert.doesNotReject(async () => {
      const chainInfo = generatePlainChainInfo();

      await ChainInfoSchema.validateAsync(chainInfo);
    });

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rpc"] = "asd";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rpc is not uri");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rpc"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rpc is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rest"] = "asd";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rest is not uri");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["rest"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when rest is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainId"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain id is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainId"] = "";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain id is empty string");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainName"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain name is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["chainName"] = "";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when chain name is empty string");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = "should-throw-error";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is non object");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["stakeCurrency"] = {
        // coinDenom: "TEST",
        coinMinimalDenom: "utest",
        coinDecimals: 6
      };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when stake currency is invalid");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = {};

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has no coinType");

    assert.doesNotReject(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: 0 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "BIP44 coinType can be 0");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: -1 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has negative coinType");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = { coinType: 1.1 };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 has non integer coinType");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bip44"] = {};

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bip44 is not instance of BIP44");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bech32Config"] = "should-throw-error";

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bech32config is non object");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["bech32Config"] = {
        bech32PrefixAccAddr: "test"
      };

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when bech32Config is invalid");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = [];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies has no item");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["currencies"] = [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6
        },
        {
          // coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6
        }
      ];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when currencies has invalid item");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = undefined;

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies is undefined");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = [];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies has no item");

    assert.rejects(async () => {
      const chainInfo = generatePlainChainInfo();
      // @ts-ignore
      chainInfo["feeCurrencies"] = [
        {
          coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6
        },
        {
          // coinDenom: "TEST",
          coinMinimalDenom: "utest",
          coinDecimals: 6
        }
      ];

      await ChainInfoSchema.validateAsync(chainInfo);
    }, "Should throw error when fee currencies has invalid item");
  });
});
