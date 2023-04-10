import { CSSProperties } from "react";

export interface DropdownItemProps {
  key: string;
  label: string;
}

export interface DropdownProps {
  items: DropdownItemProps[];
  selectedItemKey: string;
  onSelect: (key: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  size?: "small" | "large";
}
