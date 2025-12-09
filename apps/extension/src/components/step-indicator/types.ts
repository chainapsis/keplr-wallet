import { CSSProperties } from "react";

export interface StepIndicatorProps {
  /** Total number of steps */
  totalCount: number;
  /** Number of completed steps */
  completedCount: number;
  /** Width of each indicator dot (default: "0.25rem") */
  width?: string;
  /** Height of each indicator dot (default: "0.75rem") */
  height?: string;
  /** Gap between indicator dots (default: "0.25rem") */
  gap?: string;
  /** Active color (default: theme-based blue-400/white) */
  activeColor?: string;
  /** Inactive opacity (default: 0.3) */
  inactiveOpacity?: number;
  /** Whether to blink the current step (the step at completedCount index) */
  blinkCurrentStep?: boolean;
  /** Custom style for the container */
  style?: CSSProperties;
}
