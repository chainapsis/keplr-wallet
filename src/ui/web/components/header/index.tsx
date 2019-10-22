import React, { FunctionComponent } from "react";

import classnames from "classnames";

import style from "./style.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const Header: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <nav className={classnames("level", style.header)}>
      {/* Fake is needed because section may not fill all remaining screen.
          Fake make sure that header always fill screen. */}
      <div className={style.fake} />
      <div className="level-left">{chainStore.chainInfo.chainName}</div>

      <div className="level-right" />
    </nav>
  );
});
