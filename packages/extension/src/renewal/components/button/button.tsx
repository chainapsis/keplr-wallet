import React, { FunctionComponent } from "react";
import { ButtonProps } from "./types";
import { Styles } from "./styles";

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  style,
  className,
  text,
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
          e.preventDefault();

          onClick();
        }}
      >
        {text}
      </Styles.Button>
    </Styles.Container>
  );
};
