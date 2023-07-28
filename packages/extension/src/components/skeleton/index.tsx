import React, { FunctionComponent } from "react";
import { ColorPalette } from "../../styles";
import { Box } from "../box";
import { ButtonRadius } from "../button";
import { CopyAddressRadius } from "../../pages/main/components";
import { useTheme } from "styled-components";

export interface SkeletonProps {
  isNotReady?: boolean;
  type?: "default" | "button" | "copyAddress" | "circle";
  dummyMinWidth?: string;
  // This is for the case that the skeleton's background color.
  layer?: 0 | 1;
}

export const Skeleton: FunctionComponent<SkeletonProps> = ({
  isNotReady,
  type = "default",
  layer = 0,
  dummyMinWidth,
  children,
}) => {
  const theme = useTheme();

  const getBorderRadius = () => {
    switch (type) {
      case "button":
        return ButtonRadius;
      case "copyAddress":
        return CopyAddressRadius;
      case "circle":
        return "999999999px";
      default:
        return undefined;
    }
  };

  return (
    <Box position="relative" minWidth={isNotReady ? dummyMinWidth : undefined}>
      {isNotReady ? (
        <Box
          position="absolute"
          backgroundColor={
            layer === 0
              ? theme.mode === "light"
                ? ColorPalette["skeleton-layer-0"]
                : ColorPalette["gray-600"]
              : theme.mode === "light"
              ? ColorPalette["skeleton-layer-1"]
              : ColorPalette["gray-500"]
          }
          zIndex={1000}
          borderRadius={getBorderRadius()}
          style={{ top: 0, bottom: 0, left: 0, right: 0 }}
        />
      ) : null}

      {children}
    </Box>
  );
};
