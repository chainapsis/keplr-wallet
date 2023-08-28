import React, { FunctionComponent, PropsWithChildren } from "react";
import { Styles } from "./styles";
import { BoxProps } from "./types";

export const Box: FunctionComponent<PropsWithChildren<BoxProps>> = ({
  children,
  style,
  className,
  ...props
}) => {
  return (
    <Styles.Container {...props} style={style} className={className}>
      {children}
    </Styles.Container>
  );
};
