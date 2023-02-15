import React, { FunctionComponent } from "react";
import { Styles } from "./styles";
import { CardProps } from "./types";
import { ColorPalette } from "../../styles";

export const Card: FunctionComponent<CardProps> = ({
  children,
  // TODO: Consider theming.
  backgroundColor = ColorPalette["white"],
  borderRadius = "1rem",
  border = `1px solid ${ColorPalette["gray-50"]}`,
  ...props
}) => {
  return (
    <Styles.Container
      {...props}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      border={border}
    >
      {children}
    </Styles.Container>
  );
};
