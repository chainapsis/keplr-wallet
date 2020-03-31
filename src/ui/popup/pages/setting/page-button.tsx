import React, { FunctionComponent } from "react";

import stylePageButton from "./page-button.module.scss";

export const PageButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  icon?: React.ReactElement;
} & React.HTMLAttributes<HTMLDivElement>> = props => {
  const { title, paragraph, icon } = props;

  const attributes = { ...props };
  delete attributes.title;
  delete attributes.paragraph;
  delete attributes.icon;

  return (
    <div className={stylePageButton.container} {...attributes}>
      <div className={stylePageButton.innerContainer}>
        <h1>{title}</h1>
        {paragraph ? <p>{paragraph}</p> : null}
      </div>
      <div style={{ flex: 1 }} />
      <div className={stylePageButton.iconContainer}>
        <div style={{ flex: 1 }} />
        {icon}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
};
