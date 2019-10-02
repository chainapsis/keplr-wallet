import React from "react";
import classnames from "classnames";

import "./style";

export interface HeaderProps {
  fixed?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export class Header extends React.Component<HeaderProps> {
  render() {
    const { fixed, left, right, children } = this.props;

    return (
      <div className={classnames(["header", { fixed }])}>
        <div className="header-menu-left">{left}</div>
        <div className="header-section">{children}</div>
        <div className="header-menu-right">{right}</div>
      </div>
    );
  }
}
