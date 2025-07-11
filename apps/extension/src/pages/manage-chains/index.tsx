import React, {
  FunctionComponent,
  useState,
  useMemo,
  useCallback,
} from "react";
import { HeaderLayout } from "../../layouts/header";
import { BackButton } from "../../layouts/header/components";
import { SearchTextInput } from "../../components/input";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router-dom";
import { ChainToggleItem } from "./components/chain-toggle-item";
import { useSearch } from "../../hooks/use-search";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ModularChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Stack } from "../../components/stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useGetAllNonNativeChain } from "../../hooks/use-get-all-non-native-chain";
import { Columns, Column } from "../../components/column";
import { Subtitle4 } from "../../components/typography";
import { Checkbox } from "../../components/checkbox";
import { EcosystemFilterDropdown } from "./components/ecosystem-filter-dropdown";
import { AllNativeToggleItem } from "./components/all-native-toggle-item";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import styled from "styled-components";

export const Ecosystem = {
  All: "All",
  Cosmos: "Cosmos",
  EVM: "EVM",
  Bitcoin: "Bitcoin",
  Starknet: "Starknet",
} as const;
export type Ecosystem = (typeof Ecosystem)[keyof typeof Ecosystem];

const HideEnabledText = styled(Subtitle4)`
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

export const ManageChainsPage: FunctionComponent = observer(() => {
  const { chainStore, hugeQueriesStore, keyRingStore, priceStore } = useStore();
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const [selectedEcosystem, setSelectedEcosystem] = useState<Ecosystem>("All");

  const theme = useTheme();

  const [hideEnabled, setHideEnabled] = useState(false);

  const { chains: nonNativeChainInfos, infiniteScrollTriggerRef } =
    useGetAllNonNativeChain({ search });

  const nonNativeModularChainInfos: ModularChainInfo[] = useMemo(() => {
    return nonNativeChainInfos.map((ci) => {
      return {
        chainId: ci.chainId,
        chainName: ci.chainName,
        chainSymbolImageUrl: (ci as any).chainSymbolImageUrl,
        cosmos: ci,
      } as ModularChainInfo;
    });
  }, [nonNativeChainInfos]);

  const vaultId =
    searchParams.get("vaultId") || keyRingStore.selectedKeyInfo?.id;

  const [enabledIdentifiers, setEnabledIdentifiers] = useState<string[]>(() => {
    return chainStore.enabledChainIdentifiers.slice();
  });

  const enabledIdentifierMap = useMemo(() => {
    const map = new Map<string, boolean>();
    enabledIdentifiers.forEach((id) => map.set(id, true));
    return map;
  }, [enabledIdentifiers]);

  const tokensByIdentifier = hugeQueriesStore.allTokenMapByChainIdentifier;

  const totalPriceByIdentifier = useMemo(() => {
    const map = new Map<string, Dec>();

    tokensByIdentifier.forEach((tokens, identifier) => {
      const total = tokens.reduce((sum, viewToken) => {
        const price = priceStore.calculatePrice(viewToken.token);
        return price ? sum.add(price.toDec()) : sum;
      }, new Dec(0));

      map.set(identifier, total);
    });

    return map;
  }, [tokensByIdentifier, priceStore]);

  const nativeChainInfos: ModularChainInfo[] = useMemo(() => {
    return chainStore.groupedModularChainInfosInListUI.slice();
  }, [chainStore.groupedModularChainInfosInListUI]);

  const sortPriorityChainIdentifierMap = useMemo(() => {
    const m = new Map<string, boolean>();
    chainStore.enabledChainIdentifiers.forEach((id) => m.set(id, true));
    return m;
  }, [chainStore.enabledChainIdentifiers]);

  const chainSort = useCallback(
    (
      aModularChainInfo: ModularChainInfo,
      bModularChainInfo: ModularChainInfo
    ) => {
      const getBaseIdentifier = (info: ModularChainInfo): string => {
        if ("bitcoin" in info) {
          return ChainIdHelper.parse(info.bitcoin.chainId).identifier;
        }
        return ChainIdHelper.parse(info.chainId).identifier;
      };

      const aIdentifier = getBaseIdentifier(aModularChainInfo);
      const bIdentifier = getBaseIdentifier(bModularChainInfo);

      if (
        aIdentifier.startsWith("cosmoshub") &&
        !bIdentifier.startsWith("cosmoshub")
      ) {
        return -1;
      }
      if (
        !aIdentifier.startsWith("cosmoshub") &&
        bIdentifier.startsWith("cosmoshub")
      ) {
        return 1;
      }

      if (aIdentifier === "eip155:1" && bIdentifier !== "eip155:1") {
        return -1;
      }
      if (aIdentifier !== "eip155:1" && bIdentifier === "eip155:1") {
        return 1;
      }

      const btcPrefix =
        "bip122:000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
      const aIsBtc = aIdentifier.startsWith(btcPrefix);
      const bIsBtc = bIdentifier.startsWith(btcPrefix);
      if (aIsBtc && !bIsBtc) return -1;
      if (!aIsBtc && bIsBtc) return 1;

      const aVariantIdentifier = ChainIdHelper.parse(
        aModularChainInfo.chainId
      ).identifier;
      const bVariantIdentifier = ChainIdHelper.parse(
        bModularChainInfo.chainId
      ).identifier;

      const aHasPriority =
        sortPriorityChainIdentifierMap.has(aVariantIdentifier);
      const bHasPriority =
        sortPriorityChainIdentifierMap.has(bVariantIdentifier);
      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;

      const aPrice = totalPriceByIdentifier.get(aIdentifier) ?? new Dec(0);
      const bPrice = totalPriceByIdentifier.get(bIdentifier) ?? new Dec(0);

      if (!aPrice.equals(bPrice)) {
        return aPrice.gt(bPrice) ? -1 : 1;
      }

      return aModularChainInfo.chainName.localeCompare(
        bModularChainInfo.chainName
      );
    },
    [sortPriorityChainIdentifierMap, totalPriceByIdentifier]
  );

  const sortedNativeChainInfos = useMemo(() => {
    return nativeChainInfos.slice().sort(chainSort);
  }, [nativeChainInfos, chainSort]);

  const combinedChainInfos = useMemo(() => {
    return [...sortedNativeChainInfos, ...nonNativeModularChainInfos];
  }, [sortedNativeChainInfos, nonNativeModularChainInfos]);

  const nativeChainIdentifierSet = useMemo(() => {
    return new Set(
      nativeChainInfos.map((ci) => ChainIdHelper.parse(ci.chainId).identifier)
    );
  }, [nativeChainInfos]);

  const searchFields = useMemo(
    () => [
      "chainName",
      {
        key: "modularChainInfo.currency.coinDenom",
        function: (modularChainInfo: ModularChainInfo) => {
          if ("cosmos" in modularChainInfo) {
            try {
              const chainInfo = chainStore.getChain(
                modularChainInfo.cosmos.chainId
              );
              return CoinPretty.makeCoinDenomPretty(
                (chainInfo.stakeCurrency || chainInfo.currencies[0]).coinDenom
              );
            } catch {}
          } else if ("starknet" in modularChainInfo) {
            return CoinPretty.makeCoinDenomPretty(
              modularChainInfo.starknet.currencies[0].coinDenom
            );
          } else if ("bitcoin" in modularChainInfo) {
            return CoinPretty.makeCoinDenomPretty(
              modularChainInfo.bitcoin.currencies[0].coinDenom
            );
          }
          return "";
        },
      },
    ],
    [chainStore]
  );
  const filteredChainInfos = useSearch(
    combinedChainInfos,
    search,
    searchFields
  );

  const ecosystemFilteredChainInfos = useMemo(() => {
    return filteredChainInfos.filter((ci) => {
      switch (selectedEcosystem) {
        case "All":
          return true;
        case "Cosmos":
          return (
            "cosmos" in ci &&
            (() => {
              try {
                return !chainStore.isEvmOnlyChain(ci.chainId);
              } catch {
                return false;
              }
            })()
          );
        case "EVM":
          return (() => {
            try {
              return chainStore.isEvmOnlyChain(ci.chainId);
            } catch {
              return false;
            }
          })();
        case "Bitcoin":
          return "bitcoin" in ci;
        case "Starknet":
          return "starknet" in ci;
        default:
          return true;
      }
    });
  }, [filteredChainInfos, selectedEcosystem, chainStore]);

  const visibleChainInfos = useMemo(() => {
    if (!hideEnabled) {
      return ecosystemFilteredChainInfos;
    }
    return ecosystemFilteredChainInfos.filter((ci) => {
      const identifier = ChainIdHelper.parse(ci.chainId).identifier;
      return !(enabledIdentifierMap.get(identifier) || false);
    });
  }, [ecosystemFilteredChainInfos, hideEnabled, enabledIdentifierMap]);

  const applyEnableChange = async (
    chainIdentifier: string,
    enable: boolean
  ) => {
    if (!vaultId) return;

    const modInfo = chainStore.getModularChain(chainIdentifier);
    const chainId = modInfo.chainId;

    if (enable) {
      await chainStore.enableChainInfoInUIWithVaultId(vaultId, chainId);
    } else {
      await chainStore.disableChainInfoInUIWithVaultId(vaultId, chainId);
    }
  };

  const handleToggle = (chainIdentifier: string, enable: boolean) => {
    const linkedIdentifiers = (() => {
      try {
        const modInfo = chainStore.getModularChain(chainIdentifier);
        if ("linkedChainKey" in modInfo) {
          const key = (modInfo as any).linkedChainKey;
          return chainStore.modularChainInfos
            .filter(
              (ci) =>
                "linkedChainKey" in ci && (ci as any).linkedChainKey === key
            )
            .map((ci) => ChainIdHelper.parse(ci.chainId).identifier);
        }
      } catch {}
      return [];
    })();

    const identifiersToChange = new Set<string>([
      chainIdentifier,
      ...linkedIdentifiers,
    ]);

    setEnabledIdentifiers((prev) => {
      const set = new Set(prev);
      identifiersToChange.forEach((id) => {
        if (enable) {
          set.add(id);
        } else {
          set.delete(id);
        }
      });
      return Array.from(set);
    });

    identifiersToChange.forEach((id) => applyEnableChange(id, enable));
  };

  const handleToggleAllNative = useCallback(
    (enable: boolean) => {
      nativeChainIdentifierSet.forEach((id) => {
        const currentlyEnabled = enabledIdentifierMap.get(id) || false;
        if (currentlyEnabled !== enable) {
          handleToggle(id, enable);
        }
      });
    },
    [nativeChainIdentifierSet, enabledIdentifierMap, handleToggle]
  );

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.manage-chains.title",
        defaultMessage: "Manage Chains",
      })}
      left={<BackButton />}
    >
      <div style={{ padding: "0.75rem" }}>
        <SearchTextInput
          placeholder={intl.formatMessage({
            id: "page.manage-chains.search-placeholder",
            defaultMessage: "Search chain",
          })}
          value={search}
          onChange={(e) => {
            e.preventDefault();
            setSearch(e.target.value);
          }}
        />
        <Gutter size="0.75rem" />

        <Columns sum={1} gutter="0.25rem" alignY="center">
          <EcosystemFilterDropdown
            selected={selectedEcosystem}
            onSelect={setSelectedEcosystem}
          />
          <Column weight={1} />

          {(() => {
            const textColor =
              theme.mode === "light"
                ? hideEnabled
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
                : hideEnabled
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"];

            return (
              <HideEnabledText
                onClick={() => setHideEnabled(!hideEnabled)}
                style={{ color: textColor }}
              >
                Hide Enabled
              </HideEnabledText>
            );
          })()}
          <Gutter size="0.375rem" />
          <Checkbox
            size="extra-small"
            checked={hideEnabled}
            onChange={setHideEnabled}
          />
        </Columns>

        <Gutter size="1rem" />
        <Stack gutter="0.5rem">
          <AllNativeToggleItem
            nativeChainInfos={sortedNativeChainInfos}
            nativeChainIdentifierSet={nativeChainIdentifierSet}
            enabledIdentifierMap={enabledIdentifierMap}
            onToggleAll={handleToggleAllNative}
          />

          {visibleChainInfos.map((ci) => {
            const variantIdentifier = ChainIdHelper.parse(
              ci.chainId
            ).identifier;

            const baseIdentifier =
              "bitcoin" in ci
                ? ChainIdHelper.parse(ci.bitcoin.chainId).identifier
                : variantIdentifier;

            const tokens = tokensByIdentifier.get(baseIdentifier) || [];
            const identifier = variantIdentifier;
            return (
              <Box key={identifier}>
                <ChainToggleItem
                  modularChainInfo={ci}
                  tokens={tokens}
                  enabled={enabledIdentifierMap.get(identifier) || false}
                  disabled={
                    "cosmos" in ci
                      ? chainStore.hasChain(ci.chainId)
                        ? !chainStore.isInChainInfosInListUI(ci.chainId)
                        : false
                      : false
                  }
                  isNativeChain={nativeChainIdentifierSet.has(identifier)}
                  onToggle={(enable) => handleToggle(identifier, enable)}
                />
              </Box>
            );
          })}
          <div ref={infiniteScrollTriggerRef} />
        </Stack>
      </div>
    </HeaderLayout>
  );
});
