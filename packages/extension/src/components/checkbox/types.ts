export interface CheckBoxProps {
  size?: "small" | "large";
  checked: boolean;
  onChange: (checked: boolean) => void;

  disabled?: boolean;
}
