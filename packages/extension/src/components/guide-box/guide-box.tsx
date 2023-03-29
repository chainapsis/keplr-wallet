import React, { FunctionComponent } from "react";
import { GuideBoxProps } from "./types";
import { Styles } from "./styles";
import { Columns } from "../column";
import { InformationIcon } from "../icon";
import { Box } from "../box";

export const GuideBox: FunctionComponent<GuideBoxProps> = ({
  title,
  paragraph,
  color = "default",
  bottom,
}) => {
  return (
    <Styles.Container gutter="0.5rem" color={color}>
      <Columns sum={1} alignY="center" gutter="0.375rem">
        <InformationIcon width="1.25rem" height="1.25rem" />
        <Styles.Title color={color}>{title}</Styles.Title>
      </Columns>
      <Styles.Paragraph color={color}>{paragraph}</Styles.Paragraph>
      {bottom ? <Box>{bottom}</Box> : null}
    </Styles.Container>
  );
};
