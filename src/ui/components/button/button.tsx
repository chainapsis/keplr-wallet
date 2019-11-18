import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import {
  Size,
  Color,
  getSizeClass,
  getColorClass
} from "../../popup/styles/type";
import { Link } from "react-router-dom";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  className?: string;
  size?: Size;
  color?: Color;
  /**
   * If "to" prop is defined, button will be Link for react-router.
   */
  to?: string;
  href?: string;
  target?: string;
  fullwidth?: boolean;
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
    href,
    target,
    fullwidth,
    outline,
    inverted,
    rounded,
    focused,
    active,
    loading
  } = props;

  const attributes = { ...props };
  delete attributes.size;
  delete attributes.color;
  delete attributes.to;
  delete attributes.href;
  delete attributes.target;
  // This is necessary because undefined boolean attributes make error.
  delete attributes.fullwidth;
  delete attributes.outline;
  delete attributes.inverted;
  delete attributes.rounded;
  delete attributes.focused;
  delete attributes.active;
  delete attributes.loading;
  delete attributes.children;

  const className = classnames(props.className, [
    "button",
    getSizeClass(size),
    getColorClass(color),
    { "is-fullwidth": fullwidth },
    { "is-outlined": outline },
    { "is-inverted": inverted },
    { "is-rounded": rounded },
    { "is-focused": focused },
    { "is-active": active },
    { "is-loading": loading }
  ]);

  return (
    <>
      {to ? (
        <Link
          {...attributes}
          className={className}
          to={to}
          target={target}
          href={href}
        >
          {props.children}
        </Link>
      ) : href ? (
        <a {...attributes} className={className} href={href} target={target}>
          {props.children}
        </a>
      ) : (
        <button {...attributes} className={className}>
          {props.children}
        </button>
      )}
    </>
  );
};
