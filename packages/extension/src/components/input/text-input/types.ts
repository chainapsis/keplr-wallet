import React, { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;

  paragraph?: string;
  error?: string;
  errorBorder?: boolean;
  isLoading?: boolean;

  className?: string;

  disabled?: boolean;
  style?: CSSProperties;
  left?: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
}
