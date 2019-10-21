import React, { FunctionComponent, LabelHTMLAttributes } from "react";

import classnames from "classnames";

export const Label: FunctionComponent<LabelHTMLAttributes<any>> = props => {
  return (
    <label {...props} className={classnames(props.className, "label")}>
      {props.children}
    </label>
  );
};
