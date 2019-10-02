import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import { Size, Color, getSizeClass, getColorClass } from "../../styles/type";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  size?: Size;
  color?: Color;
}

export const Button: FunctionComponent<ButtonProps> = props => {
  const { size, color } = props;

  return (
    <a
      {...props}
      className={classnames(props.className, [
        "button",
        getSizeClass(size),
        getColorClass(color)
      ])}
    >
      {props.children}
    </a>
  );
};
