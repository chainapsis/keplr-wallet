export interface ColumnProps {
  weight: number;
}

export type ColumnsColumnAlign = "left" | "right" | "center";
export type ColumnsAlignY = "top" | "bottom" | "center";

export interface ColumnsProps {
  sum: number;

  columnAlign?: ColumnsColumnAlign;
  alignY?: ColumnsAlignY;
  gutter?: string;
}
