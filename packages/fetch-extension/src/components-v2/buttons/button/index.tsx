import React, { ReactNode } from "react";
import style from "./style.module.scss";

export interface Props {
  onClick?: any;
  dataLoading?: any;
  gradientText?: string;
  text: string | ReactNode;
  disabled?: boolean;
  styleProps?: React.CSSProperties;
  children?: ReactNode;
}

export const ButtonV2: React.FC<Props> = ({
  onClick,
  dataLoading,
  gradientText,
  text,
  disabled,
  styleProps,
  children,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onClick) {
      onClick(e);
    }

    // Add any additional logic for handling the click event when there are no children
    if (!children) {
      // For example, you can redirect or perform other actions
      console.log("Button clicked without children");
    }
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      data-loading={dataLoading ? dataLoading : null}
      className={style["btn"]}
      style={{ ...styleProps }}
    >
      {text} <span className={style["gradient"]}>{gradientText}</span>
      {children}
    </button>
  );
};
