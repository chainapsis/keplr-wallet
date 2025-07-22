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
import { SelectDerivationPathModal } from "./components/select-derivation-path-modal";
import { ConnectLedgerModal } from "./components/connect-ledger-modal";
import { useKeyCoinTypeFinalize } from "./hooks/use-key-coin-type-finalize";

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
  const initialSearchValue = searchParams.get("initialSearchValue") ?? "";
  const [search, setSearch] = useState(initialSearchValue);

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

  const { needFinalizeKeyCoinTypeAction } = useKeyCoinTypeFinalize();

  const [isDerivationModalOpen, setIsDerivationModalOpen] = useState(false);
  const [derivationChainIds, setDerivationChainIds] = useState<string[]>([]);

  const [isConnectLedgerModalOpen, setIsConnectLedgerModalOpen] =
    useState(false);
  const [connectLedgerApp, setConnectLedgerApp] = useState("");
  const [connectLedgerChainId, setConnectLedgerChainId] = useState("");
  const [openEnableChainsRoute, setOpenEnableChainsRoute] = useState(false);

  const [
    backupSelectedNativeChainIdentifiers,
    setBackupSelectedNativeChainIdentifiers,
  ] = useState<string[]>([]);

  const applyEnableChange = useCallback(
    async (chainIdentifier: string, enable: boolean) => {
      if (!vaultId) return;

      const modInfo = chainStore.getModularChain(chainIdentifier);
      const chainId = modInfo.chainId;

      if (enable && keyRingStore.selectedKeyInfo?.type === "ledger") {
        const determineLedgerApp = (info: ModularChainInfo): string => {
          try {
            if (chainStore.isEvmOnlyChain(info.chainId)) {
              return "Ethereum";
            }
          } catch {}

          if ("starknet" in info) {
            return "Starknet";
          }
          if ("bitcoin" in info) {
            const coinType = info.bitcoin.bip44.coinType;
            return coinType === 1 ? "Bitcoin Test" : "Bitcoin";
          }

          return "Cosmos";
        };

        const ledgerApp = determineLedgerApp(modInfo);

        setConnectLedgerApp(ledgerApp);
        setConnectLedgerChainId(chainId);
        setOpenEnableChainsRoute(false);
        setIsConnectLedgerModalOpen(true);
        return;
      }

      if (enable) {
        try {
          const chainInfo = chainStore.getChain(chainId);
          const needModal = await needFinalizeKeyCoinTypeAction(
            vaultId,
            chainInfo
          );

          if (needModal) {
            setDerivationChainIds((prev) =>
              prev.includes(chainId) ? prev : [...prev, chainId]
            );
            setIsDerivationModalOpen(true);
          } else {
            await chainStore.enableChainInfoInUIWithVaultId(vaultId, chainId);
          }
        } catch {}
      } else {
        await chainStore.disableChainInfoInUIWithVaultId(vaultId, chainId);
      }
    },
    [chainStore, vaultId, needFinalizeKeyCoinTypeAction, keyRingStore]
  );

  const applyBatchEnableChange = useCallback(
    async (identifiers: string[], enable: boolean) => {
      if (!vaultId || identifiers.length === 0) return;

      if (enable) {
        for (const id of identifiers) {
          await applyEnableChange(id, true);
        }
      } else {
        await chainStore.disableChainInfoInUIWithVaultId(
          vaultId,
          ...identifiers
        );
      }
    },
    [vaultId, applyEnableChange, chainStore]
  );

  const setEnabledIdentifiersWithBatch = useCallback(
    (identifiers: string[], enable: boolean) => {
      applyBatchEnableChange(identifiers, enable);
    },
    [applyBatchEnableChange]
  );

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
      return !chainStore.isEnabledChain(ci.chainId);
    });
  }, [ecosystemFilteredChainInfos, hideEnabled, chainStore]);

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

    identifiersToChange.forEach((id) => applyEnableChange(id, enable));
  };

  const handleToggleAllNative = useCallback(async () => {
    if (keyRingStore.selectedKeyInfo?.type === "ledger") {
      setOpenEnableChainsRoute(true);
      setIsConnectLedgerModalOpen(true);
      return;
    }

    const nativeIds = Array.from(nativeChainIdentifierSet);
    const enabledNativeIds = nativeIds.filter((id) =>
      chainStore.isEnabledChain(id)
    );

    const isAllNativeSelected = enabledNativeIds.length === nativeIds.length;

    const processFinalize = async (ids: string[]) => {
      if (!vaultId) return;
      await Promise.allSettled(
        ids.map(async (id) => {
          try {
            const modInfo = chainStore.getModularChain(id);
            const chainId = modInfo.chainId;
            const chainInfo = chainStore.getChain(chainId);
            const needModal = await needFinalizeKeyCoinTypeAction(
              vaultId,
              chainInfo
            );
            if (needModal) {
              setDerivationChainIds((prev) =>
                prev.includes(chainId) ? prev : [...prev, chainId]
              );
              setIsDerivationModalOpen(true);
            }
          } catch {}
        })
      );
    };

    if (isAllNativeSelected) {
      if (backupSelectedNativeChainIdentifiers.length > 0) {
        const toEnable = backupSelectedNativeChainIdentifiers;
        const toDisable = nativeIds.filter((id) => !toEnable.includes(id));

        setEnabledIdentifiersWithBatch(toDisable, false);
        setEnabledIdentifiersWithBatch(toEnable, true);

        await processFinalize(toEnable);
      } else if (sortedNativeChainInfos.length > 0) {
        const first = sortedNativeChainInfos[0];
        const chainIdentifiers: string[] = [
          ChainIdHelper.parse(first.chainId).identifier,
        ];
        if ("linkedChainKey" in first) {
          const key = (first as any).linkedChainKey;
          sortedNativeChainInfos.forEach((ci) => {
            if ("linkedChainKey" in ci && (ci as any).linkedChainKey === key) {
              chainIdentifiers.push(ChainIdHelper.parse(ci.chainId).identifier);
            }
          });
        }

        const toDisable = nativeIds.filter(
          (id) => !chainIdentifiers.includes(id)
        );
        setEnabledIdentifiersWithBatch(toDisable, false);
      }
    } else {
      setBackupSelectedNativeChainIdentifiers(enabledNativeIds);

      const idsToEnable = nativeIds.filter(
        (id) => !enabledNativeIds.includes(id)
      );
      setEnabledIdentifiersWithBatch(idsToEnable, true);

      await processFinalize(idsToEnable);
    }
  }, [
    keyRingStore.selectedKeyInfo?.type,
    nativeChainIdentifierSet,
    backupSelectedNativeChainIdentifiers,
    sortedNativeChainInfos,
    setEnabledIdentifiersWithBatch,
    vaultId,
    chainStore,
    needFinalizeKeyCoinTypeAction,
  ]);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "pages.manage-chains.title",
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
                {intl.formatMessage({
                  id: "pages.manage-chains.hide-enabled-text",
                })}
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
            onToggleAll={() => handleToggleAllNative()}
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
                  enabled={chainStore.isEnabledChain(ci.chainId)}
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
      <SelectDerivationPathModal
        isOpen={isDerivationModalOpen}
        close={() => {
          setIsDerivationModalOpen(false);
          setDerivationChainIds([]);
        }}
        chainIds={derivationChainIds}
        vaultId={vaultId || ""}
      />
      <ConnectLedgerModal
        isOpen={isConnectLedgerModalOpen}
        close={() => setIsConnectLedgerModalOpen(false)}
        ledgerApp={connectLedgerApp}
        vaultId={vaultId || ""}
        chainId={connectLedgerChainId}
        openEnableChains={openEnableChainsRoute}
      />
    </HeaderLayout>
  );
});
