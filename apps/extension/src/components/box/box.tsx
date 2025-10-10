import React, { forwardRef, PropsWithChildren } from "react";
import { Styles } from "./styles";
import { BoxProps } from "./types";

// eslint-disable-next-line react/display-name
export const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(
  ({ children, style, className, onHoverStateChange, ...props }, ref) => {
    return (
      <Styles.Container
        {...props}
        ref={ref}
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
  }
);
