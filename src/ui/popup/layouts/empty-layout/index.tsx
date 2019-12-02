import React, { FunctionComponent } from "react";

import style from "./style.module.scss";

export const EmptyLayout: FunctionComponent = props => {
  const { children } = props;

  return <div className={style.container}>{children}</div>;
};
