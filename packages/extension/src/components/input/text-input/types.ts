import React, { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;

  paragraph?: string;
  error?: string;
  errorBorder?: boolean;

  className?: string;

  disabled?: boolean;
  style?: CSSProperties;
  right?: React.ReactNode;
}
