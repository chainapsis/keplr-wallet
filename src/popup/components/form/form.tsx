import React, { FunctionComponent, FormHTMLAttributes } from "react";

import classnames from "classnames";

export const Form: FunctionComponent<FormHTMLAttributes<any>> = props => {
  return (
    <form
      {...props}
      className={classnames(props.className, ["pure-form", "form"])}
    >
      {props.children}
    </form>
  );
};
