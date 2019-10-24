import React, { FunctionComponent } from "react";

import classnames from "classnames";
import style from "./styles.module.scss";

export const SuccessSvg: FunctionComponent = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      className=""
      data-icon="check-circle"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" />
    </svg>
  );
};

export const ErrorSvg: FunctionComponent = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      className=""
      data-icon="close-circle"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z" />
    </svg>
  );
};

export interface Props {
  status: "success" | "error";
  title: string;
  subTitle: string;
  extra?: React.ReactNode;
}

export const Result: FunctionComponent<Props> = ({
  status,
  title,
  subTitle,
  extra
}) => {
  return (
    <div className={classnames(style.container, style[status])}>
      {(function() {
        if (status === "success") return <SuccessSvg />;
        if (status === "error") return <ErrorSvg />;
      })()}
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      {extra ? extra : null}
    </div>
  );
};
