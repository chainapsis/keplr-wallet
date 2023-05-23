export type CheckBoxSize = "extra-small" | "small" | "large";

export interface CheckBoxProps {
  size?: CheckBoxSize;
  checked: boolean;
  onChange: (checked: boolean) => void;

  disabled?: boolean;
}
