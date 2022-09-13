import React, { FunctionComponent } from "react";
import { Box, BoxProps } from "../box";

export const Card: FunctionComponent<BoxProps> = (props) => {
  return (
    <Box
      borderWidth="1px"
      borderColor="black"
      borderRadius="14px"
      padding="10px"
      {...props}
    />
  );
};
