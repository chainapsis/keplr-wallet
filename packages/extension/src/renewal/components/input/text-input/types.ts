import { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  paragraph?: string;
  error?: string;

  readOnly?: boolean;

  removeBottomMargin?: boolean;

  className?: string;
  style?: CSSProperties;
}
