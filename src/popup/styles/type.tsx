export type Size = "small" | "default" | "normal" | "medium" | "large";

export function getSizeClass(size?: Size): string {
  if (size === undefined || size === "default") {
    return "";
  }
  return "is-" + size;
}

export type Color =
  | "primary"
  | "default"
  | "link"
  | "info"
  | "success"
  | "warning"
  | "danger";

export function getColorClass(color?: Color): string {
  if (color === undefined || color === "default") {
    return "";
  }
  return "is-" + color;
}
