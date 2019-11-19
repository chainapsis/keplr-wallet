import React, { FunctionComponent } from "react";

import style from "./style.module.scss";

import classnames from "classnames";

export const Card: FunctionComponent<React.HTMLAttributes<unknown>> = props => {
  const { children } = props;
  const tempClassName = props.className;
  delete props.className;

  return (
    <div className={classnames("card", style.card, tempClassName)} {...props}>
      {children}
    </div>
  );
};
