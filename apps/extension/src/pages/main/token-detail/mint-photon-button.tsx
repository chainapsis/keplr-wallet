import React, { FunctionComponent, useState } from "react";
import { ColorPalette } from "../../../styles";
import { ThemeOption } from "../../../theme";
import { useTheme } from "styled-components";
import { Box } from "../../../components/box";
import { XAxis } from "../../../components/axis";
import { Subtitle1, Subtitle3 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";

export const MintPhotonButton: FunctionComponent = () => {
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  const handleClick = () => {
    browser.tabs.create({ url: "https://atonex.io/photon" });
  };

  return (
    <Box paddingX="0.75rem">
      <Box
        backgroundColor={getBackgroundColor(isHover, theme.mode)}
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0 1px 4px 0 rgba(43,39,55,0.1)"
              : undefined,
        }}
        cursor="pointer"
        onClick={handleClick}
        onHoverStateChange={setIsHover}
        borderRadius="0.375rem"
        padding="1rem"
      >
        <XAxis alignY="center">
          <Box
            borderRadius="99999px"
            width="2.5rem"
            height="2.5rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-450"]
            }
            alignX="center"
            alignY="center"
          >
            ✨
          </Box>
          <Gutter size="0.75rem" />
          <Subtitle1>Mint Photon</Subtitle1>

          <div
            style={{
              flex: 1,
            }}
          />
          <Subtitle3 color={ColorPalette["gray-300"]}>atonex.io</Subtitle3>
          <Gutter size="0.25rem" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M11.25 5H4.375C3.33947 5 2.5 5.83947 2.5 6.875V15.625C2.5 16.6605 3.33947 17.5 4.375 17.5H13.125C14.1605 17.5 15 16.6605 15 15.625V8.75M6.25 13.75L17.5 2.5M17.5 2.5L13.125 2.5M17.5 2.5V6.875"
              stroke={getStrokeColor(isHover, theme.mode)}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </XAxis>
      </Box>
    </Box>
  );
};

const getBackgroundColor = (isHover: boolean, mode: ThemeOption) =>
  isHover
    ? mode === "light"
      ? ColorPalette["gray-10"]
      : ColorPalette["gray-500"]
    : mode === "light"
    ? ColorPalette["white"]
    : ColorPalette["gray-550"];

const getStrokeColor = (isHover: boolean, mode: ThemeOption) =>
  mode === "light"
    ? isHover
      ? ColorPalette["gray-300"]
      : ColorPalette["gray-200"]
    : isHover
    ? ColorPalette["gray-100"]
    : ColorPalette["gray-300"];
