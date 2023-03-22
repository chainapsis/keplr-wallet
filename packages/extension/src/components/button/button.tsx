import React, { FunctionComponent } from "react";
import { ButtonProps } from "./types";
import { Styles } from "./styles";

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  style,
  className,
  text,
  right,
  ...otherProps
}) => {
  return (
    <Styles.Container
      style={style}
      className={className}
      mode={otherProps.mode}
    >
      <Styles.Button
        {...otherProps}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();

            onClick();
          }
        }}
      >
        {text}
        {right ? <Styles.Right>{right}</Styles.Right> : null}
      </Styles.Button>
    </Styles.Container>
  );
};
