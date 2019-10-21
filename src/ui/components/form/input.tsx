import React, { FunctionComponent, InputHTMLAttributes } from "react";

import classnames from "classnames";

export const Input: FunctionComponent<InputHTMLAttributes<any>> = props => {
  return (
    <input {...props} className={classnames(props.className, "input")}>
      {props.children}
    </input>
  );
};
