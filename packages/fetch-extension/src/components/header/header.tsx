import React, { FunctionComponent } from "react";
import classnames from "classnames";

import "./style";

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
    <div className={classnames(["header", { fixed }])}>
      <div className="headerMenuLeft">{left}</div>
      <div className="headerSection">{children}</div>
      <div className="headerMenuRight">
        {notification} {right}
      </div>
    </div>
  );
};
