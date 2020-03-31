import React, { FunctionComponent } from "react";

import stylePageButton from "./page-button.module.scss";

export const PageButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  onClick?: () => void;
}> = ({ title, paragraph, onClick }) => {
  return (
    <div className={stylePageButton.container} onClick={onClick}>
      <h1>{title}</h1>
      {paragraph ? <p>{paragraph}</p> : null}
    </div>
  );
};
