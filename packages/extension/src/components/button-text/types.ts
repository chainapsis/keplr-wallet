import React, { CSSProperties } from "react";

export type ButtonType = "button" | "submit" | "reset";
export type ButtonSize = "small" | "large";

export interface TextButtonProps {
  size?: ButtonSize;
  disabled?: boolean;
  text?: string | React.ReactNode;
  right?: React.ReactNode;
  onClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void | Promise<void>;

  // Native html element
  type?: ButtonType;

  className?: string;
  style?: CSSProperties;
}
