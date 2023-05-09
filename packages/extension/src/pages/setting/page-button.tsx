import React, { FunctionComponent } from "react";

import classnames from "classnames";

import stylePageButton from "./page-button.module.scss";
import { ToolTip } from "@components/tooltip";

const disabledIcons = () => {
  return [
    <i key="edit" className="fas fa-pen" />,
    <i key="remove" className="fas fa-trash" />,
  ];
};
export const PageButton: FunctionComponent<
  {
    title: string;
    paragraph?: string;
    subParagraph?: string;
    icons?: React.ReactElement[];
    disabled?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = (props) => {
  const { title, paragraph, subParagraph, icons, disabled } = props;

  const style = classnames(stylePageButton.container, {
    [stylePageButton.withSubParagraph]: subParagraph != null,
    [stylePageButton.disablePageButton]: disabled,
  });

  const attributes = { ...props };
  delete attributes.paragraph;
  delete attributes.subParagraph;
  delete attributes.icons;

  const mainIcons = disabled ? disabledIcons() : icons;
  return (
    <div className={style} {...attributes}>
      <div className={stylePageButton.innerContainer}>
        <ToolTip
          tooltip={title}
          theme="dark"
          trigger="hover"
          options={{
            placement: "top",
          }}
        >
          <h1>{title}</h1>
        </ToolTip>
        {paragraph ? <p>{paragraph}</p> : null}
        {subParagraph ? (
          <p className={stylePageButton.innerContainerSubParagraph}>
            {subParagraph}
          </p>
        ) : null}
      </div>
      <div style={{ flex: 1 }} />
      {icons
        ? mainIcons?.map((icon, i) => {
            return (
              <div className={stylePageButton.iconContainer} key={i.toString()}>
                <div style={{ flex: 1 }} />
                {icon}
                <div style={{ flex: 1 }} />
              </div>
            );
          })
        : null}
    </div>
  );
};
