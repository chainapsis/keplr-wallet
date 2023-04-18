import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { useNavigate } from "react-router";

export const Buttons: FunctionComponent<{
  onClickDeposit: () => void;
  onClickBuy: () => void;
}> = ({ onClickDeposit, onClickBuy }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Columns sum={1} gutter="0.625rem">
        <Column weight={1}>
          <Button text="Deposit" color="secondary" onClick={onClickDeposit} />
        </Column>

        <Column weight={1}>
          <Button text="Buy" color="secondary" onClick={onClickBuy} />
        </Column>

        <Column weight={1}>
          <Button text="Send" onClick={() => navigate("/send/select-asset")} />
        </Column>
      </Columns>
    </Box>
  );
};
