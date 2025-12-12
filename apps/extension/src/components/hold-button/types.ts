import { ReactNode } from "react";
import { ButtonProps } from "../button/types";

export interface HoldButtonProps extends ButtonProps {
  holdDurationMs: number;
  onConfirm?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  onProgressChange?: (progress: number) => void;

  progressSize?: string;
  holdingText?: string | ReactNode;
}
