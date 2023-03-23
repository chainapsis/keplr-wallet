import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
export const PoweredByNote: FunctionComponent = () => {
  return (
    <div
      className={style.poweredByNoteContainer}
      onClick={() => window.open("http://notyphi.com/")}
    >
      <p className={style.poweredByNoteText}>
        Powered by{" "}
        <img draggable={false} src={require("@assets/svg/notiphy-icon.svg")} />
      </p>
    </div>
  );
};
