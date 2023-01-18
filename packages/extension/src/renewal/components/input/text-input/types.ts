import { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  paragraph?: string;
  error?: string;
  errorBorder?: boolean;

  readOnly?: boolean;

  removeBottomMargin?: boolean;

  className?: string;
  style?: CSSProperties;
}
