import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import { Size, Color, getSizeClass, getColorClass } from "../../styles/type";

import "./style";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  size?: Size;
  color?: Color;
}

export const Button: FunctionComponent<ButtonProps> = props => {
  const { size, color } = props;

  return (
    <button
      {...props}
      className={classnames(props.className, [
        "pure-button",
        "button",
        getSizeClass(size),
        getColorClass(color)
      ])}
    >
      {props.children}
    </button>
  );
};
