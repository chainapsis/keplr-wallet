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
  const headerStyle = {
    backdropFilter: "none",
    background: children ? "rgba(0,13,61,0.9)" : "transparent",
  };

  return (
    <div
      style={{
        ...headerStyle,
      }}
      className={classnames(["header", { fixed }])}
    >
      <div className="headerMenuLeft">{left}</div>
      <div className="headerSection">{children}</div>
      <div className="headerMenuRight">
        {notification} {right}
      </div>
    </div>
  );
};
