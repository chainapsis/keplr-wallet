import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { useNavigate } from "react-router";

export const Buttons: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Columns sum={1}>
        <Column weight={1}>
          <Button text="Deposit" color="secondary" />
        </Column>
        <Gutter size="0.5rem" />
        <Column weight={1}>
          <Button text="Send" onClick={() => navigate("/send/select-asset")} />
        </Column>
      </Columns>
    </Box>
  );
};
