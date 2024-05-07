import { CSSProperties } from "react";

export interface RadioGroupProps {
  size?: "default" | "large";

  selectedKey?: string;
  items: {
    key: string;
    text: string;
  }[];
  onSelect: (key: string) => void;

  itemMinWidth?: string;

  className?: string;
  style?: CSSProperties;
}
