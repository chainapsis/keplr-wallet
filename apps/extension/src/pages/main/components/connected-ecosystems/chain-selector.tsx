import React, { FunctionComponent, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import { ChainInfo, ModularChainInfo } from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  UpdateCurrentChainIdForBitcoinMsg,
  UpdateCurrentChainIdForStarknetMsg,
  UpdateCurrentChainIdForEVMMsg,
} from "@keplr-wallet/background";
import { Box } from "../../../../components/box";
import { Columns } from "../../../../components/column";
import { CheckIcon } from "../../../../components/icon";
import { ChainImageFallback } from "../../../../components/image";
import { Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";

export const ChainSelector: FunctionComponent<{
  chainInfos: (ModularChainInfo | ChainInfo)[];
  currentChainId: string;
  setCurrentChainId: (chainId: string) => void;
  activeTabOrigin: string;
  updateMessage:
    | typeof UpdateCurrentChainIdForBitcoinMsg
    | typeof UpdateCurrentChainIdForStarknetMsg
    | typeof UpdateCurrentChainIdForEVMMsg;

  // Ecosystem-specific options (e.g. Bitcoin uses baseChainId as identifier)
  getChainId?: (chainInfo: ModularChainInfo | ChainInfo) => string;
  isChainSelected?: (
    chainInfo: ModularChainInfo | ChainInfo,
    currentChainId: string
  ) => boolean;
}> = ({
  chainInfos,
  currentChainId,
  setCurrentChainId,
  activeTabOrigin,
  updateMessage,
  getChainId,
  isChainSelected,
}) => {
  const theme = useTheme();
  const selectedChainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChainRef.current) {
      selectedChainRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentChainId]);

  return (
    <React.Fragment>
      {chainInfos.map((chainInfo) => {
        const chainId = getChainId ? getChainId(chainInfo) : chainInfo.chainId;
        const isSelected = isChainSelected
          ? isChainSelected(chainInfo, currentChainId)
          : currentChainId === chainInfo.chainId;

        return (
          <div key={chainId} ref={isSelected ? selectedChainRef : undefined}>
            <Box
              paddingX="1rem"
              paddingY="0.75rem"
              cursor="pointer"
              backgroundColor={
                isSelected
                  ? theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-650"]
                  : theme.mode === "light"
                  ? ColorPalette["white"]
                  : ColorPalette["gray-600"]
              }
              hover={{
                backgroundColor:
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-550"],
              }}
              onClick={async () => {
                const msg = new updateMessage(activeTabOrigin, chainId);
                await new InExtensionMessageRequester().sendMessage(
                  BACKGROUND_PORT,
                  msg
                );
                setCurrentChainId(chainId);
              }}
            >
              <Columns sum={1} alignY="center" gutter="0.5rem">
                <ChainImageFallback chainInfo={chainInfo} size="2rem" />
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                >
                  {chainInfo.chainName}
                </Subtitle3>
                <div style={{ flex: 1 }} />
                {isSelected && (
                  <CheckIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["blue-400"]
                        : ColorPalette["gray-200"]
                    }
                  />
                )}
              </Columns>
            </Box>
          </div>
        );
      })}
    </React.Fragment>
  );
};
