import React, { CSSProperties, FunctionComponent } from "react";

import style from "./style.module.scss";

interface Props {
  style?: CSSProperties;
}

export const EmptyLayout: FunctionComponent<Props> = props => {
  const { children } = props;

  return (
    <div className={style.container} style={props.style}>
      {children}
    </div>
  );
};
