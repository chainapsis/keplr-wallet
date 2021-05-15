import { AccountSetBase, WalletStatus } from "./base";
import { ChainStore } from "../chain";
import { ChainInfo } from "@keplr-wallet/types";
import { MockKeplr } from "@keplr-wallet/provider";

describe("Test Account set base", () => {
  test("Account set base should be inited automatically if `autoInit` is true", async () => {
    const chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
    }[] = [
      {
        chainId: "test",
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
        },
      },
    ];
    const chainStore = new ChainStore(chainInfos as ChainInfo[]);

    const accountSetBase = new AccountSetBase(
      {
        // No need
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      chainStore,
      "test",
      undefined as any,
      {
        prefetching: true,
        suggestChain: false,
        autoInit: true,
        getKeplr: async () => {
          return new MockKeplr(
            async () => {
              return new Uint8Array(0);
            },
            chainInfos,
            "curious kitchen brief change imitate open close knock cause romance trim offer"
          );
        },
        msgOpts: {},
      }
    );

    expect(accountSetBase.walletStatus).toBe(WalletStatus.Loading);

    // Need wait some time to get the Keplr.
    await (() => {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    })();

    expect(accountSetBase.walletStatus).toBe(WalletStatus.Loaded);
    expect(accountSetBase.bech32Address).toBe(
      "cosmos1unx0p9jv79xz278xuk7uuuwj2l99k2sp4vm8wp"
    );
    expect(accountSetBase.isReadyToSendMsgs).toBe(true);
  });

  test("Account set base should not be inited automatically if `autoInit` is false", async () => {
    const chainInfos: {
      readonly chainId: string;
      readonly bech32Config: {
        readonly bech32PrefixAccAddr: string;
      };
    }[] = [
      {
        chainId: "test",
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
        },
      },
    ];
    const chainStore = new ChainStore(chainInfos as ChainInfo[]);

    const accountSetBase = new AccountSetBase(
      {
        // No need
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      chainStore,
      "test",
      undefined as any,
      {
        prefetching: true,
        suggestChain: false,
        autoInit: false,
        getKeplr: async () => {
          return new MockKeplr(
            async () => {
              return new Uint8Array(0);
            },
            chainInfos,
            "curious kitchen brief change imitate open close knock cause romance trim offer"
          );
        },
        msgOpts: {},
      }
    );

    expect(accountSetBase.walletStatus).toBe(WalletStatus.NotInit);

    // Need wait some time to get the Keplr.
    await (() => {
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
    })();

    expect(accountSetBase.walletStatus).toBe(WalletStatus.NotInit);
  });
});
