import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import { Size, Color, getSizeClass, getColorClass } from "../../styles/type";
import { Link } from "react-router-dom";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  size?: Size;
  color?: Color;
  to?: string;
  fullWidth?: boolean;
  outline?: boolean;
  inverted?: boolean;
  rounded?: boolean;
  focused?: boolean;
  active?: boolean;
  loading?: boolean;
}

export const Button: FunctionComponent<ButtonProps> = props => {
  const {
    size,
    color,
    to,
    fullWidth,
    outline,
    inverted,
    rounded,
    focused,
    active,
    loading
  } = props;

  return (
    <>
      {to ? (
        <Link
          {...props}
          className={classnames(props.className, [
            "button",
            getSizeClass(size),
            getColorClass(color),
            { "is-fullwidth": fullWidth },
            { "is-outline": outline },
            { "is-inverted": inverted },
            { "is-rounded": rounded },
            { "is-focused": focused },
            { "is-active": active },
            { "is-loading": loading }
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
