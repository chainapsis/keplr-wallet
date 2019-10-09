import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import { Size, Color, getSizeClass, getColorClass } from "../../styles/type";
import { Link } from "react-router-dom";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  size?: Size;
  color?: Color;
  to?: string;
}

export const Button: FunctionComponent<ButtonProps> = props => {
  const { size, color, to } = props;

  return (
    <>
      {to ? (
        <Link
          {...props}
          className={classnames(props.className, [
            "button",
            getSizeClass(size),
            getColorClass(color)
          ])}
          to={to}
        >
          {props.children}
        </Link>
      ) : (
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
      )}
    </>
  );
};
