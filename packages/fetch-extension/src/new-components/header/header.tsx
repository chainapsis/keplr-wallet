import React, { FunctionComponent } from "react";
import classnames from "classnames";

import style from "./style.module.scss";

export interface HeaderProps {
  fixed?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  notification?: React.ReactNode;
}

export const Header: FunctionComponent<HeaderProps> = ({
  fixed,
  left,
  right,
  children,
  notification,
}) => {
  return (
    <div className={classnames([style["header"], { fixed }])}>
      <div className={style["header-menu-left"]}>{left}</div>
      <div className={style["header-section"]}>{children}</div>
      <div className={style["header-menu-right"]}>
        {notification} {right}
      </div>
    </div>
  );
};
