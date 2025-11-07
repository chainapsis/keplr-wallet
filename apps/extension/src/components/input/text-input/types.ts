import React, { CSSProperties } from "react";

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;
  labelAlignment?: "space-between" | "compact" | React.ReactNode;

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
  textSuffix?: string | React.ReactNode;

  borderRadius?: string;
}
