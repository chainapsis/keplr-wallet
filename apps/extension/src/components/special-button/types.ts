import React from "react";
import { ButtonSize } from "../button";

export interface SpecialButtonProps {
  size?: ButtonSize;
  left?: React.ReactNode;
  text?: string;
  right?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;

  isLoading?: boolean;
  textOverrideIcon?: React.ReactNode;
}
