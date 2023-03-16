import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ProfileIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";

export const ProfileButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box
      paddingRight="1rem"
      cursor="pointer"
      onClick={() => {
        navigate("/setting");
      }}
    >
      <ProfileIcon />
    </Box>
  );
};
