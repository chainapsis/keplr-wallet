import React, { FunctionComponent, ButtonHTMLAttributes } from "react";
import classnames from "classnames";
import "./style";

export interface ButtonProps extends ButtonHTMLAttributes<any> {
  size?: string;
}

export const Button: FunctionComponent<ButtonProps> = props => {
  return (
    <button className={classnames(["pure-button"])} {...props}>
      {props.children}
    </button>
  );
};
