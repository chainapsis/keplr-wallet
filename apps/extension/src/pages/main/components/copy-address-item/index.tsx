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
  Body3,
  Subtitle3,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { ChainImageFallback } from "../../../../components/image";
import { Bech32Address, ChainIdHelper } from "@keplr-wallet/cosmos";
import { CheckToggleIcon, QRCodeIcon } from "../../../../components/icon";
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
  // QR scene이 일반 modal, float modal에서 스타일이 조금 다르기 때문에
  // 분리해서 prop을 따로 줄 수 있게 함
  onClickIcon: () => void;
  hoverColor?: string;
  isFocused?: boolean;

  preventHover?: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onPointerMove: () => void;
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
        onClickIcon,
        hoverColor,
        isFocused = false,
        preventHover = false,
        onHoverEnter,
        onHoverLeave,
        onPointerMove,
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

      const [isBookmarkHover, setIsBookmarkHover] = useState(false);

      const isEVMOnlyChain =
        "cosmos" in address.modularChainInfo &&
        address.modularChainInfo.cosmos != null &&
        chainStore.isEvmOnlyChain(address.modularChainInfo.chainId);

      const executeCopy = useCallback(async () => {
        if (blockInteraction) {
          return;
        }

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
        <Box height="3.5rem" borderRadius="0.375rem" alignY="center">
          <XAxis alignY="center">
            <Box
              cursor={
                blockInteraction || (!isEVMOnlyChain && address.ethereumAddress)
                  ? undefined
                  : "pointer"
              }
              onMouseMove={onPointerMove}
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
                  const defaultColor =
                    theme.mode === "light"
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-300"];

                  if (preventHover) {
                    return defaultColor;
                  }

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

                  return defaultColor;
                })(),
              }}
              onClick={(e) => {
                if (preventHover) {
                  return;
                }

                e.preventDefault();
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
              <_StarIcon />
            </Box>

            <Gutter size="0.5rem" />
            <Box
              height="3.5rem"
              borderRadius="0.375rem"
              alignY="center"
              paddingLeft="0.5rem"
              // hover와 backgroundColor를 따로 처리하는 이유는
              // js로 hover style을 처리 하면 커서가 해당 컴포넌트 위에 있을때
              // 검색을 하게 되면 hover 스타일을 제거 했다가.
              // 다시 커서가 해당 컴포넌트 위에서 움직이면 hover 스타일을 다시 적용해야 하는데
              // 이걸 js로 처리하려면 QR 아이콘 쪽에서도 처리를 해야 돼서 좀 복잡해짐
              // css로 하면 browser가 알아서 처리해줘서 이렇게 처리함
              hover={{
                backgroundColor: (() => {
                  if (blockInteraction) {
                    return;
                  }
                  if (preventHover) {
                    return;
                  }
                  return (
                    hoverColor ||
                    (theme.mode === "light"
                      ? ColorPalette["gray-10"]
                      : ColorPalette["gray-550"])
                  );
                })(),
              }}
              backgroundColor={(() => {
                if (blockInteraction) {
                  return;
                }

                if (isFocused) {
                  return (
                    hoverColor ||
                    (theme.mode === "light"
                      ? ColorPalette["gray-10"]
                      : ColorPalette["gray-550"])
                  );
                }

                return;
              })()}
              onHoverStateChange={(isHover) => {
                if (isHover) {
                  onHoverEnter();
                } else {
                  onHoverLeave();
                }
              }}
              cursor={blockInteraction ? undefined : "pointer"}
              style={{
                flex: 1,
              }}
              onMouseMove={onPointerMove}
              onClick={async (e) => {
                e.preventDefault();
                if (preventHover) {
                  return;
                }

                await executeCopy();
              }}
            >
              <XAxis alignY="center">
                <YAxis>
                  <Box
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: "0.25rem",
                    }}
                  >
                    <XAxis alignY="center">
                      <ChainImageFallback
                        chainInfo={address.modularChainInfo}
                        size="1rem"
                      />
                      <Gutter size="0.25rem" />
                      <Subtitle3
                        style={{ height: "1rem" }}
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-700"]
                            : ColorPalette["gray-10"]
                        }
                      >
                        {address.modularChainInfo.chainName}
                      </Subtitle3>
                    </XAxis>
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
                  <Body3 color={ColorPalette["gray-300"]}>
                    {(() => {
                      if (address.starknetAddress) {
                        return `${address.starknetAddress.slice(
                          0,
                          12
                        )}...${address.starknetAddress.slice(-10)}`;
                      }

                      if (address.ethereumAddress) {
                        return address.ethereumAddress.length === 42
                          ? `${address.ethereumAddress.slice(
                              0,
                              12
                            )}...${address.ethereumAddress.slice(-10)}`
                          : address.ethereumAddress;
                      }

                      if (address.bech32Address) {
                        return Bech32Address.shortenAddress(
                          address.bech32Address,
                          24
                        );
                      }

                      if (address.bitcoinAddress?.bech32Address) {
                        return Bech32Address.shortenAddress(
                          address.bitcoinAddress.bech32Address,
                          24
                        );
                      }
                    })()}
                  </Body3>
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
                    <_CopyOutlineIcon
                      width="1.25rem"
                      height="1.25rem"
                      color={ColorPalette["gray-300"]}
                    />
                  )}
                </Box>
                <Gutter size="0.5rem" />
              </XAxis>
            </Box>

            <Gutter size="0.38rem" />
            <XAxis alignY="center">
              <Box
                onMouseMove={onPointerMove}
                onHoverStateChange={(isHover) => {
                  if (isHover) {
                    onHoverEnter?.();
                  } else {
                    onHoverLeave?.();
                  }
                }}
              >
                <IconButton
                  padding="0.675rem"
                  hoverColor={
                    preventHover
                      ? "transparent"
                      : hoverColor ||
                        (theme.mode === "light"
                          ? ColorPalette["gray-50"]
                          : ColorPalette["gray-500"])
                  }
                  disabled={hasCopied}
                  onClick={() => {
                    if (preventHover) {
                      return;
                    }
                    onClickIcon();
                  }}
                >
                  <QRCodeIcon
                    width="1rem"
                    height="1rem"
                    color={ColorPalette["gray-300"]}
                  />
                </IconButton>
              </Box>
            </XAxis>
          </XAxis>
        </Box>
      );
    }
  )
);

CopyAddressItem.displayName = "CopyAddressItem";

const _StarIcon = ({ color }: { color?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.98995 2.67555C9.36357 1.77726 10.6361 1.77726 11.0097 2.67555L12.7447 6.84698L17.2481 7.20801C18.2179 7.28576 18.6111 8.496 17.8723 9.12892L14.4411 12.068L15.4894 16.4626C15.7151 17.4089 14.6856 18.1569 13.8554 17.6498L9.99983 15.2948L6.14429 17.6498C5.31402 18.1569 4.28453 17.4089 4.51026 16.4626L5.55853 12.068L2.1274 9.12892C1.38854 8.496 1.78176 7.28576 2.75154 7.20801L7.25495 6.84698L8.98995 2.67555Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};

const _CopyOutlineIcon = ({
  width,
  height,
  color,
}: {
  width?: string;
  height?: string;
  color?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M13.333 3.33313H5.76086C4.42 3.33313 3.33301 4.42012 3.33301 5.76099V13.3331"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="6.5835"
        y="6.5835"
        width="10.1667"
        height="10.1667"
        rx="1.67786"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
      />
    </svg>
  );
};
