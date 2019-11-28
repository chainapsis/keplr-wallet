import React, { FunctionComponent } from "react";

import styleMenu from "./menu.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const Menu: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  return (
    <div className={styleMenu.container}>
      {/* Empty div for separating last item */}
      <div style={{ flex: 1 }} />
      {/* If development env, show clear button for test. */
      process.env.NODE_ENV === "development" ? (
        <div
          className={styleMenu.item}
          onClick={() => {
            keyRingStore.clear();
          }}
        >
          <span className="icon is-large">
            <i className="fas fa-2x fa-eraser" />
          </span>
          <div className={styleMenu.text}>Clear</div>
        </div>
      ) : null}
      <div
        className={styleMenu.item}
        onClick={() => {
          keyRingStore.lock();
        }}
      >
        <span className="icon is-large">
          <i className="fas fa-2x fa-sign-out-alt" />
        </span>
        <div className={styleMenu.text}>Sign out</div>
      </div>
    </div>
  );
});
