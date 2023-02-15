import { SpringConfig } from "@react-spring/web";

export interface VerticalCollapseTransitionProps {
  collapsed: boolean;

  width?: string;
  transitionAlign?: "top" | "bottom" | "center";

  springConfig?: SpringConfig;
}
