import React, { FunctionComponent } from "react";
import { Box, BoxProps } from "../box";

export const Card: FunctionComponent<BoxProps> = (props) => {
  return (
    <Box {...props} borderRadius="16px" background="white" display="flex" />
  );
};
