import React, { FunctionComponent } from "react";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Caption1 } from "../typography";
import { Tooltip } from "../tooltip";

export const Tag: FunctionComponent<{
  text: string;
  tooltip?: string;
}> = ({ text, tooltip }) => {
  return (
    <Tooltip enabled={!!tooltip} content={tooltip}>
      <Box
        alignX="center"
        alignY="center"
        backgroundColor={ColorPalette["gray-400"]}
        borderRadius="0.25rem"
        height="1.25rem"
        paddingX="0.625rem"
      >
        <Caption1 color={ColorPalette["gray-100"]}>{text}</Caption1>
      </Box>
    </Tooltip>
  );
};
