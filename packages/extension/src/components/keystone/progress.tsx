import React from "react";
import { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";

export const Progress: FunctionComponent<{
  percent: number;
  width?: string;
  height?: string;
}> = ({ percent, width, height }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-500"],
        width: width ?? "7.5rem",
        height: height ?? "0.375rem",
        borderRadius: height ?? "0.375rem",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          borderRadius: height ?? "0.375rem",
          backgroundColor: ColorPalette["blue-400"],
        }}
      />
    </div>
  );
};
