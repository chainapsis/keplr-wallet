import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";

export const ClaimAll: FunctionComponent = () => {
  return (
    <Box paddingX="0.5rem">
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <Stack>
            <Box>Pending Staking Reward</Box>
            <Box>$ 1.50</Box>
          </Stack>
        </Column>
        <Button text="Claim All" />
      </Columns>
    </Box>
  );
};
