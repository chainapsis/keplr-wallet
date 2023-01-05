export interface ColumnProps {
  weight: number;
}

export type ColumnsAlign = "left" | "right" | "center";
export type ColumnsAlignY = "top" | "bottom" | "center";

export interface ColumnsProps {
  sum: number;

  align?: ColumnsAlign;
  alignY?: ColumnsAlignY;
  gutter?: string;
}
