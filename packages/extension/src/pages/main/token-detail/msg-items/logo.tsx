import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";

export const ItemLogo: FunctionComponent<{
  center: React.ReactElement;
  backgroundColor?: string;
}> = ({ center, backgroundColor }) => {
  return (
    <Box
      width="2rem"
      height="2rem"
      backgroundColor={backgroundColor || ColorPalette["gray-500"]}
      borderRadius="999999px"
      alignX="center"
      alignY="center"
    >
      <div
        style={{
          color: ColorPalette["gray-200"],
        }}
      >
        {center}
      </div>
    </Box>
  );
};
