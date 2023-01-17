import { CSSProperties } from "react";

export interface ButtonGroupProps {
  selectedKey?: string;
  buttons: {
    key: string;
    text: string;
  }[];
  onSelect: (key: string) => void;

  buttonMinWidth?: string;

  className?: string;
  style?: CSSProperties;
}
