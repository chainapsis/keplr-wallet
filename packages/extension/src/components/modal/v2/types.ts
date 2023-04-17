export interface ModalProps {
  isOpen: boolean;
  close: () => void;

  alignY: "center" | "bottom";
}
