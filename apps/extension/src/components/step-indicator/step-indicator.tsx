import React, { FunctionComponent } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { StepIndicatorProps } from "./types";

const blinkAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

const BlinkingDot = styled.div<{
  $width: string;
  $height: string;
  $color: string;
}>`
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  border-radius: 13.875rem;
  background-color: ${(props) => props.$color};
  animation: ${blinkAnimation} 1s ease-in-out infinite;
`;

export const StepIndicator: FunctionComponent<StepIndicatorProps> = ({
  totalCount,
  completedCount,
  width = "0.25rem",
  height = "0.75rem",
  gap = "0.25rem",
  activeColor,
  inactiveOpacity = 0.3,
  blinkCurrentStep = false,
  style,
}) => {
  const theme = useTheme();

  const defaultActiveColor =
    theme.mode === "light" ? ColorPalette["blue-400"] : ColorPalette["white"];

  const color = activeColor ?? defaultActiveColor;

  const isCurrentStep = (index: number) =>
    blinkCurrentStep && index === completedCount && completedCount < totalCount;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap,
        flexShrink: 0,
        ...style,
      }}
    >
      {Array.from({ length: totalCount }).map((_, index) =>
        isCurrentStep(index) ? (
          <BlinkingDot
            key={index}
            $width={width}
            $height={height}
            $color={color}
          />
        ) : (
          <div
            key={index}
            style={{
              width,
              height,
              borderRadius: "13.875rem",
              backgroundColor: color,
              opacity: index < completedCount ? 1 : inactiveOpacity,
            }}
          />
        )
      )}
    </div>
  );
};
