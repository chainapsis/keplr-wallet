import React, { FunctionComponent } from "react";
import { TextButtonProps } from "./types";
import { Styles } from "./styles";

export const TextButton: FunctionComponent<TextButtonProps> = ({
  onClick,
  style,
  className,
  text,
  right,
  ...otherProps
}) => {
  return (
    <Styles.Container style={style} className={className}>
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
