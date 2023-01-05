import { SpringConfig } from "@react-spring/web";

export interface VerticalResizeTransitionProps {
  width?: string;
  transitionAlign?: "top" | "bottom" | "center";

  springConfig?: SpringConfig;
}
