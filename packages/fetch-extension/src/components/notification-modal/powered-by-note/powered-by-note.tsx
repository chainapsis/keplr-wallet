import React, { FunctionComponent } from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
export const PoweredByNote: FunctionComponent = () => {
  const { analyticsStore } = useStore();

  return (
    <div
      className={style["poweredByNoteContainer"]}
      onClick={() => {
        analyticsStore.logEvent("notyphi_click");
        window.open("http://notyphi.com/");
      }}
    >
      <p className={style["poweredByNoteText"]}>
        Powered by{" "}
        <img draggable={false} src={require("@assets/svg/notiphy-icon.svg")} />
      </p>
    </div>
  );
};
