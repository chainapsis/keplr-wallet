import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { Stack } from "../../../../components/stack";
import { Body3, Subtitle2 } from "../../../../components/typography";
import { Button } from "../../../../components/button";

export const IBCTransferView: FunctionComponent = () => {
  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      padding="1rem"
    >
      <Columns sum={1} alignY="center">
        <Stack gutter="0.5rem">
          <Subtitle2 color={ColorPalette["gray-10"]}>IBC Transfer</Subtitle2>
          <Body3 color={ColorPalette["gray-300"]}>Send tokens over IBC</Body3>
        </Stack>

        <Column weight={1} />

        <Button text="Transfer" size="small" />
      </Columns>
    </Box>
  );
};
