import React, { CSSProperties } from "react";

export type ButtonColor = "primary" | "secondary" | "danger";
export type ButtonTheme = "dark" | "light";
export type ButtonMode = "fill";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonSize =
  | "default"
  | "extraSmall"
  | "small"
  | "medium"
  | "large";

export interface ButtonProps {
  color?: ButtonColor;
  mode?: ButtonMode;
  size?: ButtonSize;
  disabled?: boolean;
  left?: React.ReactNode;
  text?: string | React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;

  // Native html element
  type?: ButtonType;

  className?: string;
  style?: CSSProperties;

  isLoading?: boolean;
  textOverrideIcon?: React.ReactNode;
}
