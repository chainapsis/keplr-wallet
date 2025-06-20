export type AxisAlignX = "left" | "right" | "center";
export type AxisAlignY = "top" | "bottom" | "center";

export interface XAxisProps {
  alignY?: AxisAlignY;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: string;
}

export interface YAxisProps {
  alignX?: AxisAlignX;
  gap?: string;
}
