import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { Stack } from "../../../../components/stack";
import { Body3, Subtitle2 } from "../../../../components/typography";
import { Button } from "../../../../components/button";
import { useNavigate } from "react-router";
import { XAxis } from "../../../../components/axis";
import { QuestionIcon } from "../../../../components/icon";
import { Tooltip } from "../../../../components/tooltip";
import { Gutter } from "../../../../components/gutter";

export const IBCTransferView: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      padding="1rem"
    >
      <Columns sum={1} alignY="center">
        <Stack gutter="0.5rem">
          <XAxis alignY="center">
            <Subtitle2 color={ColorPalette["gray-10"]}>IBC Transfer</Subtitle2>

            <Gutter size="0.25rem" />

            <Tooltip content="If relayers are not online/active, the transfers might take longer time. Ask in the corresponding community groups for the validators to clear the packets.">
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            </Tooltip>
          </XAxis>

          <Body3 color={ColorPalette["gray-300"]}>Send tokens over IBC</Body3>
        </Stack>

        <Column weight={1} />

        <Button
          text="Transfer"
          size="small"
          onClick={() => navigate("/send/select-asset?isIBCTransfer=true")}
        />
      </Columns>
    </Box>
  );
};
