import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { StepIndicatorProps } from "./types";

export const StepIndicator: FunctionComponent<StepIndicatorProps> = ({
  totalCount,
  completedCount,
  width = "0.25rem",
  height = "0.75rem",
  gap = "0.25rem",
  activeColor,
  inactiveOpacity = 0.3,
  style,
}) => {
  const theme = useTheme();

  const defaultActiveColor =
    theme.mode === "light" ? ColorPalette["blue-400"] : ColorPalette["white"];

  const color = activeColor ?? defaultActiveColor;

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
      {Array.from({ length: totalCount }).map((_, index) => (
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
      ))}
    </div>
  );
};
