export interface ToggleProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  disabled?: boolean;
  size?: "large" | "small" | "extra-small";
}
