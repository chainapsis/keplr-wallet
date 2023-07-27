import React, { FunctionComponent, useState } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { Body2, Subtitle1 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { GuideBox } from "../../../../components/guide-box";
import { useIntl } from "react-intl";
import { XAxis, YAxis } from "../../../../components/axis";
import { Button } from "../../../../components/button";
import { Checkbox } from "../../../../components/checkbox";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

export const IBCTransferWarningModal: FunctionComponent<{
  isLoading: boolean;

  onClick: () => void;
}> = observer(({ isLoading, onClick }) => {
  const { uiConfigStore } = useStore();

  const theme = useTheme();
  const intl = useIntl();

  const [doNotShowAgain, setDoNotShowAgain] = useState(
    uiConfigStore.sendPageIBCTransferDoNotShowWarningAgain
  );

  return (
    <Box
      width="100%"
      paddingTop="1.25rem"
      paddingBottom="0.75rem"
      paddingX="0.75rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["white"]
          : ColorPalette["gray-600"]
      }
      style={{
        overflowY: "auto",
      }}
    >
      <YAxis alignX="center">
        <Subtitle1
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette.white
          }
        >
          Proceed with Caution
        </Subtitle1>
      </YAxis>

      <Gutter size="0.75rem" />

      <GuideBox
        color="warning"
        title={intl.formatMessage({
          id: "page.ibc-transfer.select-channel.warning-title",
        })}
        paragraph={intl.formatMessage({
          id: "page.ibc-transfer.select-channel.warning-paragraph",
        })}
      />

      <Gutter size="0.75rem" />

      <YAxis alignX="center">
        <Box
          onClick={(e) => {
            e.preventDefault();

            if (!isLoading) {
              setDoNotShowAgain((v) => !v);
            }
          }}
          cursor={isLoading ? undefined : "pointer"}
        >
          <XAxis alignY="center">
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              Understood. Do not show this message again.
            </Body2>
            <Gutter size="0.25rem" />
            <Checkbox
              size="small"
              checked={doNotShowAgain}
              onChange={() => {
                // noop
              }}
            />
          </XAxis>
        </Box>
      </YAxis>

      <Gutter size="0.75rem" />

      <Button
        text="Next"
        color="primary"
        size="large"
        isLoading={isLoading}
        onClick={() => {
          uiConfigStore.setSendPageIBCTransferDoNotShowWarningAgain(
            doNotShowAgain
          );

          onClick();
        }}
      />
    </Box>
  );
});
