export interface DialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  paragraph?: string;
  onClickCancel?: () => void;
  onClickYes?: () => void;
}
