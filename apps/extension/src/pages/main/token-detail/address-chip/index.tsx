import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Body3 } from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { XAxis } from "../../../../components/axis";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Gutter } from "../../../../components/gutter";
import { useTheme } from "styled-components";
import { CopyCheckAnim } from "../../components";

export const AddressChip: FunctionComponent<{
  chainId: string;

  // modal 안에서는 색상 문제로 안보여서
  // modal 안에서는 배경색을 바꿈
  inModal?: boolean;
}> = observer(({ chainId, inModal }) => {
  const { accountStore, chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);
  const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainId);

  const theme = useTheme();

  const account = accountStore.getAccount(chainId);

  const [isHover, setIsHover] = useState(false);
  const [animCheck, setAnimCheck] = useState(false);

  useEffect(() => {
    if (animCheck) {
      const timeout = setTimeout(() => {
        setAnimCheck(false);
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [animCheck]);

  return (
    <Box
      cursor="pointer"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={(() => {
        if (isHover) {
          if (inModal) {
            return theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-450"];
          }
          return theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-550"];
        }
        if (inModal) {
          return theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-500"];
        }
        return theme.mode === "light"
          ? ColorPalette["white"]
          : ColorPalette["gray-600"];
      })()}
      borderRadius="99999px"
      borderWidth={theme.mode === "light" ? "1px" : "0"}
      borderColor={theme.mode === "light" ? ColorPalette["gray-50"] : undefined}
      paddingX="0.625rem"
      onClick={(e) => {
        e.preventDefault();

        // copy address
        if (isEVMOnlyChain) {
          navigator.clipboard.writeText(account.ethereumHexAddress);
        } else if ("cosmos" in modularChainInfo) {
          navigator.clipboard.writeText(account.bech32Address);
        } else if ("starknet" in modularChainInfo) {
          navigator.clipboard.writeText(account.starknetHexAddress);
        } else if ("bitcoin" in modularChainInfo) {
          navigator.clipboard.writeText(
            account.bitcoinAddress?.bech32Address ?? ""
          );
        }
        setAnimCheck(true);
      }}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <Body3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
        >
          {(() => {
            if (isEVMOnlyChain) {
              return `${account.ethereumHexAddress.slice(
                0,
                10
              )}...${account.ethereumHexAddress.slice(32)}`;
            } else if ("cosmos" in modularChainInfo) {
              return Bech32Address.shortenAddress(account.bech32Address, 16);
            } else if ("starknet" in modularChainInfo) {
              return `${account.starknetHexAddress.slice(
                0,
                10
              )}...${account.starknetHexAddress.slice(56)}`;
            } else if ("bitcoin" in modularChainInfo) {
              return Bech32Address.shortenAddress(
                account.bitcoinAddress?.bech32Address ?? "",
                16
              );
            }
          })()}
        </Body3>
        <Gutter size="0.4rem" />
        {!animCheck ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-300"]
              }
              strokeLinecap="round"
              strokeWidth="1.6"
              d="M10.667 2.668h-6.4a1.6 1.6 0 00-1.6 1.6v6.4"
            />
            <rect
              width="7.733"
              height="7.733"
              x="5.467"
              y="5.468"
              stroke="#72747B"
              strokeWidth="1.6"
              rx="0.8"
            />
          </svg>
        ) : (
          <CopyCheckAnim />
        )}
      </XAxis>
    </Box>
  );
});

export const QRCodeChip: FunctionComponent<{
  onClick: () => void;
}> = ({ onClick }) => {
  const theme = useTheme();

  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      cursor="pointer"
      width="1.5rem"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={
        !isHover
          ? theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
          : theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-550"]
      }
      borderRadius="99999px"
      borderWidth={theme.mode === "light" ? "1px" : "0"}
      borderColor={theme.mode === "light" ? ColorPalette["gray-50"] : undefined}
      onClick={onClick}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            fill={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
            fillRule="evenodd"
            d="M2.833 1.668c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V2.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V2.835zm.167 4.833c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V8.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V8.835zm5-6c0-.645.523-1.167 1.167-1.167h2.333c.645 0 1.167.522 1.167 1.167v2.333c0 .644-.522 1.167-1.167 1.167H8.833a1.167 1.167 0 01-1.167-1.167V2.835zm1.167-.167a.167.167 0 00-.167.167v2.333c0 .092.075.167.167.167h2.333a.167.167 0 00.167-.167V2.835a.167.167 0 00-.167-.167H8.833zm-4.84.667A.667.667 0 003.327 4v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 3.335h-.007zm6 0A.667.667 0 009.327 4v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 3.335h-.007zm-6 6a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 9.335h-.007zm6 0a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 9.335h-.007zm-2.333-1c0-.369.298-.667.667-.667h.006c.369 0 .667.298.667.667v.006a.667.667 0 01-.667.667h-.006a.667.667 0 01-.667-.667v-.006zm4-.667a.667.667 0 00-.667.667v.006c0 .368.299.667.667.667h.007a.667.667 0 00.666-.667v-.006a.667.667 0 00-.666-.667h-.007zm-.667 4c0-.368.299-.667.667-.667h.007c.368 0 .666.299.666.667v.007a.667.667 0 01-.666.666h-.007a.667.667 0 01-.667-.666v-.007zm-2.666-.667a.667.667 0 00-.667.667v.007c0 .368.298.666.667.666h.006A.667.667 0 009 11.675v-.007a.667.667 0 00-.667-.667h-.006z"
            clipRule="evenodd"
          />
        </svg>
      </XAxis>
    </Box>
  );
};
