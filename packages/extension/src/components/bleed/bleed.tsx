import React, { FunctionComponent, PropsWithChildren } from "react";
import { Styles } from "./styles";
import { BleedProps } from "./types";

export const Bleed: FunctionComponent<PropsWithChildren<BleedProps>> = ({
  children,
  ...props
}) => {
  return <Styles.Container {...props}>{children}</Styles.Container>;
};
