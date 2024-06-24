import { CSSProperties, MouseEventHandler } from "react";

export type BoxAlignX = "left" | "right" | "center";
export type BoxAlignY = "top" | "bottom" | "center";

export interface BoxProps {
  position?: "relative" | "absolute" | "fixed";
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  padding?: string;
  paddingX?: string;
  paddingY?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginX?: string;
  marginY?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;

  zIndex?: number;

  alignX?: BoxAlignX;
  alignY?: BoxAlignY;

  cursor?: "pointer" | "not-allowed" | "progress" | "grab" | "grabbing";

  className?: string;
  style?: CSSProperties;

  as?: React.ElementType;

  onClick?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseMove?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;

  onHoverStateChange?: (isHover: boolean) => void;

  hover?: {
    color?: string;
    backgroundColor?: string;
    borderWidth?: string;
    borderColor?: string;
  };

  after?: {
    backgroundColor: string;
    borderRadius?: string;
  };
}
