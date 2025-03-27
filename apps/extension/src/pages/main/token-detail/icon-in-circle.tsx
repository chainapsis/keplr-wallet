import Color from "color";
import React, { FunctionComponent } from "react";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";

export const IconInCircle: FunctionComponent<{
  icon: React.ReactNode;
  isLightMode?: boolean;
  isHover?: boolean;
}> = ({ icon, isLightMode, isHover }) => {
  return (
    <Box
      width="2.5rem"
      height="2.5rem"
      alignX="center"
      alignY="center"
      borderRadius="999999px"
      backgroundColor={
        !isHover
          ? isLightMode
            ? ColorPalette["blue-100"]
            : ColorPalette["gray-400"]
          : isLightMode
          ? ColorPalette["blue-100"]
          : ColorPalette["gray-400"]
      }
      style={{
        color: !isHover
          ? isLightMode
            ? ColorPalette["blue-400"]
            : ColorPalette["white"]
          : isLightMode
          ? ColorPalette["blue-400"]
          : ColorPalette["gray-200"],
      }}
      after={
        isHover && isLightMode
          ? {
              backgroundColor: Color(ColorPalette["gray-500"])
                .alpha(0.1)
                .toString(),
              borderRadius: "99999px",
            }
          : undefined
      }
    >
      {icon}
    </Box>
  );
};
