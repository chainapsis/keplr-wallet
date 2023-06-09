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
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";

export const IBCTransferView: FunctionComponent = () => {
  const { analyticsStore } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <Box
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      padding="1rem"
    >
      <Columns sum={1} alignY="center">
        <Stack gutter="0.5rem">
          <XAxis alignY="center">
            <Subtitle2 color={ColorPalette["gray-10"]}>
              <FormattedMessage id="page.main.components.ibc-transfer-view.title" />
            </Subtitle2>

            <Gutter size="0.25rem" />

            <Tooltip
              content={intl.formatMessage({
                id: "page.main.components.ibc-transfer-view.tooltip",
              })}
            >
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            </Tooltip>
          </XAxis>

          <Body3 color={ColorPalette["gray-300"]}>
            <FormattedMessage id="page.main.components.ibc-transfer-view.paragraph" />
          </Body3>
        </Stack>

        <Column weight={1} />

        <Button
          text={intl.formatMessage({
            id: "page.main.components.ibc-transfer-view.transfer-button",
          })}
          size="small"
          onClick={() => {
            analyticsStore.logEvent("click_ibcTransfer");
            navigate("/send/select-asset?isIBCTransfer=true");
          }}
        />
      </Columns>
    </Box>
  );
};
