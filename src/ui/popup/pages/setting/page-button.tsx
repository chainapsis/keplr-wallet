import React, { FunctionComponent, MouseEvent } from "react";

import stylePageButton from "./page-button.module.scss";

export const PageButton: FunctionComponent<{
  title: string;
  paragraph?: string;
  onClick?: (e: MouseEvent) => void;
} & React.HTMLAttributes<HTMLDivElement>> = props => {
  const { title, paragraph } = props;

  const attributes = { ...props };
  delete attributes.title;
  delete attributes.paragraph;

  return (
    <div className={stylePageButton.container} {...attributes}>
      <h1>{title}</h1>
      {paragraph ? <p>{paragraph}</p> : null}
    </div>
  );
};
