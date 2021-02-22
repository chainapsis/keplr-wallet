import React, { CSSProperties, FunctionComponent } from "react";

import style from "./style.module.scss";

import classnames from "classnames";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export const EmptyLayout: FunctionComponent<Props> = (props) => {
  const { children } = props;

  return (
    <div
      className={classnames(style.container, props.className)}
      style={props.style}
    >
      {children}
    </div>
  );
};
