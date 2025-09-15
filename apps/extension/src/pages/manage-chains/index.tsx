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
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
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
import { EmbedChainInfos } from "../../config";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { KeyRingCosmosService } from "@keplr-wallet/background";

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

  const keyType = keyRingStore.selectedKeyInfo?.type;

  const { chains: searchedNonNativeChainInfos, infiniteScrollTriggerRef } =
    useGetAllNonNativeChain({
      search,
      fallbackEthereumLedgerApp: false,
      fallbackStarknetLedgerApp: false,
      keyType,
    });

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
  ] = useState(chainStore.enabledChainIdentifiers);

  const determineLedgerApp = (info: ModularChainInfo, _cid: string): string => {
    // TODO
    // if ("cosmos" in info && chainStore.isEvmOrEthermintLikeChain(cid)) {
    if ("cosmos" in info) {
      return "Ethereum";
    }

    if ("starknet" in info) {
      return "Starknet";
    }
    if ("bitcoin" in info) {
      const coinType = info.bitcoin.bip44.coinType;
      return coinType === 1 ? "Bitcoin Test" : "Bitcoin";
    }

    return "Cosmos";
  };

  const applyEnableChange = useCallback(
    async (chainId: string, enable: boolean) => {
      if (!vaultId || !chainId) return;

      if (enable) {
        if (!chainStore.hasChain(chainId)) {
          const keplr = await getKeplrFromWindow();
          const chainInfoToSuggest = searchedNonNativeChainInfos.find(
            (c) =>
              ChainIdHelper.parse(c.chainId).identifier ===
              ChainIdHelper.parse(chainId).identifier
          );
          if (chainInfoToSuggest && keplr) {
            try {
              await keplr.experimentalSuggestChain(chainInfoToSuggest);
              await keyRingStore.refreshKeyRingStatus();
              await chainStore.updateChainInfosFromBackground();
              await chainStore.updateEnabledChainIdentifiersFromBackground();
            } catch (e) {
              console.error("Failed to suggest chain", chainId, e);
            }
          }
        }

        if (chainStore.hasChain(chainId)) {
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
        }

        if (chainStore.hasModularChain(chainId)) {
          if (keyRingStore.selectedKeyInfo?.type === "ledger") {
            const modularChainInfo = chainStore.getModularChain(chainId);
            const ledgerApp = determineLedgerApp(modularChainInfo, chainId);

            const alreadyAppended = Boolean(
              keyRingStore.selectedKeyInfo?.insensitive?.[ledgerApp]
            );

            if (!alreadyAppended) {
              setConnectLedgerApp(ledgerApp);
              setConnectLedgerChainId(chainId);
              setOpenEnableChainsRoute(false);
              setIsConnectLedgerModalOpen(true);
              return;
            }
          }

          await chainStore.enableChainInfoInUIWithVaultId(vaultId, chainId);
        }
      } else {
        await chainStore.disableChainInfoInUIWithVaultId(vaultId, chainId);
      }
    },
    [
      chainStore,
      vaultId,
      needFinalizeKeyCoinTypeAction,
      keyRingStore,
      searchedNonNativeChainInfos,
    ]
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

  const sortPriorityChainIdentifierMap = useMemo(() => {
    const m = new Map<string, boolean>();
    chainStore.enabledChainIdentifiers.forEach((id) => m.set(id, true));
    return m;
  }, [chainStore.enabledChainIdentifiers]);

  const chainSort = useCallback(
    (
      aModularChainInfo:
        | ModularChainInfo
        | (ModularChainInfo & {
            linkedModularChainInfos?: ModularChainInfo[] | undefined;
          }),
      bModularChainInfo:
        | ModularChainInfo
        | (ModularChainInfo & {
            linkedModularChainInfos?: ModularChainInfo[] | undefined;
          })
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

  // 검색 뿐만 아니라 로직에 따른 선택할 수 있는 체인 목록을 가지고 있다.
  // 그러니까 로직을 파악해서 주의해서 사용해야함.
  // 그리고 이를 토대로 balance에 따른 sort를 진행한다.
  // queries store의 구조 문제로 useMemo 안에서 balance에 따른 sort를 진행하긴 힘들다.
  // 그래서 이를 위한 변수로 따로 둔다.
  // 실제로는 modularChainInfos를 사용하면 된다.
  // linkedChainKey를 기반으로 그룹화된 체인을 `linkedModularChainInfos`로 가지고 있다.
  const preSortGroupedModularChainInfos = useMemo(() => {
    let modularChainInfos = chainStore.groupedModularChainInfosInListUI.slice();

    if (keyType === "ledger") {
      modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
        if ("cosmos" in modularChainInfo) {
          const chainInfo = chainStore.getChain(
            modularChainInfo.cosmos.chainId
          );
          const isEthermintLike =
            chainInfo.bip44.coinType === 60 ||
            !!chainInfo.features?.includes("eth-address-gen") ||
            !!chainInfo.features?.includes("eth-key-sign");

          // Ledger일 경우 ethereum app을 바로 처리할 수 없다.
          // 이 경우 빼줘야한다.
          if (isEthermintLike) {
            return false;
          }

          return true;
        }
      });
    }

    if (keyType === "keystone") {
      modularChainInfos = modularChainInfos.filter((modularChainInfo) => {
        // keystone은 스타크넷을 지원하지 않는다.
        // CHECK: 비트코인 지원 여부 확인 필요
        if ("starknet" in modularChainInfo || "bitcoin" in modularChainInfo) {
          return false;
        }
        return true;
      });
    }

    return modularChainInfos;
  }, [chainStore, keyType, chainStore.groupedModularChainInfosInListUI]);

  const nativeChainIdentifierSet = useMemo(
    () =>
      new Set(
        EmbedChainInfos.filter((chainInfo) => {
          if ("hideInUI" in chainInfo && chainInfo.hideInUI) {
            return false;
          }
          return true;
        }).map((chainInfo) => ChainIdHelper.parse(chainInfo.chainId).identifier)
      ),
    []
  );

  const nativeGroupedModularChainInfos = preSortGroupedModularChainInfos
    .filter((modularChainInfo) =>
      nativeChainIdentifierSet.has(
        ChainIdHelper.parse(modularChainInfo.chainId).identifier
      )
    )
    .sort(chainSort);

  const suggestGroupedModularChainInfos = preSortGroupedModularChainInfos
    .filter(
      (modularChainInfo) =>
        !nativeChainIdentifierSet.has(
          ChainIdHelper.parse(modularChainInfo.chainId).identifier
        )
    )
    .sort(chainSort);

  const searchFields = useMemo(
    () => [
      "chainName",
      {
        key: "chainInfo.currency.coinDenom",
        function: (chainInfo: ModularChainInfo | ChainInfo) => {
          if (
            "cosmos" in chainInfo &&
            chainStore.hasChain(chainInfo.chainId) &&
            "cosmos" in chainInfo
          ) {
            const cosmosChainInfo = chainStore.getChain(
              chainInfo.cosmos.chainId
            );
            return CoinPretty.makeCoinDenomPretty(
              (cosmosChainInfo.stakeCurrency || cosmosChainInfo.currencies[0])
                .coinDenom
            );
          } else if ("starknet" in chainInfo) {
            return CoinPretty.makeCoinDenomPretty(
              chainInfo.starknet.currencies[0].coinDenom
            );
          } else if ("bitcoin" in chainInfo) {
            return CoinPretty.makeCoinDenomPretty(
              chainInfo.bitcoin.currencies[0].coinDenom
            );
          }
          return "";
        },
      },
    ],
    [chainStore]
  );

  const showLedgerChains = keyType === "ledger";

  const nativeChains = Array.from(
    new Set([
      ...nativeGroupedModularChainInfos,
      ...suggestGroupedModularChainInfos,
      ...(showLedgerChains ? chainStore.groupedModularChainInfos : []),
    ])
  ).sort(chainSort);

  const searchedAllChains = useSearch(
    [
      ...nativeChains,
      ...searchedNonNativeChainInfos.filter(
        (chainInfo) => !chainStore.hasModularChain(chainInfo.chainId)
      ),
    ],
    search,
    searchFields
  ).filter((chainInfo) => {
    if (keyType === "ledger") {
      const cosmosChainInfo = (() => {
        if ("cosmos" in chainInfo) {
          return chainInfo.cosmos;
        }
        if ("currencies" in chainInfo && "feeCurrencies" in chainInfo) {
          return chainInfo;
        }
      })();
      if (cosmosChainInfo) {
        // cosmos 계열이면서 ledger일때
        // background에서 ledger를 지원하지 않는 체인은 다 지워줘야한다.
        try {
          if (cosmosChainInfo.features?.includes("force-enable-evm-ledger")) {
            return true;
          }

          KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
            cosmosChainInfo.chainId
          );
          return true;
        } catch {
          return false;
        }
      }
    }

    return true;
  });

  const ecosystemFilteredChainInfos = useMemo(() => {
    return searchedAllChains.filter((ci) => {
      switch (selectedEcosystem) {
        case "All":
          return true;
        case "Cosmos":
          return (
            "cosmos" in ci &&
            chainStore.hasChain(ci.chainId) &&
            !chainStore.isEvmOnlyChain(ci.chainId)
          );
        case "EVM":
          return (
            "cosmos" in ci &&
            chainStore.hasChain(ci.chainId) &&
            chainStore.isEvmOnlyChain(ci.chainId)
          );
        case "Bitcoin":
          return "bitcoin" in ci;
        case "Starknet":
          return "starknet" in ci;
        default:
          return true;
      }
    });
  }, [searchedAllChains, selectedEcosystem, chainStore]);

  const visibleChainInfos = useMemo(() => {
    if (!hideEnabled) {
      return ecosystemFilteredChainInfos;
    }
    return ecosystemFilteredChainInfos.filter((ci) => {
      return !chainStore.isEnabledChain(ci.chainId);
    });
  }, [ecosystemFilteredChainInfos, hideEnabled, chainStore]);

  const handleToggle = async (chainIdentifier: string, enable: boolean) => {
    const linkedIdentifiers = (() => {
      if (!chainIdentifier || !chainStore.hasModularChain(chainIdentifier)) {
        return [];
      }

      const modInfo = chainStore.getModularChain(chainIdentifier);

      if ("linkedChainKey" in modInfo) {
        const key = (modInfo as any).linkedChainKey;
        return chainStore.modularChainInfos
          .filter(
            (ci) => "linkedChainKey" in ci && (ci as any).linkedChainKey === key
          )
          .map((ci) => ChainIdHelper.parse(ci.chainId).identifier);
      }

      return [];
    })();

    const identifiersToChange = new Set<string>([
      chainIdentifier,
      ...linkedIdentifiers,
    ]);

    await Promise.all(
      Array.from(identifiersToChange).map((id) => applyEnableChange(id, enable))
    );
  };

  const processFinalize = async (ids: string[]) => {
    if (!vaultId) return;
    let needToOpenModal = false;
    const chainIds = new Set<string>();

    await Promise.all(
      ids.map(async (id) => {
        if (!id || !chainStore.hasChain(id)) return;

        const chainInfo = chainStore.getChain(id);
        const needModal = await needFinalizeKeyCoinTypeAction(
          vaultId,
          chainInfo
        );
        if (needModal) {
          chainIds.add(id);
          needToOpenModal = true;
        }
      })
    );

    if (needToOpenModal && chainIds.size > 0) {
      setDerivationChainIds(Array.from(chainIds).sort());
      setIsDerivationModalOpen(true);
    }
  };

  const handleToggleAllNative = async () => {
    if (!vaultId) return;
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

    if (isAllNativeSelected) {
      if (
        backupSelectedNativeChainIdentifiers.length > 0 &&
        backupSelectedNativeChainIdentifiers.length < nativeIds.length
      ) {
        const toDisable = nativeIds.filter(
          (id) => !backupSelectedNativeChainIdentifiers.includes(id)
        );
        await chainStore.disableChainInfoInUIWithVaultId(vaultId, ...toDisable);
      } else {
        const [first, ...rest] = nativeGroupedModularChainInfos;
        await applyEnableChange(first.chainId, true);
        await chainStore.disableChainInfoInUIWithVaultId(
          vaultId,
          ...rest.map((ci) => ci.chainId)
        );
      }
    } else {
      setBackupSelectedNativeChainIdentifiers(enabledNativeIds);

      const idsToEnable = nativeIds.filter(
        (id) => !enabledNativeIds.includes(id)
      );
      await chainStore.enableChainInfoInUIWithVaultId(vaultId, ...idsToEnable);
      await processFinalize(idsToEnable);
    }
  };

  const handleDerivationModalClose = async () => {
    if (vaultId && derivationChainIds.length > 0) {
      const toDisable = new Set<string>();

      await Promise.all(
        derivationChainIds.map(async (chainId) => {
          if (!chainId || !chainStore.hasChain(chainId)) return;
          const chainInfo = chainStore.getChain(chainId);
          const stillNeed = await needFinalizeKeyCoinTypeAction(
            vaultId,
            chainInfo
          );

          if (stillNeed) {
            toDisable.add(chainId);
          }
        })
      );

      if (toDisable.size > 0) {
        await chainStore.disableChainInfoInUIWithVaultId(
          vaultId,
          ...Array.from(toDisable)
        );
      }
    }

    setIsDerivationModalOpen(false);
    setDerivationChainIds([]);
  };

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
            id: "pages.manage-chains.search-input-placeholder",
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
            nativeChainInfos={nativeGroupedModularChainInfos}
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
                  chainInfo={ci}
                  tokens={tokens}
                  enabled={
                    chainStore.isEnabledChain(ci.chainId) &&
                    chainStore.hasModularChain(ci.chainId)
                  }
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
        close={handleDerivationModalClose}
        chainIds={derivationChainIds}
        vaultId={vaultId || ""}
      />
      <ConnectLedgerModal
        isOpen={isConnectLedgerModalOpen}
        close={() => {
          setIsConnectLedgerModalOpen(false);
          setOpenEnableChainsRoute(false);
          setConnectLedgerApp("");
          setConnectLedgerChainId("");
        }}
        ledgerApp={connectLedgerApp}
        vaultId={vaultId || ""}
        chainId={connectLedgerChainId}
        openEnableChains={openEnableChainsRoute}
      />
    </HeaderLayout>
  );
});
