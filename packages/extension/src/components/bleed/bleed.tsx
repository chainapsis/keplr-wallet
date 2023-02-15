import React, { FunctionComponent } from "react";
import { Styles } from "./styles";
import { BleedProps } from "./types";

export const Bleed: FunctionComponent<BleedProps> = ({
  children,
  ...props
}) => {
  return <Styles.Container {...props}>{children}</Styles.Container>;
};
