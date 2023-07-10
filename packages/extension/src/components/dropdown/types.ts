import React, { CSSProperties } from "react";

export interface DropdownItemProps {
  key: string;
  label: string | React.ReactNode;
}

export interface DropdownProps {
  items: DropdownItemProps[];
  selectedItemKey?: string;
  onSelect: (key: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  size?: "small" | "large";
  label?: string;
  menuContainerMaxHeight?: string;

  allowSearch?: boolean;
}
