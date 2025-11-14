import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { FolderMinusIcon } from "../../../../components/icon";
import { Gutter } from "../../../../components/gutter";
import { Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage } from "react-intl";

export const NoResultBox: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <Box alignX="center" alignY="center" paddingY="1.875rem">
      <FolderMinusIcon
        width="4.5rem"
        height="4.5rem"
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
      />
      <Gutter size="0.75rem" />
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
        style={{
          textAlign: "center",
          width: "17.25rem",
        }}
      >
        <FormattedMessage id="page.main.components.deposit-modal.empty-text" />
      </Subtitle3>
    </Box>
  );
};
