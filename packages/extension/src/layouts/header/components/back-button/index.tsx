import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ArrowLeftIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";

export const BackButton: FunctionComponent<{ hidden?: boolean }> = ({
  hidden,
}) => {
  const navigate = useNavigate();

  if (window.history.state && window.history.state.idx === 0) {
    return null;
  }

  if (hidden) {
    return null;
  }

  return (
    <Box paddingLeft="1rem" cursor="pointer" onClick={() => navigate(-1)}>
      <ArrowLeftIcon />
    </Box>
  );
};
