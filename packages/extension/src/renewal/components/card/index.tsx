import React, { FunctionComponent } from "react";
import { Box, BoxProps } from "../box";

export const Card: FunctionComponent<BoxProps> = (props) => {
  return <Box borderRadius="16px" padding="10px" {...props} />;
};
