import React, { FunctionComponent, useEffect, useRef } from "react";
import { Styles } from "./styles";
import { DropdownProps } from "./types";
import { Column, Columns } from "../column";
import { ArrowDropDownIcon } from "../icon";
import { Label } from "../input";
import { Box } from "../box";

// eslint-disable-next-line react/display-name
export const Dropdown: FunctionComponent<DropdownProps> = ({
  className,
  style,
  placeholder,
  items,
  selectedItemKey,
  onSelect,
  size = "small",
  color = "default",
  label,
  menuContainerMaxHeight,
  allowSearch,
  searchExcludedKeys,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchText, setSearchText] = React.useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchText("");
    } else {
      if (allowSearch) {
        searchInputRef.current?.focus();
      }
    }
  }, [allowSearch, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (!allowSearch) {
        return true;
      }

      const trimmedSearchText = searchText.trim();
      if (trimmedSearchText.length > 0) {
        return (
          typeof item.label === "string" &&
          item.label.toLowerCase().includes(trimmedSearchText.toLowerCase()) &&
          (!searchExcludedKeys || !searchExcludedKeys.includes(item.key))
        );
      }

      return true;
    });
  }, [allowSearch, items, searchText, searchExcludedKeys]);

  return (
    <Styles.Container ref={wrapperRef}>
      {label ? <Label content={label} /> : null}
      <Styles.SelectedContainer
        className={className}
        style={style}
        placeholder={placeholder}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        color={color}
        size={size}
      >
        <Columns sum={1}>
          <Box position="relative" alignY="center">
            <Box
              position="absolute"
              style={{
                opacity: !isOpen || !allowSearch ? 0 : 1,
                pointerEvents: !isOpen || !allowSearch ? "none" : "auto",
              }}
            >
              <Styles.Text>
                <input
                  type="text"
                  ref={searchInputRef}
                  style={{
                    padding: 0,
                    borderWidth: 0,
                    background: "transparent",
                    outline: "none",
                  }}
                  value={searchText}
                  onChange={(e) => {
                    e.preventDefault();
                    setSearchText(e.target.value);
                  }}
                />
              </Styles.Text>
            </Box>
            <Styles.Text
              selectedItemKey={selectedItemKey}
              style={{
                opacity: isOpen && allowSearch ? 0 : 1,
              }}
            >
              {selectedItemKey
                ? items.find((item) => item.key === selectedItemKey)?.label ??
                  placeholder
                : placeholder}
            </Styles.Text>
          </Box>
          <Column weight={1} />
          <ArrowDropDownIcon width="1.25rem" height="1.25rem" />
        </Columns>
      </Styles.SelectedContainer>
      <Styles.MenuContainer isOpen={isOpen && filteredItems.length > 0}>
        <Styles.MenuContainerScroll
          menuContainerMaxHeight={menuContainerMaxHeight}
        >
          {filteredItems.map((item) => (
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
        </Styles.MenuContainerScroll>
      </Styles.MenuContainer>
    </Styles.Container>
  );
};
