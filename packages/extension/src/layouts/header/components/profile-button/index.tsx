import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ProfileIcon } from "../../../../components/icon";

export const ProfileButton: FunctionComponent = () => {
  return (
    <Box paddingRight="1rem" cursor="pointer">
      <ProfileIcon />
    </Box>
  );
};
