import React, { FunctionComponent, useRef } from "react";
import { Styles } from "./styles";
import { DropdownProps } from "./types";
import { Column, Columns } from "../column";
import { ArrowDropDownIcon } from "../icon";
import { useClickOutside } from "../../hooks";

// eslint-disable-next-line react/display-name
export const DropDown: FunctionComponent<DropdownProps> = ({
  className,
  style,
  placeholder,
  items,
  selectedItemKey,
  onSelect,
  size = "small",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Styles.Container ref={wrapperRef}>
      <Styles.SelectedContainer
        className={className}
        style={style}
        placeholder={placeholder}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        size={size}
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
