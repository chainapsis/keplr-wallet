import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Caption1 } from "../../../../components/typography";
import { Checkbox } from "../../../../components/checkbox";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useTheme } from "styled-components";
import { FormattedMessage } from "react-intl";

export const HighFeeWarning: FunctionComponent<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = observer(({ checked, onChange }) => {
  const theme = useTheme();

  return (
    <Box
      padding="1.125rem"
      borderRadius="0.5rem"
      style={{
        boxShadow: !checked
          ? `0 0 0 ${theme.mode === "light" ? "1px" : "2px"} inset ${
              theme.mode === "light"
                ? ColorPalette["blue-400"]
                : ColorPalette["blue-400"]
            }`
          : undefined,
      }}
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["blue-50"]
          : ColorPalette["gray-600"]
      }
    >
      <XAxis alignY="center">
        <Caption1
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-100"]
          }
        >
          <FormattedMessage
            id="page.sign.cosmos.tx.high-fee-warning"
            values={{
              br: <br />,
            }}
          />
        </Caption1>
        <div style={{ flex: 1, minWidth: "0.25rem" }} />
        <Box width="1.5rem" minWidth="1.5rem">
          <Checkbox checked={checked} onChange={onChange} />
        </Box>
      </XAxis>
    </Box>
  );
});
