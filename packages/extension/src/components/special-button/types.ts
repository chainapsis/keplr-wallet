import React from "react";

export interface SpecialButtonProps {
  left?: React.ReactNode;
  text?: string;
  right?: React.ReactNode;
  onClick?: () => void;

  isLoading?: boolean;
  textOverrideIcon?: React.ReactNode;
}
