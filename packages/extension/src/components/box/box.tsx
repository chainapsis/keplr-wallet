import React, { FunctionComponent } from "react";
import { Styles } from "./styles";
import { BoxProps } from "./types";

export const Box: FunctionComponent<BoxProps> = ({
  children,
  style,
  className,
  onHoverStateChange,
  ...props
}) => {
  return (
    <Styles.Container
      {...props}
      style={style}
      className={className}
      onMouseEnter={() => {
        onHoverStateChange?.(true);
      }}
      onMouseLeave={() => {
        onHoverStateChange?.(false);
      }}
    >
      {children}
    </Styles.Container>
  );
};
