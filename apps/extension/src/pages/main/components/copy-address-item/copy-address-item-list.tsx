import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import debounce from "lodash.debounce";
import { CopyAddressItem, CopyAddressItemHandle } from ".";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Box } from "../../../../components/box";
import { Address } from "../deposit-modal/copy-address-scene";
import { useStore } from "../../../../stores";
import { getChainSearchResultClickAnalyticsProperties } from "../../../../analytics-amplitude";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { XAxis } from "../../../../components/axis";

type FocusOrigin = "search" | "hover";

interface CopyAddressItemListProps {
  sortedAddresses: Address[];
  close: () => void;
  blockInteraction: boolean;
  setBlockInteraction: (block: boolean) => void;
  setSortPriorities: (
    fn: (
      value: Record<string, true | undefined>
    ) => Record<string, true | undefined>
  ) => void;
  search: string;
  onClickIcon: (address: Address) => void;
  setShowEnterTag: (show: boolean) => void;
  containerStyle?: React.CSSProperties;
  copyItemAddressHoverColor?: string;
}

export const CopyAddressItemList = ({
  sortedAddresses,
  close,
  blockInteraction,
  setBlockInteraction,
  setSortPriorities,
  search,
  onClickIcon,
  setShowEnterTag,
  containerStyle,
  copyItemAddressHoverColor,
}: CopyAddressItemListProps) => {
  const { analyticsAmplitudeStore } = useStore();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const itemContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemHandlesRef = useRef<(CopyAddressItemHandle | null)[]>([]);
  const [focusOrigin, setFocusOrigin] = useState<FocusOrigin>("hover");

  const isHoveredCopyAddressItem = hoveredIndex !== null;

  const flattenedAddresses: Address[] = useMemo(
    () =>
      sortedAddresses
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
        .flat(),
    [sortedAddresses]
  );

  // keyDown addEventListener를 마운트 될때 한번 등록하기 위해서
  // 관련 상태를 ref로 관리함
  const focusedIndexRef = useRef<number | null>(focusedIndex);
  const maxIndexRef = useRef<number>(0);
  const hoveredIndexRef = useRef<number | null>(hoveredIndex);
  const blockInteractionRef = useRef<boolean>(blockInteraction);
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
    maxIndexRef.current = flattenedAddresses.length - 1;
    hoveredIndexRef.current = hoveredIndex;
    blockInteractionRef.current = blockInteraction;
  }, [focusedIndex, flattenedAddresses, hoveredIndex, blockInteraction]);

  useEffect(() => {
    itemHandlesRef.current = itemHandlesRef.current.slice(
      0,
      flattenedAddresses.length
    );
    itemContainerRefs.current = itemContainerRefs.current.slice(
      0,
      flattenedAddresses.length
    );
  }, [flattenedAddresses.length]);

  useEffect(() => {
    if (
      focusedIndex !== null &&
      (focusedIndex < 0 || focusedIndex >= flattenedAddresses.length)
    ) {
      setFocusedIndex(null);
    }
  }, [focusedIndex, flattenedAddresses.length]);

  useEffect(() => {
    if (search.trim().length > 0 && flattenedAddresses.length > 0) {
      setFocusOrigin("search");
      setFocusedIndex(0);
    } else {
      setFocusedIndex(null);
    }

    setHoveredIndex(null);
  }, [search, flattenedAddresses.length]);

  useEffect(() => {
    if (focusedIndex !== null && flattenedAddresses.length > 0) {
      setShowEnterTag(true);
    } else {
      setShowEnterTag(false);
    }
  }, [focusedIndex, flattenedAddresses.length, setShowEnterTag]);

  const handleMouseEnter = useCallback(
    (index: number) => {
      // 해당 로직이 필요한 이유는
      // 커서가 copy-address-item에 호버가 되어있을때 search를 진행 하면
      // 간혈적으로 커서가 있는 위치에서 해당 copy-address-item의 handleMouseEnter 트리거가 되면서
      // 검색시 1번째 아이템에 포커스가 풀리는 현상을 막기 위해서 focusOrigin를 통해서 명시적으로
      // 어떤 행동이 focus를 만드는지 구분하기 위해서 사용함
      if (focusOrigin === "search") {
        return;
      }
      setHoveredIndex(index);
      setFocusedIndex(null);
    },
    [focusOrigin]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const debouncedOnMouseMove = useMemo(
    () =>
      debounce((index: number) => {
        if (focusOrigin === "search") {
          setHoveredIndex(index);
          setFocusedIndex(null);
          setFocusOrigin("hover");
        }
      }, 50),
    [focusOrigin]
  );
  useEffect(() => {
    return () => {
      debouncedOnMouseMove.cancel();
    };
  }, [debouncedOnMouseMove]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (blockInteractionRef.current) {
      return;
    }
    // 마우스 호버가 있으면 키보드 네비게이션 비활성화
    if (hoveredIndexRef.current !== null) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        if (prev === null) {
          return 0;
        }
        return Math.min(prev + 1, maxIndexRef.current);
      });

      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        if (prev === null) {
          return maxIndexRef.current;
        }
        return Math.max(prev - 1, 0);
      });

      return;
    }

    const focusedIndex = focusedIndexRef.current;
    if (e.key === "Enter" && focusedIndex !== null) {
      e.preventDefault();
      const handle = itemHandlesRef.current[focusedIndex];
      if (handle) {
        handle.triggerCopy();
      }
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (focusedIndex !== null && itemContainerRefs.current[focusedIndex]) {
      itemContainerRefs.current[focusedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusedIndex]);

  return (
    <Box style={containerStyle}>
      {flattenedAddresses.map((address, index) => {
        const key = `${
          ChainIdHelper.parse(address.modularChainInfo.chainId).identifier
        }${address.bech32Address}${address.ethereumAddress || ""}${
          address.bitcoinAddress?.bech32Address || ""
        }`;

        return (
          <div
            key={key}
            ref={(el) => {
              itemContainerRefs.current[index] = el;
            }}
          >
            <CopyAddressItem
              ref={(handle) => {
                itemHandlesRef.current[index] = handle;
              }}
              address={address}
              hoverColor={copyItemAddressHoverColor}
              close={close}
              blockInteraction={blockInteraction}
              setBlockInteraction={setBlockInteraction}
              setSortPriorities={setSortPriorities}
              onClick={() => {
                if (search.trim().length > 0) {
                  analyticsAmplitudeStore.logEvent(
                    "click_copy_address_item_search_results_deposit_modal",
                    getChainSearchResultClickAnalyticsProperties(
                      address.modularChainInfo.chainName,
                      search,
                      sortedAddresses.map(
                        (address) => address.modularChainInfo.chainName
                      ),
                      index
                    )
                  );
                }
              }}
              onClickIcon={() => onClickIcon(address)}
              isFocused={focusedIndex === index && !isHoveredCopyAddressItem}
              preventHover={focusOrigin === "search"}
              onHoverEnter={() => handleMouseEnter(index)}
              onHoverLeave={handleMouseLeave}
              onPointerMove={() => debouncedOnMouseMove(index)}
            />
          </div>
        );
      })}
    </Box>
  );
};

export const EnterTag = () => {
  const theme = useTheme();

  return (
    <Box
      paddingX="0.375rem"
      paddingY="0.125rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-500"]
      }
      borderRadius="0.25rem"
      marginLeft="0.25rem"
    >
      <XAxis alignY="center" gap="0.125rem">
        <div
          style={{
            fontSize: "10px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "140%",
            color:
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-200"],
          }}
        >
          Ent
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="9"
          viewBox="0 0 11 9"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 5.14622C0 4.99457 0.0602432 4.84913 0.167477 4.74189C0.274711 4.63466 0.420151 4.57442 0.571802 4.57442H7.43342C7.88838 4.57442 8.3247 4.39369 8.6464 4.07199C8.9681 3.75028 9.14883 3.31396 9.14883 2.85901V0.571802C9.14883 0.420151 9.20907 0.274711 9.31631 0.167477C9.42354 0.0602434 9.56898 0 9.72063 0C9.87228 0 10.0177 0.0602434 10.125 0.167477C10.2322 0.274711 10.2924 0.420151 10.2924 0.571802V2.85901C10.2924 3.61727 9.99122 4.34447 9.45505 4.88063C8.91888 5.4168 8.19168 5.71802 7.43342 5.71802H0.571802C0.420151 5.71802 0.274711 5.65778 0.167477 5.55054C0.0602432 5.44331 0 5.29787 0 5.14622Z"
            fill="#ABABB5"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.167416 5.55019C0.0602195 5.44296 0 5.29755 0 5.14593C0 4.99431 0.0602195 4.84889 0.167416 4.74166L2.45462 2.45446C2.56247 2.3503 2.7069 2.29266 2.85683 2.29397C3.00675 2.29527 3.15017 2.35541 3.25619 2.46142C3.3622 2.56744 3.42234 2.71085 3.42364 2.86078C3.42494 3.0107 3.36731 3.15514 3.26315 3.26298L1.38021 5.14593L3.26315 7.02887C3.31776 7.08162 3.36133 7.14471 3.39129 7.21448C3.42126 7.28424 3.43703 7.35927 3.43769 7.43519C3.43835 7.51112 3.42389 7.58641 3.39514 7.65668C3.36638 7.72696 3.32393 7.7908 3.27024 7.84449C3.21655 7.89818 3.15271 7.94063 3.08244 7.96939C3.01216 7.99814 2.93687 8.0126 2.86095 8.01194C2.78502 8.01128 2.70999 7.99551 2.64023 7.96554C2.57047 7.93557 2.50737 7.89201 2.45462 7.8374L0.167416 5.55019Z"
            fill="#ABABB5"
          />
        </svg>
      </XAxis>
    </Box>
  );
};
