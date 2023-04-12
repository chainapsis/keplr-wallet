import React, { FunctionComponent } from "react";
import { Button2 } from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { CodeBracketIcon } from "../../../../components/icon";
import { Styles } from "./styles";
import { MessageTitleProps } from "./types";

export const MessageTitle: FunctionComponent<MessageTitleProps> = ({
  title,
  messageCount,
  onClick,
}) => {
  return (
    <Columns sum={1} alignY="center">
      <Styles.Title>
        {messageCount ? <Styles.Bold>{messageCount}</Styles.Bold> : null}
        {title}
      </Styles.Title>

      <Column weight={1} />

      <Styles.ViewData onClick={onClick}>
        <Columns sum={1} alignY="center" gutter="0.25rem">
          <Button2>View data</Button2>
          <Box style={{ color: ColorPalette["gray-100"] }}>
            <CodeBracketIcon width="0.75rem" height="0.75rem" />
          </Box>
        </Columns>
      </Styles.ViewData>
    </Columns>
  );
};
