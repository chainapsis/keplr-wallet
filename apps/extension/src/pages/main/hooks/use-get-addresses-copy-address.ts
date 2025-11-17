import { CoinPretty } from "@keplr-wallet/unit";
import { Address } from "../components/deposit-modal/copy-address-scene";
import { useSearch } from "../../../hooks/use-search";
import { useStore } from "../../../stores";
import { useMemo, useState } from "react";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

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

const useSearchAddressOnCopyAddress = (
  addresses: Address[],
  search: string
) => {
  return useSearch(addresses, search, addressSearchFields);
};

export const useGetAddressesOnCopyAddress = (search: string) => {
  const { chainStore, accountStore, keyRingStore, uiConfigStore } = useStore();

  // 북마크된 체인과 sorting을 위한 state는 분리되어있다.
  // 이걸 분리하지 않고 북마크된 체인은 무조건 올린다고 가정하면
  // 유저 입장에서 북마크 버튼을 누르는 순간 그 체인은 위로 올라가게 되고
  // 아래에 있던 체인의 경우는 유저가 보기에 갑자기 사라진 것처럼 보일 수 있고
  // 그게 아니더라도 추가적인 인터렉션을 위해서 스크롤이 필요해진다.
  // 이 문제를 해결하기 위해서 state가 분리되어있다.
  // 처음 시자할때는 북마크된 체인 기준으로 하고 이후에 북마크가 해제된 체인의 경우만 정렬 우선순위에서 뺀다.
  const [sortPriorities, setSortPriorities] = useState<
    Record<string, true | undefined>
  >(() => {
    if (!keyRingStore.selectedKeyInfo) {
      return {};
    }
    const res: Record<string, true | undefined> = {};
    for (const modularChainInfo of chainStore.modularChainInfosInUI) {
      if (
        uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          modularChainInfo.chainId
        )
      ) {
        res[ChainIdHelper.parse(modularChainInfo.chainId).identifier] = true;
      }
    }
    return res;
  });

  const addresses: Address[] = useMemo(() => {
    return chainStore.modularChainInfosInUI.map((modularChainInfo) => {
      const accountInfo = accountStore.getAccount(modularChainInfo.chainId);

      const bech32Address = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("eip155")) {
          return undefined;
        }

        return accountInfo.bech32Address;
      })();
      const ethereumAddress = (() => {
        if (!("cosmos" in modularChainInfo)) {
          return undefined;
        }

        if (modularChainInfo.chainId.startsWith("injective")) {
          return undefined;
        }

        return accountInfo.hasEthereumHexAddress
          ? accountInfo.ethereumHexAddress
          : undefined;
      })();
      const starknetAddress = (() => {
        if (!("starknet" in modularChainInfo)) {
          return undefined;
        }

        return accountInfo.starknetHexAddress;
      })();

      const bitcoinAddress = (() => {
        if (!("bitcoin" in modularChainInfo)) {
          return undefined;
        }

        return accountInfo.bitcoinAddress;
      })();

      return {
        modularChainInfo,
        bech32Address,
        ethereumAddress,
        starknetAddress,
        bitcoinAddress,
      };
    });
  }, [chainStore.modularChainInfosInUI, accountStore]);

  const searchedAddresses = useSearchAddressOnCopyAddress(addresses, search);

  const sortedAddresses = useMemo(() => {
    return searchedAddresses.sort((a, b) => {
      const aChainIdentifier = ChainIdHelper.parse(
        a.modularChainInfo.chainId
      ).identifier;
      const bChainIdentifier = ChainIdHelper.parse(
        b.modularChainInfo.chainId
      ).identifier;

      const aPriority = sortPriorities[aChainIdentifier];
      const bPriority = sortPriorities[bChainIdentifier];

      if (aPriority && bPriority) {
        return 0;
      }
      if (aPriority) {
        return -1;
      }
      if (bPriority) {
        return 1;
      }
      return 0;
    });
  }, [searchedAddresses, sortPriorities]);

  return {
    sortedAddresses,
    setSortPriorities,
  };
};
