import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ProfileCircleIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";

export const ProfileButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box
      paddingRight="1rem"
      cursor="pointer"
      onClick={() => {
        navigate("/wallet/select");
      }}
    >
      <ProfileCircleIcon />
    </Box>
  );
};
