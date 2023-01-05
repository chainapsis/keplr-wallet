import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";

export const RegisterSceneBox: FunctionComponent = ({ children }) => {
  return (
    <Box paddingX="5rem" paddingY="3.125rem">
      {children}
    </Box>
  );
};
