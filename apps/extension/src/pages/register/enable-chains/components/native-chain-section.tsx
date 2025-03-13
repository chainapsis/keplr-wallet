import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { EnableChainsArrowUpIcon } from "./enable-chains-arrow-up-icon";
import { YAxis, XAxis } from "../../../../components/axis";
import { Box } from "../../../../components/box";
import { Checkbox } from "../../../../components/checkbox";
import { Columns, Column } from "../../../../components/column";
import { Gutter } from "../../../../components/gutter";
import { NativeChainMarkIcon } from "../../../../components/icon";
import { IconButton } from "../../../../components/icon-button";
import { Stack } from "../../../../components/stack";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { hexToRgba } from "../../../../utils";
import { EnableChainsArrowDownIcon } from "./enable-chains-arrow-down-icon";

export const NativeChainSection: FunctionComponent<{
  isCollapsed: boolean;
  isSelectAll: boolean;
  children: React.ReactNode;

  showTitleBox?: boolean;
  enabledNativeChainIdentifierList: string[];
  onClickCollapse: () => void;
  onClick: () => void;
  title: string;
  titleChainImage: React.ReactNode;
  paragraph: string;
}> = ({
  isCollapsed,
  isSelectAll,
  children,
  enabledNativeChainIdentifierList,
  onClick,
  onClickCollapse,
  showTitleBox,
  title,
  titleChainImage,
  paragraph,
}) => {
  const theme = useTheme();
  const nativeChainMarkColor = isSelectAll
    ? theme.mode === "light"
      ? ColorPalette["gray-10"]
      : ColorPalette["gray-550"]
    : theme.mode === "light"
    ? ColorPalette.white
    : ColorPalette["gray-600"];

  return (
    <React.Fragment>
      {showTitleBox && (
        <Box
          borderRadius="0.375rem"
          paddingX="1rem"
          paddingY="0.75rem"
          borderWidth="1.5px"
          borderColor={
            theme.mode === "light"
              ? ColorPalette["blue-200"]
              : ColorPalette["blue-600"]
          }
          backgroundColor={
            isSelectAll
              ? theme.mode === "light"
                ? ColorPalette["gray-10"]
                : ColorPalette["gray-550"]
              : theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          cursor={"pointer"}
          onClick={onClick}
        >
          <Columns sum={1} alignY="center">
            {isCollapsed ? (
              <NativeChainMarkIcon
                width="1.75rem"
                height="1.75rem"
                color={nativeChainMarkColor}
              />
            ) : (
              <Box position="relative">
                {titleChainImage}

                <Box
                  position="absolute"
                  style={{
                    bottom: "-0.125rem",
                    right: "-0.125rem",
                  }}
                >
                  <NativeChainMarkIcon
                    width="1.25rem"
                    height="1.25rem"
                    color={nativeChainMarkColor}
                  />
                </Box>
              </Box>
            )}
            <Gutter size="0.5rem" />
            <YAxis>
              <XAxis alignY="center">
                <Subtitle2>{title}</Subtitle2>
                <Gutter size="0.25rem" />
                <Subtitle3 color={ColorPalette["blue-300"]}>
                  {enabledNativeChainIdentifierList.length}
                </Subtitle3>
              </XAxis>
              <Gutter size="0.25rem" />
              {isCollapsed ? null : (
                <Subtitle3 color={ColorPalette["gray-300"]}>
                  {" "}
                  {paragraph}
                </Subtitle3>
              )}
            </YAxis>
            <Column weight={1} />

            <Column weight={1} />
            <XAxis alignY="center">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onClickCollapse();
                }}
                padding="0.25rem"
                hoverColor={
                  theme.mode === "light"
                    ? hexToRgba(ColorPalette["gray-100"], 0.5)
                    : ColorPalette["gray-500"]
                }
              >
                {isCollapsed ? (
                  <EnableChainsArrowDownIcon
                    width="1.5rem"
                    height="1.5rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  />
                ) : (
                  <EnableChainsArrowUpIcon
                    width="1.5rem"
                    height="1.5rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  />
                )}
              </IconButton>
              <Gutter size="0.5rem" />
              <Checkbox
                checked={isSelectAll}
                onChange={() => {
                  onClick();
                }}
              />
            </XAxis>
          </Columns>
        </Box>
      )}
      <VerticalCollapseTransition
        collapsed={showTitleBox ? isCollapsed : false}
        opacityLeft={0}
        transitionAlign="top"
      >
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">{children}</Stack>
      </VerticalCollapseTransition>
    </React.Fragment>
  );
};
