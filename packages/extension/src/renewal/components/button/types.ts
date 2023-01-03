import { CSSProperties } from "react";

export type ButtonColor = "primary" | "danger" | "info";
export type ButtonMode = "fill" | "light" | "text";
export type ButtonSize = "default" | "small";

export interface ButtonProps {
  color?: ButtonColor;
  mode?: ButtonMode;
  size?: ButtonSize;
  disabled?: boolean;
  text?: string;
  // TODO: Add icon
  onClick: () => void;

  className?: string;
  style?: CSSProperties;
}
