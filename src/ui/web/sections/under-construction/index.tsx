import React, { FunctionComponent } from "react";

import style from "./styles.module.scss";

export const UnderConstructionSection: FunctionComponent = () => {
  return (
    <div className={style.section}>
      <img
        src={require("assets/pluto-uploading-1.svg")}
        alt="under construction"
      />
      <p>Page under construction</p>
    </div>
  );
};
