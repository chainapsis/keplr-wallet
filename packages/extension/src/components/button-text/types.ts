import React, { CSSProperties } from "react";

export type ButtonType = "button" | "submit" | "reset";
export type ButtonSize = "small" | "large";
export type ButtonColor = "default" | "faint";

export interface TextButtonProps {
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  text?: string | React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void | Promise<void>;

  // Native html element
  type?: ButtonType;

  className?: string;
  style?: CSSProperties;
}
