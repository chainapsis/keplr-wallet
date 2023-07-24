import React, { FunctionComponent, useState } from "react";
import styleCollapse from "./style.module.scss";
import classNames from "classnames";

interface Props {
  title: string;
  count?: string;
}

export const Collapse: FunctionComponent<Props> = (props) => {
  const { title, count, children } = props;

  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div
      className={classNames(
        styleCollapse["container"],
        styleCollapse["flexVertical"]
      )}
    >
      <div
        className={classNames(
          styleCollapse["flexHorizontal"],
          styleCollapse["itemsCenter"],
          styleCollapse["contentBetween"],
          styleCollapse["clickable"]
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styleCollapse["title"]}>{title}</div>

        <div className={styleCollapse["flexHorizontal"]}>
          <div className={styleCollapse["count"]}>
            {count ? <div>{count}</div> : null}
          </div>

          <div className={isOpen ? undefined : styleCollapse["rotate"]}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5.25 15.375L12 8.625L18.75 15.375"
                stroke="#C6C6CD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      {isOpen ? <div>{children}</div> : null}
    </div>
  );
};
