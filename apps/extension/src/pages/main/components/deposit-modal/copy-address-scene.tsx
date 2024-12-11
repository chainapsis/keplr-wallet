import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import {
  Caption1,
  Subtitle1,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ChainImageFallback } from "../../../../components/image";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  ArrowTopRightOnSquareIcon,
  CheckToggleIcon,
  CopyOutlineIcon,
  QRCodeIcon,
  StarIcon,
} from "../../../../components/icon";
import { IconButton } from "../../../../components/icon-button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../../components/transition";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { FolderMinusIcon } from "../../../../components/icon/folder-minus";
import { dispatchGlobalEventExceptSelf } from "../../../../utils/global-events";
import { isRunningInSidePanel } from "../../../../utils";

export const CopyAddressScene: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    uiConfigStore,
    queriesStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const runInSidePanel = isRunningInSidePanel();

  const searchRef = useFocusOnMount<HTMLInputElement>();

  useSceneEvents({
    onDidVisible: () => {
      if (searchRef.current) {
        // XXX: Scene transition 컴포넌트가 최초 scene의 경우 onDidVisible를 발생 못시키는 문제가 있다.
        //      이 문제 때문에 그냥 mount일때와 onDidVisible일때 모두 focus를 준다.
        searchRef.current.focus();
      }
    },
  });

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

  const sortChainsByPriority = (aChainId: string, bChainId: string) => {
    const aChainIdentifier = ChainIdHelper.parse(aChainId).identifier;
    const bChainIdentifier = ChainIdHelper.parse(bChainId).identifier;

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
  };

  const addresses: {
    modularChainInfo: ModularChainInfo;
    bech32Address?: string;
    ethereumAddress?: string;
    starknetAddress?: string;
  }[] = chainStore.modularChainInfosInUI
    .map((modularChainInfo) => {
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

      return {
        modularChainInfo,
        bech32Address,
        ethereumAddress,
        starknetAddress,
      };
    })
    .filter(({ modularChainInfo, bech32Address }) => {
      const s = search.trim().toLowerCase();
      if (s.length === 0) {
        return true;
      }

      if (modularChainInfo.chainId.toLowerCase().includes(s)) {
        return true;
      }

      if (modularChainInfo.chainName.toLowerCase().includes(s)) {
        return true;
      }

      if (bech32Address) {
        const bech32Split = bech32Address.split("1");
        if (bech32Split.length > 0) {
          if (bech32Split[0].toLowerCase().includes(s)) {
            return true;
          }
        }
      }

      if ("cosmos" in modularChainInfo && modularChainInfo.cosmos != null) {
        const cosmosChainInfo = modularChainInfo.cosmos;
        if (cosmosChainInfo.stakeCurrency) {
          if (
            cosmosChainInfo.stakeCurrency.coinDenom.toLowerCase().includes(s)
          ) {
            return true;
          }
        }
        if (cosmosChainInfo.currencies.length > 0) {
          const currency = cosmosChainInfo.currencies[0];
          if (!currency.coinMinimalDenom.startsWith("ibc/")) {
            if (currency.coinDenom.toLowerCase().includes(s)) {
              return true;
            }
          }
        }
      } else if (
        "starknet" in modularChainInfo &&
        modularChainInfo.starknet != null
      ) {
        const starknetChainInfo = modularChainInfo.starknet;
        if (starknetChainInfo.currencies.length > 0) {
          const currency = starknetChainInfo.currencies[0];
          if (currency.coinDenom.toLowerCase().includes(s)) {
            return true;
          }
        }
      }
    })
    .sort((a, b) => {
      return sortChainsByPriority(
        a.modularChainInfo.chainId,
        b.modularChainInfo.chainId
      );
    });

  const [blockInteraction, setBlockInteraction] = useState(false);

  const queryChains = queriesStore.simpleQuery.queryGet<{
    chains: ChainInfo[];
  }>(
    "https://7v6zjsr36fqrqcaeuqbhyrq46a0qndzt.lambda-url.us-west-2.on.aws",
    `/chains?filterOption=chain&searchText=${search.trim()}`
  );

  const { invisibleChainInfos, invisibleNativeChainInfos } = useMemo(() => {
    if (queryChains.isFetching || queryChains.response?.data == undefined) {
      return {
        invisibleChainInfos: [],
        invisibleNativeChainInfos: [],
        invisibleNonNativeChainInfos: [],
      };
    }

    const queriedChainInfos = queryChains.response.data.chains;
    const enabledModularChainInfos = chainStore.modularChainInfosInUI;

    let disabledChainInfos: (ChainInfo | ModularChainInfo)[] =
      queriedChainInfos.filter((chainInfo) => {
        return !enabledModularChainInfos.some(
          (modularChainInfo) => modularChainInfo.chainId === chainInfo.chainId
        );
      });

    const trimmedSearch = search.trim().toLowerCase();

    // starknet is not in the queryChains response. So, we need to add it manually
    // only if it is not enabled and it matches the search.
    const disabledStarknetChainInfos = chainStore.modularChainInfos.filter(
      (modularChainInfo) =>
        "starknet" in modularChainInfo &&
        !chainStore.isEnabledChain(modularChainInfo.chainId) &&
        (trimmedSearch.length === 0 ||
          modularChainInfo.chainId.toLowerCase().includes(trimmedSearch) ||
          modularChainInfo.chainName.toLowerCase().includes(trimmedSearch))
    );

    disabledChainInfos = [...disabledStarknetChainInfos, ...disabledChainInfos];

    const {
      invisibleChainInfos: unSortedInvisible,
      nativeChainInfos: unSortedNative,
      nonNativeChainInfos: unSortedNonNative,
    } = disabledChainInfos.reduce(
      (acc, chainInfo) => {
        let embedded: boolean | undefined = false;
        let addedInStore: boolean = true;

        const isStarknet = "starknet" in chainInfo;

        try {
          if (isStarknet) {
            embedded = true;
          } else {
            const chainInfoInStore = chainStore.getChain(chainInfo.chainId);

            if (!chainInfoInStore) {
              addedInStore = false;
            } else {
              if (chainInfoInStore.hideInUI) {
                return acc;
              }

              addedInStore = true;
              embedded = chainInfoInStore.embedded?.embedded;
            }
          }
        } catch (e) {
          // got an error while getting chain info
          embedded = undefined;
          addedInStore = false;
        }

        const chainItem = {
          embedded: !!embedded,
          addedInStore,
          chainInfo,
        };

        acc.invisibleChainInfos.push(chainItem);

        if (embedded) {
          acc.nativeChainInfos.push(chainItem);
        } else {
          acc.nonNativeChainInfos.push(chainItem);
        }

        return acc;
      },
      {
        invisibleChainInfos: [],
        nativeChainInfos: [],
        nonNativeChainInfos: [],
      } as {
        invisibleChainInfos: {
          embedded: boolean;
          addedInStore: boolean;
          chainInfo: ChainInfo | ModularChainInfo;
        }[];
        nativeChainInfos: {
          embedded: boolean;
          addedInStore: boolean;
          chainInfo: ChainInfo | ModularChainInfo;
        }[];
        nonNativeChainInfos: {
          embedded: boolean;
          addedInStore: boolean;
          chainInfo: ChainInfo | ModularChainInfo;
        }[];
      }
    );

    return {
      invisibleChainInfos: unSortedInvisible.sort((a, b) =>
        sortChainsByPriority(a.chainInfo.chainId, b.chainInfo.chainId)
      ),
      invisibleNativeChainInfos: unSortedNative.sort((a, b) =>
        sortChainsByPriority(a.chainInfo.chainId, b.chainInfo.chainId)
      ),
      invisibleNonNativeChainInfos: unSortedNonNative.sort((a, b) =>
        sortChainsByPriority(a.chainInfo.chainId, b.chainInfo.chainId)
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queryChains.isFetching,
    queryChains.response?.data,
    chainStore,
    chainStore.modularChainInfosInUI,
    sortPriorities,
  ]);

  const hasAddresses = addresses.length > 0;
  const hasInvisibleChains =
    (search.trim().length === 0 && invisibleNativeChainInfos.length > 0) ||
    (search.trim().length > 0 && invisibleChainInfos.length > 0);

  return (
    <Box
      paddingTop="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
      height={runInSidePanel ? "70vh" : undefined}
    >
      <YAxis alignX="center">
        <Subtitle1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette.white
          }
        >
          <FormattedMessage id="page.main.components.deposit-modal.title" />
        </Subtitle1>
      </YAxis>

      <Gutter size="0.75rem" />

      <Box paddingX="0.75rem">
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder={intl.formatMessage({
            id: "page.main.components.deposit-modal.search-placeholder",
          })}
        />
      </Box>

      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: runInSidePanel ? "" : "21.5rem",
        }}
      >
        {!hasAddresses && !hasInvisibleChains && !queryChains.isFetching && (
          <NoResultBox />
        )}

        <Box paddingX="0.75rem">
          {addresses
            .map((address) => {
              // CopyAddressItem 컴포넌트는 ethereumAddress가 있냐 없냐에 따라서 다르게 동작한다.
              // ethereumAddress가 있으면 두개의 CopyAddressItem 컴포넌트를 각각 렌더링하기 위해서
              // ethereumAddress가 있으면 두개의 address로 쪼개서 리턴하고 flat으로 펼져서 렌더링한다.
              if (address.ethereumAddress && address.bech32Address) {
                return [
                  {
                    modularChainInfo: address.modularChainInfo,
                    bech32Address: address.bech32Address,
                  },
                  {
                    ...address,
                  },
                ];
              }

              return address;
            })
            .flat()
            .map((address) => {
              return (
                <CopyAddressItem
                  key={
                    ChainIdHelper.parse(address.modularChainInfo.chainId)
                      .identifier +
                    address.bech32Address +
                    (address.ethereumAddress || "")
                  }
                  address={address}
                  close={close}
                  blockInteraction={blockInteraction}
                  setBlockInteraction={setBlockInteraction}
                  setSortPriorities={setSortPriorities}
                />
              );
            })}
        </Box>
        {hasAddresses && hasInvisibleChains && <Gutter size="1.25rem" />}
        {hasInvisibleChains && (
          <Box paddingX="0.75rem">
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-200"]
              }
            >
              <FormattedMessage id="page.main.components.deposit-modal.look-for-chains" />
            </Subtitle4>
            {search.trim().length > 0
              ? invisibleChainInfos.map((chainData) => {
                  return (
                    <EnableChainItem
                      key={chainData.chainInfo.chainId}
                      chainInfo={chainData.chainInfo}
                      embedded={chainData.embedded}
                      addedInStore={chainData.addedInStore}
                    />
                  );
                })
              : invisibleNativeChainInfos.map((chainData) => {
                  return (
                    <EnableChainItem
                      key={chainData.chainInfo.chainId}
                      chainInfo={chainData.chainInfo}
                      embedded={true}
                      addedInStore={chainData.addedInStore}
                    />
                  );
                })}
          </Box>
        )}
        <Gutter size="0.75rem" />
      </SimpleBar>
    </Box>
  );
});

const CopyAddressItem: FunctionComponent<{
  address: {
    modularChainInfo: ModularChainInfo;
    bech32Address?: string;
    ethereumAddress?: string;
    starknetAddress?: string;
  };
  close: () => void;
  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>
    ) => Record<string, true | undefined>
  ) => void;
}> = observer(
  ({
    address,
    close,
    blockInteraction,
    setBlockInteraction,
    setSortPriorities,
  }) => {
    const { analyticsStore, keyRingStore, uiConfigStore, chainStore } =
      useStore();

    const theme = useTheme();

    const sceneTransition = useSceneTransition();

    const [hasCopied, setHasCopied] = useState(false);

    const isBookmarked = keyRingStore.selectedKeyInfo
      ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          address.modularChainInfo.chainId
        )
      : false;

    const [isCopyContainerHover, setIsCopyContainerHover] = useState(false);
    const [isBookmarkHover, setIsBookmarkHover] = useState(false);

    const isEVMOnlyChain =
      "cosmos" in address.modularChainInfo &&
      address.modularChainInfo.cosmos != null &&
      chainStore.isEvmOnlyChain(address.modularChainInfo.chainId);

    // 클릭 영역 문제로 레이아웃이 복잡해졌다.
    // 알아서 잘 해결하자
    return (
      <Box height="4rem" borderRadius="0.375rem" alignY="center">
        <XAxis alignY="center">
          <Box
            height="4rem"
            borderRadius="0.375rem"
            alignY="center"
            backgroundColor={(() => {
              if (blockInteraction) {
                return;
              }

              if (isBookmarkHover) {
                return;
              }

              if (isCopyContainerHover) {
                return theme.mode === "light"
                  ? ColorPalette["gray-10"]
                  : ColorPalette["gray-550"];
              }

              return;
            })()}
            onHoverStateChange={(isHover) => {
              setIsCopyContainerHover(isHover);
            }}
            cursor={blockInteraction ? undefined : "pointer"}
            paddingLeft="1rem"
            style={{
              flex: 1,
            }}
            onClick={async (e) => {
              e.preventDefault();

              await navigator.clipboard.writeText(
                address.starknetAddress ||
                  address.ethereumAddress ||
                  address.bech32Address ||
                  ""
              );
              setHasCopied(true);
              setBlockInteraction(true);

              analyticsStore.logEvent("click_copyAddress_copy", {
                chainId: address.modularChainInfo.chainId,
                chainName: address.modularChainInfo.chainName,
              });
              setHasCopied(true);

              setTimeout(() => {
                close();
              }, 500);
            }}
          >
            <XAxis alignY="center">
              <Box
                cursor={
                  blockInteraction ||
                  (!isEVMOnlyChain && address.ethereumAddress)
                    ? undefined
                    : "pointer"
                }
                onHoverStateChange={(isHover) => {
                  setIsBookmarkHover(isHover);
                }}
                style={{
                  opacity: !isEVMOnlyChain && address.ethereumAddress ? 0 : 1,
                  pointerEvents:
                    !isEVMOnlyChain && address.ethereumAddress
                      ? "none"
                      : undefined,
                  color: (() => {
                    if (isBookmarked) {
                      if (!blockInteraction && isBookmarkHover) {
                        return theme.mode === "light"
                          ? ColorPalette["blue-300"]
                          : ColorPalette["blue-500"];
                      }
                      return ColorPalette["blue-400"];
                    }

                    if (!blockInteraction && isBookmarkHover) {
                      return theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-400"];
                    }

                    return theme.mode === "light"
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-300"];
                  })(),
                }}
                onClick={(e) => {
                  e.preventDefault();
                  // 컨테이너로의 전파를 막아야함
                  e.stopPropagation();

                  if (blockInteraction) {
                    return;
                  }

                  const newIsBookmarked = !isBookmarked;

                  analyticsStore.logEvent("click_favoriteChain", {
                    chainId: address.modularChainInfo.chainId,
                    chainName: address.modularChainInfo.chainName,
                    isFavorite: newIsBookmarked,
                  });

                  if (keyRingStore.selectedKeyInfo) {
                    if (newIsBookmarked) {
                      uiConfigStore.copyAddressConfig.bookmarkChain(
                        keyRingStore.selectedKeyInfo.id,
                        address.modularChainInfo.chainId
                      );
                    } else {
                      uiConfigStore.copyAddressConfig.unbookmarkChain(
                        keyRingStore.selectedKeyInfo.id,
                        address.modularChainInfo.chainId
                      );

                      setSortPriorities((priorities) => {
                        const identifier = ChainIdHelper.parse(
                          address.modularChainInfo.chainId
                        ).identifier;
                        const newPriorities = { ...priorities };
                        if (newPriorities[identifier]) {
                          delete newPriorities[identifier];
                        }
                        return newPriorities;
                      });
                    }
                  }
                }}
              >
                <StarIcon width="1.25rem" height="1.25rem" />
              </Box>
              <Gutter size="0.5rem" />

              <ChainImageFallback
                chainInfo={address.modularChainInfo}
                size="2rem"
              />
              <Gutter size="0.5rem" />
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["gray-10"]
                  }
                >
                  {address.modularChainInfo.chainName}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Caption1 color={ColorPalette["gray-300"]}>
                  {(() => {
                    if (address.starknetAddress) {
                      return `${address.starknetAddress.slice(
                        0,
                        10
                      )}...${address.starknetAddress.slice(-8)}`;
                    }

                    if (address.ethereumAddress) {
                      return address.ethereumAddress.length === 42
                        ? `${address.ethereumAddress.slice(
                            0,
                            10
                          )}...${address.ethereumAddress.slice(-8)}`
                        : address.ethereumAddress;
                    }

                    if (address.bech32Address) {
                      return Bech32Address.shortenAddress(
                        address.bech32Address,
                        20
                      );
                    }
                  })()}
                </Caption1>
              </YAxis>

              <div
                style={{
                  flex: 1,
                }}
              />

              <Box padding="0.5rem" alignX="center" alignY="center">
                {hasCopied ? (
                  <CheckToggleIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={ColorPalette["green-400"]}
                  />
                ) : (
                  <CopyOutlineIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette.white
                    }
                  />
                )}
              </Box>
              <Gutter size="0.5rem" />
            </XAxis>
          </Box>

          <Gutter size="0.38rem" />
          <XAxis alignY="center">
            <IconButton
              padding="0.5rem"
              hoverColor={
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-500"]
              }
              disabled={hasCopied}
              onClick={() => {
                sceneTransition.push("qr-code", {
                  chainId: address.modularChainInfo.chainId,
                  address:
                    address.starknetAddress ||
                    address.ethereumAddress ||
                    address.bech32Address,
                });
              }}
            >
              <QRCodeIcon
                width="1.25rem"
                height="1.25rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette.white
                }
              />
            </IconButton>
            <Gutter size="0.75rem" direction="horizontal" />
          </XAxis>
        </XAxis>
      </Box>
    );
  }
);

const EnableChainItem: FunctionComponent<{
  chainInfo: ChainInfo | ModularChainInfo;
  embedded: boolean;
  addedInStore: boolean;
}> = observer(({ chainInfo, embedded, addedInStore }) => {
  const { analyticsStore, chainStore, keyRingStore } = useStore();
  const theme = useTheme();
  const [isContainerHover, setIsContainerHover] = useState(false);

  return (
    <Box
      height="4rem"
      borderRadius="0.375rem"
      alignY="center"
      marginTop="0.75rem"
    >
      <Box
        height="4rem"
        borderRadius="0.375rem"
        alignY="center"
        backgroundColor={
          isContainerHover
            ? theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-500"]
            : theme.mode === "light"
            ? ColorPalette["gray-10"]
            : ColorPalette["gray-550"]
        }
        onHoverStateChange={(isHover) => {
          setIsContainerHover(isHover);
        }}
        cursor="pointer"
        paddingX="1rem"
        onClick={async () => {
          // If the chain is not embedded and not added to the store,
          // add the chain internally and refresh the store.
          if (!embedded && !addedInStore) {
            try {
              await window.keplr?.experimentalSuggestChain(
                chainInfo as ChainInfo
              );
              await keyRingStore.refreshKeyRingStatus();
              await chainStore.updateChainInfosFromBackground();
              await chainStore.updateEnabledChainIdentifiersFromBackground();

              dispatchGlobalEventExceptSelf("keplr_suggested_chain_added");
            } catch {
              return;
            }
          }

          if (keyRingStore.selectedKeyInfo) {
            analyticsStore.logEvent("click_enableChain", {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
            });

            browser.tabs.create({
              url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true&initialSearchValue=${chainInfo.chainName}`,
            });
          }
        }}
      >
        <XAxis alignY="center">
          <ChainImageFallback chainInfo={chainInfo} size="2rem" />
          <Gutter size="0.5rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            }
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {chainInfo.chainName}
          </Subtitle3>
          <div style={{ flex: 1 }} />
          <Box minWidth="8.5rem">
            <XAxis alignY="center">
              <Subtitle3
                color={
                  isContainerHover
                    ? theme.mode === "light"
                      ? ColorPalette["blue-200"]
                      : ColorPalette["gray-100"]
                    : theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage id="page.main.components.deposit-modal.enable-chain" />
              </Subtitle3>
              <Gutter size="0.25rem" />
              <ArrowTopRightOnSquareIcon
                width="1.125rem"
                height="1.125rem"
                color={
                  isContainerHover
                    ? theme.mode === "light"
                      ? ColorPalette["blue-200"]
                      : ColorPalette["gray-100"]
                    : theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["gray-200"]
                }
              />
            </XAxis>
          </Box>
        </XAxis>
      </Box>
    </Box>
  );
});

const NoResultBox: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <Box alignX="center" alignY="center" paddingY="1.875rem">
      <FolderMinusIcon
        width="4.5rem"
        height="4.5rem"
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
      />
      <Gutter size="0.75rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
        style={{
          textAlign: "center",
          width: "17.25rem",
        }}
      >
        <FormattedMessage id="page.main.components.deposit-modal.empty-text" />
      </Subtitle3>
    </Box>
  );
};
