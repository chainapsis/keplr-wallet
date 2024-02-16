import React, { FunctionComponent } from "react";
import { GuideBoxProps } from "./types";
import { getParagraphColor, getTitleColor, Styles } from "./styles";
import { Column, Columns } from "../column";
import { InformationIcon } from "../icon";
import { Box } from "../box";
import { Body3, Subtitle4 } from "../typography";
import { useTheme } from "styled-components";

export const GuideBox: FunctionComponent<GuideBoxProps> = ({
  title,
  paragraph,
  color = "default",
  titleRight,
  bottom,
  hideInformationIcon,
  backgroundColor,
}) => {
  const theme = useTheme();

  return (
    <Styles.Container
      gutter="0.5rem"
      color={color}
      backgroundColor={backgroundColor}
    >
      <Columns sum={1} alignY="center" gutter="0.375rem">
        {!hideInformationIcon ? (
          <InformationIcon width="1.25rem" height="1.25rem" />
        ) : null}
        <Column weight={1}>
          <Subtitle4 color={getTitleColor(theme, color)}>{title}</Subtitle4>
        </Column>
        {titleRight}
      </Columns>
      {paragraph ? (
        <Body3 color={getParagraphColor(theme, color)}>{paragraph}</Body3>
      ) : null}
      {bottom ? <Box>{bottom}</Box> : null}
    </Styles.Container>
  );
};
