import React from "react";
import { FunctionComponent } from "react";
import { Box } from "../../../components/box";
import { Subtitle3 } from "../../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import { DiamondStarIcon, LinkIcon } from "../../../components/icon";
import { XAxis } from "../../../components/axis";
import styled from "styled-components";

export const EarnOverviewExternalLink: FunctionComponent<{
  coinDenom: string;
  url: string;
}> = ({ coinDenom, url }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  return (
    <StyledBox
      onClick={(e) => {
        e.preventDefault();
        browser.tabs.create({
          url,
        });
      }}
    >
      <XAxis alignY="center" gap="0.375rem">
        <DiamondStarIcon
          color={
            isLightMode ? ColorPalette["blue-300"] : ColorPalette["blue-200"]
          }
          width="0.875rem"
          height="0.875rem"
        />
        <Subtitle3
          color={isLightMode ? ColorPalette["gray-700"] : ColorPalette["white"]}
        >
          Collect yield or Points with {coinDenom}
        </Subtitle3>

        <Box style={{ marginLeft: "auto" }}>
          <LinkIcon
            color={
              isLightMode ? ColorPalette["gray-700"] : ColorPalette["gray-200"]
            }
            width="1rem"
            height="1rem"
            className="link-icon"
          />
        </Box>
      </XAxis>
    </StyledBox>
  );
};

const StyledBox = styled.div`
  padding: 1.5rem 1.25rem;
  cursor: pointer;

  &:hover,
  &:has(*:hover) {
    div {
      color: ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-450"]
          : ColorPalette["gray-200"]};
    }
    .link-icon {
      opacity: ${({ theme }) => (theme.mode === "light" ? 0.8 : 1)};
      ${({ theme }) =>
        theme.mode !== "light" &&
        `
          path {
            fill: ${ColorPalette["gray-300"]};
          }
        `}
    }
  }
`;
