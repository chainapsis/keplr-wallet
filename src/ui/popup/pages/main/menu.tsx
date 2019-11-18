import React, { FunctionComponent } from "react";

import styleMenu from "./menu.module.scss";

export const Menu: FunctionComponent = () => {
  return (
    <div className={styleMenu.container}>
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      <div className={styleMenu.item}>
        <span className="icon is-large">
          <i className="fas fa-2x fa-sign-out-alt" />
        </span>
        <div className={styleMenu.text}>Sign out</div>
      </div>
    </div>
  );
};
