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
import { useTheme } from "styled-components";

export const IBCTransferView: FunctionComponent = () => {
  const { analyticsStore } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-650"]
      }
      borderRadius="0.375rem"
      padding="1rem"
      style={{
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      <Columns sum={1} alignY="center">
        <Stack gutter="0.5rem">
          <XAxis alignY="center">
            <Subtitle2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-10"]
              }
            >
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
            navigate(
              `/send/select-asset?isIBCTransfer=true&navigateTo=${encodeURIComponent(
                "/ibc-transfer?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
              )}`
            );
          }}
        />
      </Columns>
    </Box>
  );
};
