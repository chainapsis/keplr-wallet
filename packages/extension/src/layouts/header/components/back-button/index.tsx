import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ArrowLeftIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";

export const BackButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box paddingLeft="1rem" cursor="pointer" onClick={() => navigate(-1)}>
      <ArrowLeftIcon />
    </Box>
  );
};
