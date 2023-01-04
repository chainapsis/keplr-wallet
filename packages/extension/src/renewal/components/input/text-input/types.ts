import { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  paragraph?: string;
  error?: string;

  removeBottomMargin?: boolean;

  className?: string;
  style?: CSSProperties;
}
