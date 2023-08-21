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

  horizontalBleed?: string;
  verticalBleed?: string;
}

export const Skeleton: FunctionComponent<SkeletonProps> = ({
  isNotReady,
  type = "default",
  layer = 0,
  dummyMinWidth,
  horizontalBleed,
  verticalBleed,
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
          style={(() => {
            let top = "0";
            let bottom = "0";
            if (verticalBleed) {
              top = "-" + verticalBleed;
              bottom = "-" + verticalBleed;
            }

            let left = "0";
            let right = "0";
            if (horizontalBleed) {
              left = "-" + horizontalBleed;
              right = "-" + horizontalBleed;
            }

            return { top, bottom, left, right };
          })()}
        />
      ) : null}

      {children}
    </Box>
  );
};
