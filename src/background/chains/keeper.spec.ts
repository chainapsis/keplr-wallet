import assert from "assert";
import "mocha";
import { ChainsKeeper } from "./keeper";
import { MemoryKVStore } from "../../common/kvstore/memory";

import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

import delay from "delay";
import { ChainUpdaterKeeper } from "../updater/keeper";

describe("Test chains keeper", () => {
  let keeper: ChainsKeeper;

  beforeEach(() => {
    keeper = new ChainsKeeper(
      new MemoryKVStore("chains"),
      new ChainUpdaterKeeper(new MemoryKVStore("updater")),
      [
        {
          rpc: "nope",
          rest: "nope",
          chainId: "test-1",
          chainName: "Test",
          stakeCurrency: {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          },
          walletUrl: "nope",
          walletUrlForStaking: "nope",
          bip44: new BIP44(44, 118, 0),
          bech32Config: defaultBech32Config("test"),
          currencies: [
            {
              coinDenom: "TEST",
              coinMinimalDenom: "test",
              coinDecimals: 6
            }
          ],
          feeCurrencies: [
            {
              coinDenom: "TEST",
              coinMinimalDenom: "test",
              coinDecimals: 6
            }
          ],
          coinType: 118
        }
      ],
      [
        {
          chainId: "test-1",
          origins: ["http://test.com"]
        }
      ],
      (): void => {},
      0
    );
  });

  it("Chains keeper should return the saved chains", async () => {
    const chains = await keeper.getChainInfos();

    assert.strictEqual(chains.length, 1);
    assert.strictEqual(chains[0].chainId, "test-1");

    const chain = await keeper.getChainInfo("test-1");
    assert.strictEqual(chain.chainId, "test-1");

    await assert.rejects(async () => {
      await keeper.getChainInfo("test-none-1");
    });
  });

  it("Chains keeper should return the saved access origin", async () => {
    let origin = await keeper.getAccessOrigin("test-1");

    assert.strictEqual(origin.chainId, "test-1");
    assert.strictEqual(origin.origins.length, 1);
    assert.strictEqual(origin.origins[0], "http://test.com");

    origin = await keeper.getAccessOrigin("test-none-1");

    assert.strictEqual(origin.chainId, "test-none-1");
    assert.strictEqual(origin.origins.length, 0);
  });

  it("Chains keeper can add the other permitted access origins", async () => {
    await Promise.all([
      keeper.requestAccess("http://extension/", "1234", "test-1", [
        "http://other1.com"
      ]),
      (async () => {
        await delay(100);
        keeper.approveAccess("1234");
      })()
    ]);

    const origin = await keeper.getAccessOrigin("test-1");

    assert.strictEqual(origin.chainId, "test-1");
    assert.strictEqual(origin.origins.length, 2);
    assert.strictEqual(origin.origins[0], "http://test.com");
    assert.strictEqual(origin.origins[1], "http://other1.com");
  });

  it("Chains keeper can't add the other permitted access origins to unknown chain", async () => {
    await assert.rejects(async () => {
      await keeper.requestAccess("http://extension/", "1234", "other-1", [
        "http://other1.com"
      ]);
    });
  });

  it("Chains keeper can remove the access origins that is not embeded", async () => {
    await assert.rejects(async () => {
      await keeper.removeAccessOrigin("test-1", "http://test.com");
    }, "can't remove the origin that is embeded");

    await assert.rejects(async () => {
      await keeper.removeAccessOrigin("test-1", "http://other1.com");
    });

    await Promise.all([
      keeper.requestAccess("http://extension/", "1234", "test-1", [
        "http://other1.com"
      ]),
      (async () => {
        await delay(100);
        keeper.approveAccess("1234");
      })()
    ]);

    await keeper.removeAccessOrigin("test-1", "http://other1.com");

    const origin = await keeper.getAccessOrigin("test-1");

    assert.strictEqual(origin.chainId, "test-1");
    assert.strictEqual(origin.origins.length, 1);
    assert.strictEqual(origin.origins[0], "http://test.com");
  });

  it("CheckAccessOrigin will throw an error if access is not permitted", async () => {
    await keeper.checkAccessOrigin(
      "http://extension",
      "test-1",
      "http://test.com"
    );

    await assert.rejects(async () => {
      await keeper.checkAccessOrigin(
        "http://extension",
        "test-1",
        "http://other1.com"
      );
    });

    await assert.rejects(async () => {
      await keeper.checkAccessOrigin(
        "http://extension",
        "other-1",
        "http://test.com"
      );
    });
  });

  it("CheckAccessOrigin will skip checking if access is from extension itself", async () => {
    await keeper.checkAccessOrigin(
      "http://extension",
      "test-1",
      "http://extension"
    );
  });

  it("Chains keeper should reject adding the same chain", async () => {
    await assert.rejects(async () => {
      await keeper.addChainInfo({
        rpc: "nope",
        rest: "nope",
        chainId: "test-1",
        chainName: "Test",
        stakeCurrency: {
          coinDenom: "TEST",
          coinMinimalDenom: "test",
          coinDecimals: 6
        },
        walletUrl: "nope",
        walletUrlForStaking: "nope",
        bip44: new BIP44(44, 118, 0),
        bech32Config: defaultBech32Config("test"),
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          }
        ],
        feeCurrencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          }
        ],
        coinType: 118
      });
    });
  });

  it("Chains keeper should reject adding the ambiguous chain", async () => {
    await assert.rejects(async () => {
      await keeper.addChainInfo({
        rpc: "nope",
        rest: "nope",
        // If the chain id is formatted as {identifer}-{version}, the same identifier is ambiguous and it is not permitted.
        chainId: "test-2",
        chainName: "Test",
        stakeCurrency: {
          coinDenom: "TEST",
          coinMinimalDenom: "test",
          coinDecimals: 6
        },
        walletUrl: "nope",
        walletUrlForStaking: "nope",
        bip44: new BIP44(44, 118, 0),
        bech32Config: defaultBech32Config("test"),
        currencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          }
        ],
        feeCurrencies: [
          {
            coinDenom: "TEST",
            coinMinimalDenom: "test",
            coinDecimals: 6
          }
        ],
        coinType: 118
      });
    });
  });
});
