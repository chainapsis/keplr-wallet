import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import {
  BaseTypography,
  Caption1,
  Subtitle3,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { ChainImageFallback } from "../../../../components/image";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  CheckToggleIcon,
  CopyOutlineIcon,
  QRCodeIcon,
  StarIcon,
} from "../../../../components/icon";
import { IconButton } from "../../../../components/icon-button";
import { Address } from "../deposit-modal/copy-address-scene";

export interface CopyAddressItemHandle {
  triggerCopy: () => void;
}

interface CopyAddressItemProps {
  address: Address;
  close: () => void;
  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>
    ) => Record<string, true | undefined>
  ) => void;
  onClick: () => void;
  // QR scene이 일반 modal, float modal에서 스타일이 조금 다르기 때문에
  // 분리해서 prop을 따로 줄 수 있게 함
  onClickIcon: () => void;
  hoverColor?: string;
  isFocused?: boolean;

  // cursor hover 상태에서 search로 검색을 하면
  // CopyAddressItemList애서 각 CopyAddressItem onMouseEnter가 호출되는 타이밍과
  // search 값 변경으로 발생하는 effect의 호출 타이밍이 onMouseEnter가 먼저 실행되는게 보장이 안됨
  // 해서 preventHover과 isHovered를 통해서 부모에서 해당 컴포넌트의 hover 상태를 제어함
  isHovered?: boolean;
  preventHover?: boolean;
}

export const CopyAddressItem = observer(
  forwardRef<CopyAddressItemHandle, CopyAddressItemProps>(
    function CopyAddressItemComponent(
      {
        address,
        close,
        blockInteraction,
        setBlockInteraction,
        setSortPriorities,
        onClick,
        onClickIcon,
        hoverColor,
        isFocused = false,
        isHovered = false,
        preventHover = false,
      }: CopyAddressItemProps,
      ref
    ) {
      const { analyticsStore, keyRingStore, uiConfigStore, chainStore } =
        useStore();

      const theme = useTheme();

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

      const executeCopy = useCallback(async () => {
        if (blockInteraction) {
          return;
        }

        onClick();

        await navigator.clipboard.writeText(
          address.starknetAddress ||
            address.ethereumAddress ||
            address.bech32Address ||
            address.bitcoinAddress?.bech32Address ||
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
      }, [
        address,
        analyticsStore,
        blockInteraction,
        close,
        onClick,
        setBlockInteraction,
      ]);

      useImperativeHandle(
        ref,
        () => ({
          triggerCopy: () => {
            void executeCopy();
          },
        }),
        [executeCopy]
      );

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

                const hoverColorInner =
                  hoverColor ||
                  (theme.mode === "light"
                    ? ColorPalette["gray-10"]
                    : ColorPalette["gray-550"]);

                if (preventHover && isFocused) {
                  return hoverColorInner;
                }

                if (preventHover) {
                  return;
                }

                if (isFocused || isHovered || isCopyContainerHover) {
                  return hoverColorInner;
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

                await executeCopy();
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
                  <Box
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: "0.25rem",
                    }}
                  >
                    <Subtitle3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-10"]
                      }
                    >
                      {address.modularChainInfo.chainName}
                    </Subtitle3>
                    {address.bitcoinAddress && (
                      <Box
                        alignX="center"
                        alignY="center"
                        backgroundColor={
                          theme.mode === "light"
                            ? ColorPalette["blue-50"]
                            : ColorPalette["gray-500"]
                        }
                        borderRadius="0.375rem"
                        paddingY="0.125rem"
                        paddingX="0.375rem"
                        style={{
                          flexShrink: 0,
                        }}
                      >
                        <BaseTypography
                          style={{
                            fontWeight: 400,
                            fontSize: "0.6875rem",
                          }}
                          color={
                            theme.mode === "light"
                              ? ColorPalette["blue-400"]
                              : ColorPalette["gray-200"]
                          }
                        >
                          {address.bitcoinAddress.paymentType
                            .replace("-", " ")
                            .replace(/\b\w/g, (char: string) =>
                              char.toUpperCase()
                            )}
                        </BaseTypography>
                      </Box>
                    )}
                  </Box>
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

                      if (address.bitcoinAddress?.bech32Address) {
                        return Bech32Address.shortenAddress(
                          address.bitcoinAddress.bech32Address,
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
                  hoverColor ||
                  (theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"])
                }
                disabled={hasCopied}
                onClick={onClickIcon}
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
  )
);

CopyAddressItem.displayName = "CopyAddressItem";
