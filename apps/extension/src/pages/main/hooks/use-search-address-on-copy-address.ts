import { CoinPretty } from "@keplr-wallet/unit";
import { Address } from "../components/deposit-modal/copy-address-scene";
import { useSearch } from "../../../hooks/use-search";

const addressSearchFields = [
  "modularChainInfo.chainName",
  "modularChainInfo.chainId",
  {
    key: "bech32Address",
    function: (item: Address) => {
      if (item.bech32Address) {
        const bech32Split = item.bech32Address.split("1");
        return bech32Split.length > 0 ? bech32Split[0] : "";
      }
      return "";
    },
  },
  {
    key: "modularChainInfo.currency.coinDenom",
    function: (item: Address) => {
      if (
        "cosmos" in item.modularChainInfo &&
        item.modularChainInfo.cosmos != null
      ) {
        const cosmosChainInfo = item.modularChainInfo.cosmos;
        if (cosmosChainInfo.stakeCurrency) {
          return CoinPretty.makeCoinDenomPretty(
            cosmosChainInfo.stakeCurrency.coinDenom
          );
        }
        if (cosmosChainInfo.currencies.length > 0) {
          const currency = cosmosChainInfo.currencies[0];
          if (!currency.coinMinimalDenom.startsWith("ibc/")) {
            return CoinPretty.makeCoinDenomPretty(currency.coinDenom);
          }
        }
      } else if (
        "starknet" in item.modularChainInfo &&
        item.modularChainInfo.starknet != null
      ) {
        const starknetChainInfo = item.modularChainInfo.starknet;
        if (starknetChainInfo.currencies.length > 0) {
          return CoinPretty.makeCoinDenomPretty(
            starknetChainInfo.currencies[0].coinDenom
          );
        }
      } else if (
        "bitcoin" in item.modularChainInfo &&
        item.modularChainInfo.bitcoin != null
      ) {
        const bitcoinChainInfo = item.modularChainInfo.bitcoin;
        if (bitcoinChainInfo.currencies.length > 0) {
          return CoinPretty.makeCoinDenomPretty(
            bitcoinChainInfo.currencies[0].coinDenom
          );
        }
      }
      return "";
    },
  },
];

export const useSearchAddressOnCopyAddress = (
  addresses: Address[],
  search: string
) => {
  return useSearch(addresses, search, addressSearchFields);
};
