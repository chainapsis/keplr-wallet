import { ExtensionKVStore } from "@keplr-wallet/common";
import { ViewToken } from "..";
import { useStore } from "../../../stores";
import { PricePretty } from "@keplr-wallet/unit";
import { useEffect } from "react";

const availableBalancesKVStore = new ExtensionKVStore("available_tab_balances");

export const useBalanceAnalytics = (
  allBalancesSearchFiltered: (ViewToken & { price: PricePretty | undefined })[],
  trimSearch: string
) => {
  const { analyticsAmplitudeStore } = useStore();

  const isInitialized = allBalancesSearchFiltered.every(
    (vt) => vt.isFetching === false
  );

  useEffect(() => {
    if (!isInitialized || trimSearch.length > 0) {
      return;
    }

    const {
      btcBalance,
      btcValueUsd,
      ethBalance,
      ethValueUsd,
      erc20UsdcBalance,
      erc20UsdtBalance,
    } = allBalancesSearchFiltered.reduce(
      (acc, vt) => {
        if (vt.price === undefined) {
          return acc;
        }

        if (
          vt.chainInfo.chainId.startsWith("bip122:") &&
          vt.token.currency.coinDenom === "BTC"
        ) {
          acc.btcBalance += Number(vt.token.toDec().toString());
          acc.btcValueUsd += Number(vt.price.toDec().toString());
          return acc;
        }
        if (vt.chainInfo.chainId.startsWith("eip155:")) {
          if (vt.token.currency.coinDenom === "ETH") {
            acc.ethBalance += Number(vt.token.toDec().toString());
            acc.ethValueUsd += Number(vt.price.toDec().toString());
            return acc;
          }

          if (vt.token.currency.coinDenom === "USDC") {
            acc.erc20UsdcBalance += Number(vt.token.toDec().toString());
            return acc;
          }

          if (vt.token.currency.coinDenom === "USDT") {
            acc.erc20UsdtBalance += Number(vt.token.toDec().toString());
          }
        }
        return acc;
      },
      {
        btcBalance: 0,
        ethBalance: 0,
        btcValueUsd: 0,
        ethValueUsd: 0,
        erc20UsdcBalance: 0,
        erc20UsdtBalance: 0,
      }
    );

    (async () => {
      try {
        const prevBalances = await availableBalancesKVStore.multiGet([
          "btc_balance",
          "eth_balance",
          "erc20_usdc_balance",
          "erc20_usdt_balance",
        ]);

        const hasChanged =
          prevBalances["btc_balance"] !== btcBalance ||
          prevBalances["eth_balance"] !== ethBalance ||
          prevBalances["erc20_usdc_balance"] !== erc20UsdcBalance ||
          prevBalances["erc20_usdt_balance"] !== erc20UsdtBalance;

        if (!hasChanged) {
          return;
        }

        analyticsAmplitudeStore.logEvent("view_available_tab", {
          btcBalance,
          ethBalance,
          btcValueUsd,
          ethValueUsd,
          erc20UsdcBalance,
          erc20UsdtBalance,
        });

        analyticsAmplitudeStore.setUserProperties({
          btc_balance: btcBalance,
          eth_balance: ethBalance,
          btc_value_usd: btcValueUsd,
          eth_value_usd: ethValueUsd,
          erc20_usdc_balance: erc20UsdcBalance,
          erc20_usdt_balance: erc20UsdtBalance,
        });

        await Promise.all([
          availableBalancesKVStore.set("btc_balance", btcBalance),
          availableBalancesKVStore.set("eth_balance", ethBalance),
          availableBalancesKVStore.set("erc20_usdc_balance", erc20UsdcBalance),
          availableBalancesKVStore.set("erc20_usdt_balance", erc20UsdtBalance),
        ]);
      } catch (e) {
        console.error("Failed to process available tab analytics", e);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, analyticsAmplitudeStore]);
};
