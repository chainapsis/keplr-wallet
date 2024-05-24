import React, { FunctionComponent, useState } from "react";
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
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import { ChainImageFallback, Image } from "../../../../components/image";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import {
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
import { IChainInfoImpl } from "@keplr-wallet/stores";

export const CopyAddressScene: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    uiConfigStore,
    analyticsStore,
  } = useStore();

  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");

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
    for (const chainInfo of chainStore.chainInfosInUI) {
      if (
        uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          chainInfo.chainId
        )
      ) {
        res[chainInfo.chainIdentifier] = true;
      }
    }
    return res;
  });

  const addresses: {
    chainInfo: IChainInfoImpl;
    bech32Address?: string;
    ethereumAddress?: string;
  }[] = chainStore.chainInfosInUI
    .map((chainInfo) => {
      const accountInfo = accountStore.getAccount(chainInfo.chainId);

      const bech32Address = (() => {
        if (chainInfo.chainId.startsWith("eip155")) {
          return undefined;
        }

        return accountInfo.bech32Address;
      })();
      const ethereumAddress = (() => {
        if (chainInfo.chainId.startsWith("injective")) {
          return undefined;
        }

        return accountInfo.hasEthereumHexAddress
          ? accountInfo.ethereumHexAddress
          : undefined;
      })();

      return {
        chainInfo,
        bech32Address,
        ethereumAddress,
      };
    })
    .filter((address) => {
      const s = search.trim().toLowerCase();
      if (s.length === 0) {
        return true;
      }

      if (address.chainInfo.chainId.toLowerCase().includes(s)) {
        return true;
      }
      if (address.chainInfo.chainName.toLowerCase().includes(s)) {
        return true;
      }

      if (address.bech32Address) {
        const bech32Split = address.bech32Address.split("1");
        if (bech32Split.length > 0) {
          if (bech32Split[0].toLowerCase().includes(s)) {
            return true;
          }
        }
      }

      if (address.chainInfo.stakeCurrency) {
        if (
          address.chainInfo.stakeCurrency.coinDenom.toLowerCase().includes(s)
        ) {
          return true;
        }
      }
      if (address.chainInfo.currencies.length > 0) {
        const currency = address.chainInfo.currencies[0];
        if (!currency.coinMinimalDenom.startsWith("ibc/")) {
          if (currency.coinDenom.toLowerCase().includes(s)) {
            return true;
          }
        }
      }
    })
    .sort((a, b) => {
      const aPriority = sortPriorities[a.chainInfo.chainIdentifier];
      const bPriority = sortPriorities[b.chainInfo.chainIdentifier];

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

  const [blockInteraction, setBlockInteraction] = useState(false);

  return (
    <Box
      paddingTop="1.25rem"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
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
          height: "21.5rem",
        }}
      >
        {addresses.length === 0 ? (
          <Box
            alignX="center"
            alignY="center"
            paddingX="1.625rem"
            paddingTop="3.1rem"
            paddingBottom="3.2rem"
          >
            <Image
              width="140px"
              height="160px"
              src={require(theme.mode === "light"
                ? "../../../../public/assets/img/copy-address-no-search-result-light.png"
                : "../../../../public/assets/img/copy-address-no-search-result.png")}
              alt="copy-address-no-search-result-image"
            />
            <Gutter size="0.75rem" />

            <Subtitle3
              color={ColorPalette["gray-300"]}
              style={{ textAlign: "center" }}
            >
              <FormattedMessage
                id="page.main.components.deposit-modal.empty-text"
                values={{
                  link: (chunks) => (
                    <Subtitle3
                      as="a"
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={(e) => {
                        e.preventDefault();

                        if (keyRingStore.selectedKeyInfo) {
                          analyticsStore.logEvent(
                            "click_menu_manageChainVisibility"
                          );
                          browser.tabs
                            .create({
                              url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                            })
                            .then(() => {
                              window.close();
                            });
                        }
                      }}
                    >
                      {chunks}
                    </Subtitle3>
                  ),
                }}
              />
            </Subtitle3>
          </Box>
        ) : null}

        <Box paddingX="0.75rem">
          {addresses
            .map((address) => {
              // CopyAddressItem 컴포넌트는 ethereumAddress가 있냐 없냐에 따라서 다르게 동작한다.
              // ethereumAddress가 있으면 두개의 CopyAddressItem 컴포넌트를 각각 렌더링하기 위해서
              // ethereumAddress가 있으면 두개의 address로 쪼개서 리턴하고 flat으로 펼져서 렌더링한다.
              if (address.ethereumAddress && address.bech32Address) {
                return [
                  {
                    chainInfo: address.chainInfo,
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
                    address.chainInfo.chainIdentifier +
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
      </SimpleBar>
    </Box>
  );
});

const CopyAddressItem: FunctionComponent<{
  address: {
    chainInfo: IChainInfoImpl;
    bech32Address?: string;
    ethereumAddress?: string;
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
    const { analyticsStore, keyRingStore, uiConfigStore } = useStore();

    const theme = useTheme();

    const sceneTransition = useSceneTransition();

    const [hasCopied, setHasCopied] = useState(false);

    const isBookmarked = keyRingStore.selectedKeyInfo
      ? uiConfigStore.copyAddressConfig.isBookmarkedChain(
          keyRingStore.selectedKeyInfo.id,
          address.chainInfo.chainId
        )
      : false;

    const [isCopyContainerHover, setIsCopyContainerHover] = useState(false);
    const [isBookmarkHover, setIsBookmarkHover] = useState(false);

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
                address.ethereumAddress || address.bech32Address || ""
              );
              setHasCopied(true);
              setBlockInteraction(true);

              analyticsStore.logEvent("click_copyAddress_copy", {
                chainId: address.chainInfo.chainId,
                chainName: address.chainInfo.chainName,
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
                  blockInteraction || address.ethereumAddress
                    ? undefined
                    : "pointer"
                }
                onHoverStateChange={(isHover) => {
                  setIsBookmarkHover(isHover);
                }}
                style={{
                  opacity: address.ethereumAddress ? 0 : 1,
                  pointerEvents: address.ethereumAddress ? "none" : undefined,
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
                    chainId: address.chainInfo.chainId,
                    chainName: address.chainInfo.chainName,
                    isFavorite: newIsBookmarked,
                  });

                  if (keyRingStore.selectedKeyInfo) {
                    if (newIsBookmarked) {
                      uiConfigStore.copyAddressConfig.bookmarkChain(
                        keyRingStore.selectedKeyInfo.id,
                        address.chainInfo.chainId
                      );
                    } else {
                      uiConfigStore.copyAddressConfig.unbookmarkChain(
                        keyRingStore.selectedKeyInfo.id,
                        address.chainInfo.chainId
                      );

                      setSortPriorities((priorities) => {
                        const identifier = ChainIdHelper.parse(
                          address.chainInfo.chainId
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

              <ChainImageFallback chainInfo={address.chainInfo} size="2rem" />
              <Gutter size="0.5rem" />
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["gray-10"]
                  }
                >
                  {address.chainInfo.chainName}
                </Subtitle3>
                <Gutter size="0.25rem" />
                <Caption1 color={ColorPalette["gray-300"]}>
                  {(() => {
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
                  chainId: address.chainInfo.chainId,
                  address: address.ethereumAddress || address.bech32Address,
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
