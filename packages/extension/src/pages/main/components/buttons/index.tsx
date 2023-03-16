import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";

export const Buttons: FunctionComponent = () => {
  return (
    <Box paddingX="0.5rem">
      <Columns sum={1}>
        <Column weight={1}>
          <Button text="Deposit" />
        </Column>
        <Gutter size="0.5rem" />
        <Column weight={1}>
          <Button text="Send" />
        </Column>
      </Columns>
    </Box>
  );
};
