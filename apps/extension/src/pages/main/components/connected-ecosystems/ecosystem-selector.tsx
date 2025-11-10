import React, { FunctionComponent, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import SimpleBar from "simplebar-react";
import { Box } from "../../../../components/box";
import { Columns } from "../../../../components/column";
import { ArrowLeftIcon, RightArrowIcon } from "../../../../components/icon";
import { ChainImageFallback } from "../../../../components/image";
import {
  Body2,
  BaseTypography,
  Subtitle3,
  Caption1,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useStore } from "../../../../stores";
import {
  UpdateCurrentChainIdForBitcoinMsg,
  UpdateCurrentChainIdForStarknetMsg,
  UpdateCurrentChainIdForEVMMsg,
} from "@keplr-wallet/background";
import { EcosystemType, EcosystemSection, EcosystemTypeToText } from "./types";
import { ChainSelector } from "./chain-selector";
import { EcosystemSpecificOptionsSelector } from "./option-selector";
import { ModularChainInfo } from "@keplr-wallet/types";
import { parseEcosystemSpecificOptions } from "./utils";
import { Gutter } from "../../../../components/gutter";
import { XAxis } from "../../../../components/axis";

export const EcosystemsSelector: FunctionComponent<{
  ecosystemSections: Array<EcosystemSection>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isHovered: boolean;
  onHoverChange: (isHovered: boolean) => void;
  activeTabOrigin: string;
}> = ({
  ecosystemSections,
  isOpen,
  onOpenChange,
  isHovered,
  onHoverChange,
  activeTabOrigin,
}) => {
  const theme = useTheme();
  const { chainStore } = useStore();

  const [selectionState, setSelectionState] = React.useState<{
    ecosystemType: EcosystemType;
    selectionMode?: "chain" | "address-type";
  } | null>(null);

  const bitcoinSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "bitcoin"),
    [ecosystemSections]
  );

  const evmSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "evm"),
    [ecosystemSections]
  );

  const starknetSection = React.useMemo(
    () => ecosystemSections.find((section) => section.type === "starknet"),
    [ecosystemSections]
  );

  const representativeChainInfo = React.useMemo(() => {
    const representativeSection = ecosystemSections[0];

    if (!representativeSection) {
      return undefined;
    }

    if (representativeSection.type === "bitcoin") {
      return chainStore.groupedModularChainInfos.find(
        (chain) =>
          "bitcoin" in chain &&
          chain.bitcoin.chainId === representativeSection.chainId
      );
    } else if (
      representativeSection.type === "evm" ||
      representativeSection.type === "starknet"
    ) {
      return chainStore.getModularChain(representativeSection.chainId);
    }

    return undefined;
  }, [ecosystemSections, chainStore]);

  const { x, y, strategy, refs } = useFloating({
    placement: "bottom-end",
    middleware: [
      shift(),
      offset({
        mainAxis: 10,
        crossAxis: 10,
      }),
    ],
    whileElementsMounted: autoUpdate,
    open: isOpen,
  });

  const closeRef = useRef(() => onOpenChange(false));
  closeRef.current = () => onOpenChange(false);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const floatingRef = refs.floating;
      const triggerRef = refs.reference;

      if (
        floatingRef.current &&
        "contains" in floatingRef.current &&
        !floatingRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        "contains" in triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeRef.current();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs.floating, refs.reference]);

  useEffect(() => {
    if (!isOpen) {
      setSelectionState(null);
    }
  }, [isOpen]);

  const renderContent = React.useMemo(() => {
    if (
      selectionState?.ecosystemType === "bitcoin" &&
      bitcoinSection &&
      selectionState.selectionMode === "address-type"
    ) {
      return (
        <EcosystemSpecificOptionsSelector
          ecosystemSection={bitcoinSection}
          optionKey="address-type"
        />
      );
    }

    if (
      selectionState?.ecosystemType === "bitcoin" &&
      bitcoinSection &&
      selectionState.selectionMode !== "address-type"
    ) {
      return (
        <ChainSelector
          chainInfos={bitcoinSection.chainInfos}
          currentChainId={bitcoinSection.currentChainId}
          setCurrentChainId={bitcoinSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForBitcoinMsg}
          // baseChainId is used for bitcoin chains
          getChainId={(chainInfo) =>
            "bitcoin" in chainInfo
              ? chainInfo.bitcoin.chainId
              : chainInfo.chainId
          }
          isChainSelected={(chainInfo, currentChainId) => {
            const chainId =
              "bitcoin" in chainInfo
                ? chainInfo.bitcoin.chainId
                : chainInfo.chainId;
            return currentChainId === chainId;
          }}
        />
      );
    }

    if (selectionState?.ecosystemType === "evm" && evmSection) {
      return (
        <ChainSelector
          chainInfos={evmSection.chainInfos}
          currentChainId={evmSection.currentChainId}
          setCurrentChainId={evmSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForEVMMsg}
        />
      );
    }

    if (selectionState?.ecosystemType === "starknet" && starknetSection) {
      return (
        <ChainSelector
          chainInfos={starknetSection.chainInfos}
          currentChainId={starknetSection.currentChainId}
          setCurrentChainId={starknetSection.setCurrentChainId}
          activeTabOrigin={activeTabOrigin}
          updateMessage={UpdateCurrentChainIdForStarknetMsg}
        />
      );
    }

    return (
      <EcosystemOverview
        ecosystemSections={ecosystemSections}
        setSelectionState={setSelectionState}
      />
    );
  }, [
    selectionState,
    bitcoinSection,
    starknetSection,
    evmSection,
    ecosystemSections,
    activeTabOrigin,
  ]);

  const { hasFooter, footerText } = React.useMemo(() => {
    if (!selectionState) return { hasFooter: false, footerText: "" };

    const currentSection = ecosystemSections.find(
      (section) => section.type === selectionState.ecosystemType
    );

    if (!currentSection) return { hasFooter: false, footerText: "" };

    if (!currentSection.footer?.visible) {
      return { hasFooter: false, footerText: "" };
    }

    if (
      selectionState.selectionMode &&
      selectionState.selectionMode !== "chain"
    ) {
      const specificOption = currentSection.specificOptions?.find(
        (option) => option.key === selectionState.selectionMode
      );
      if (specificOption?.footerText) {
        return {
          hasFooter: true,
          footerText: specificOption.footerText,
        };
      }
    }

    return {
      hasFooter: true,
      footerText: currentSection.footer?.text || "",
    };
  }, [selectionState, ecosystemSections]);

  const shouldShowBackButton = selectionState !== null;

  return (
    <React.Fragment>
      <div ref={refs.setReference}>
        <Box
          borderRadius="99999px"
          position="relative"
          cursor="pointer"
          onHoverStateChange={onHoverChange}
          onClick={() => onOpenChange(!isOpen)}
        >
          {representativeChainInfo && (
            <ChainImageFallback
              chainInfo={representativeChainInfo}
              size="1.25rem"
              style={{
                opacity: isHovered ? 0.8 : 1,
              }}
            />
          )}

          <Box
            backgroundColor={ColorPalette["gray-700"]}
            width="0.875rem"
            height="0.875rem"
            borderRadius="99999px"
            position="absolute"
            style={{ right: "-0.234rem", bottom: "-0.29rem" }}
            alignX="center"
            alignY="center"
          >
            <BaseTypography
              color={ColorPalette["gray-200"]}
              style={{
                fontSize: "0.625rem",
                fontWeight: 600,
                lineHeight: "normal",
              }}
            >
              {ecosystemSections.length}
            </BaseTypography>
          </Box>
        </Box>
      </div>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "19rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"],
            borderRadius: "0.375rem",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor:
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-500"],
          }}
        >
          <Box
            alignX="left"
            alignY="center"
            paddingX="1rem"
            paddingY="1.25rem"
            style={{
              borderTopLeftRadius: "0.375rem",
              borderTopRightRadius: "0.375rem",
              borderBottomStyle: "solid",
              borderBottomWidth: "1px",
              borderBottomColor:
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-500"],
            }}
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <Box
                backgroundColor={ColorPalette["green-400"]}
                width="0.375rem"
                height="0.375rem"
                borderRadius="99999px"
              />
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"]
                }
              >
                {activeTabOrigin}
              </Body2>
            </Columns>
          </Box>

          {shouldShowBackButton && (
            <Box
              alignX="left"
              alignY="center"
              padding="1rem"
              style={{
                borderBottomStyle: "solid",
                borderBottomWidth: "1px",
                borderBottomColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-500"],
              }}
            >
              <Box
                alignY="center"
                alignX="left"
                cursor="pointer"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.25rem",
                }}
                onClick={() => {
                  setSelectionState(null);
                }}
              >
                <ArrowLeftIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-300"]}
                />
                <Body2 color={ColorPalette["gray-200"]}>Back</Body2>
              </Box>
            </Box>
          )}

          <SimpleBar
            style={{
              display: "flex",
              flexDirection: "column",
              // overview mode should display all options without scroll
              ...(selectionState !== null && {
                maxHeight: "16rem",
                overflowY: "auto",
              }),
            }}
          >
            {renderContent}
          </SimpleBar>

          {hasFooter && (
            <Box
              alignX="left"
              alignY="center"
              paddingX="1rem"
              paddingY={footerText.length > 0 ? "1.25rem" : "0"}
              minHeight="1rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
            >
              <Body2>{footerText}</Body2>
            </Box>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export const EcosystemOverview: FunctionComponent<{
  ecosystemSections: EcosystemSection[];
  setSelectionState: (state: {
    ecosystemType: EcosystemType;
    selectionMode?: "chain" | "address-type";
  }) => void;
}> = ({ ecosystemSections, setSelectionState }) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      {ecosystemSections.map((section, index) => {
        let chainInfo: ModularChainInfo | undefined;

        if (section.type === "bitcoin") {
          chainInfo = section.chainInfos.find(
            (chain) =>
              "bitcoin" in chain && chain.bitcoin.chainId === section.chainId
          );
        } else {
          chainInfo = section.chainInfos.find(
            (chain) => chain.chainId === section.chainId
          );
        }

        if (!chainInfo) return null;

        // Parse all specific options using generic parser
        const parsedOptions = parseEcosystemSpecificOptions(section);

        const isLast = index === ecosystemSections.length - 1;

        return (
          <Box
            key={section.chainId}
            paddingX="1rem"
            paddingY="1.25rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"]
            }
            style={{
              borderBottomStyle: isLast ? "none" : "solid",
              borderBottomWidth: "1px",
              borderBottomColor:
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-500"],
            }}
          >
            <Columns sum={1} alignY="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              >
                {EcosystemTypeToText[section.type]}
              </Subtitle3>
              <div style={{ flex: 1 }} />
              <Box
                cursor="pointer"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                hover={{
                  opacity: 0.6,
                }}
                onClick={() => {
                  setSelectionState({
                    ecosystemType: section.type,
                  });
                }}
              >
                <XAxis alignY="center">
                  <ChainImageFallback chainInfo={chainInfo} size="1.5rem" />
                  <Gutter size="0.5rem" />

                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["white"]
                    }
                  >
                    {chainInfo.chainName}
                  </Subtitle3>
                </XAxis>
                <RightArrowIcon
                  color={ColorPalette["gray-300"]}
                  width="1rem"
                  height="1rem"
                />
              </Box>
            </Columns>
            <EcosystemSpecificOptionsRenderer
              section={section}
              parsedOptions={parsedOptions}
              setSelectionState={setSelectionState}
            />
          </Box>
        );
      })}
    </React.Fragment>
  );
};

const EcosystemSpecificOptionsRenderer: FunctionComponent<{
  section: EcosystemSection;
  parsedOptions: ReturnType<typeof parseEcosystemSpecificOptions>;
  setSelectionState: (state: {
    ecosystemType: EcosystemType;
    selectionMode?: "chain" | "address-type";
  }) => void;
}> = ({ section, parsedOptions, setSelectionState }) => {
  return (
    <React.Fragment>
      {Object.entries(parsedOptions).map(([optionKey, parsed]) => (
        <EcosystemOptionItem
          key={optionKey}
          optionKey={optionKey}
          parsed={parsed}
          section={section}
          setSelectionState={setSelectionState}
        />
      ))}
    </React.Fragment>
  );
};

const EcosystemOptionItem: FunctionComponent<{
  optionKey: string;
  parsed: {
    displayName: string;
    secondaryText?: string;
    option: any;
    config: any;
  };
  section: EcosystemSection;
  setSelectionState: (state: {
    ecosystemType: EcosystemType;
    selectionMode?: "chain" | "address-type";
  }) => void;
}> = ({ optionKey, parsed, section, setSelectionState }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Box
      key={optionKey}
      marginTop="1.25rem"
      padding="0.75rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-550"]
      }
      borderRadius="0.375rem"
    >
      <Caption1
        color={
          theme.mode === "light"
            ? ColorPalette["gray-700"]
            : ColorPalette["gray-200"]
        }
      >
        {parsed.config.label}
      </Caption1>
      <Gutter size="0.75rem" />
      <XAxis alignY="center">
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["white"]
          }
        >
          {parsed.displayName}
        </Subtitle3>
        <div style={{ flex: 1 }} />
        <Box
          cursor="pointer"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.375rem",
          }}
          onHoverStateChange={setIsHovered}
          onClick={(e) => {
            e.stopPropagation();
            setSelectionState({
              ecosystemType: section.type,
              selectionMode: parsed.config.selectionMode as any,
            });
          }}
        >
          {parsed.secondaryText && (
            <Body2
              color={
                isHovered
                  ? ColorPalette["gray-300"]
                  : theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              {parsed.secondaryText}
            </Body2>
          )}
          <RightArrowIcon
            color={
              isHovered ? ColorPalette["gray-400"] : ColorPalette["gray-300"]
            }
            width="1rem"
            height="1rem"
          />
        </Box>
      </XAxis>
    </Box>
  );
};
