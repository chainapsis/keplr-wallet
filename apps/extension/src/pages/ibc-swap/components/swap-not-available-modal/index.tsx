import React, { FunctionComponent } from "react";
import { Modal } from "../../../../components/modal";
import { Box } from "../../../../components/box";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body2, H4 } from "../../../../components/typography";
import { XAxis, YAxis } from "../../../../components/axis";
import { InformationOutlineIcon } from "../../../../components/icon";
import { Gutter } from "../../../../components/gutter";
import { Button } from "../../../../components/button";
import { useIntl } from "react-intl";

export const SwapNotAvailableModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = ({ isOpen, close }) => {
  const theme = useTheme();
  const intl = useIntl();

  return (
    <Modal isOpen={isOpen} close={close} align="bottom" maxHeight="95vh">
      <Box
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        paddingX="0.75rem"
        paddingTop="1rem"
      >
        <Box paddingX="0.5rem" paddingY="0.375rem">
          <XAxis alignY="center">
            <InformationOutlineIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
            <Gutter size="0.625rem" />
            <H4
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette.white
              }
            >
              {intl.formatMessage({
                id: "page.ibc-swap.components.swap-not-available-modal.title",
              })}
            </H4>
          </XAxis>
        </Box>
        <Gutter size="0.75rem" />
        <YAxis alignX="center">
          <Body2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-200"]
            }
          >
            {intl.formatMessage({
              id: "page.ibc-swap.components.swap-not-available-modal.paragraph",
            })}
          </Body2>
        </YAxis>
        <Gutter size="0.75rem" />
        <Button
          color="secondary"
          size="large"
          onClick={close}
          text={intl.formatMessage({
            id: "button.confirm",
          })}
        />
        <Gutter size="3rem" />
      </Box>
    </Modal>
  );
};
