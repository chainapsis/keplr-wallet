import React, { FunctionComponent, useEffect, useRef } from "react";
import { Styles } from "./styles";
import { DropdownProps } from "./types";
import { Column, Columns } from "../column";
import { ArrowDropDownIcon } from "../icon";

// eslint-disable-next-line react/display-name
export const DropDown: FunctionComponent<DropdownProps> = ({
  className,
  style,
  placeholder,
  items,
  selectedItemKey,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const wrapperRef = useRef<HTMLInputElement>(null);
  useOutsideAlerter(wrapperRef, setIsOpen);

  return (
    <Styles.Container ref={wrapperRef}>
      <Styles.SelectedContainer
        className={className}
        style={style}
        placeholder={placeholder}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Columns sum={1}>
          <Styles.Text selectedItemKey={selectedItemKey}>
            {selectedItemKey
              ? items.find((item) => item.key === selectedItemKey)?.label ??
                placeholder
              : placeholder}
          </Styles.Text>
          <Column weight={1} />
          <ArrowDropDownIcon width="1.25rem" height="1.25rem" />
        </Columns>
      </Styles.SelectedContainer>
      <Styles.MenuContainer isOpen={isOpen}>
        {items.map((item) => (
          <Styles.MenuItem
            key={item.key}
            onClick={() => {
              onSelect(item.key);
              setIsOpen(false);
            }}
          >
            {item.label}
          </Styles.MenuItem>
        ))}
      </Styles.MenuContainer>
    </Styles.Container>
  );
};

function useOutsideAlerter(
  ref: React.RefObject<HTMLInputElement>,
  setIsOpen: (isOpen: boolean) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
