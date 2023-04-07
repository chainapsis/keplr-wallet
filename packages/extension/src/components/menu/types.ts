export interface MenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ratio?: number;
}

export interface MenuItemProps {
  label: string;
  onClick: () => void;
}
