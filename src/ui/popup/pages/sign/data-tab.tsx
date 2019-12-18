import React, { FunctionComponent } from "react";

import style from "./style.module.scss";

export const DataTab: FunctionComponent<{
  message: string;
}> = ({ message }) => {
  let prettyMessage = message;
  if (prettyMessage) {
    try {
      prettyMessage = JSON.stringify(JSON.parse(prettyMessage), undefined, 2);
    } catch (e) {
      prettyMessage = message;
    }
  }

  return <pre className={style.message}>{prettyMessage}</pre>;
};
