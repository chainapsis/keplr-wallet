export type Size =
  | "xsmall"
  | "small"
  | "default"
  | "large"
  | "large"
  | "xlarge";

export function getSizeClass(size?: Size): string {
  if (size === undefined || size === "default") {
    return "";
  }
  return size;
}

export type Color =
  | "primary"
  | "secondary"
  | "link"
  | "success"
  | "warning"
  | "error";

export function getColorClass(color?: Color): string {
  if (color === undefined || color === "secondary") {
    return "";
  }
  return color;
}
