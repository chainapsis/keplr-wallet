import React, {
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MenuItemProps, MenuProps } from "./types";
import { Styles } from "./styles";
import { Body3 } from "../typography";
import { useClickOutside } from "../../hooks";

export const Menu: FunctionComponent<MenuProps> = ({
  isOpen,
  setIsOpen,
  ratio,
  children,
}) => {
  const ref = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState<number>(0);

  useClickOutside(ref, () => setIsOpen(false));

  useLayoutEffect(() => {
    setWidth(ref.current ? ref.current.offsetWidth : 0);
  }, [ref.current]);

  return (
    <Styles.Container ref={ref} isOpen={isOpen} width={width} ratio={ratio}>
      {children}
    </Styles.Container>
  );
};

export const MenuItem: FunctionComponent<MenuItemProps> = ({
  label,
  onClick,
}) => {
  return (
    <Styles.Item onClick={onClick}>
      <Body3>{label}</Body3>
    </Styles.Item>
  );
};
