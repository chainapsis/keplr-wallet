import React, { FunctionComponent, useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import { Subtitle4 } from "../../../components/typography";
import { Ecosystem } from "..";
import { useIntl } from "react-intl";
import { useGlobarSimpleBar } from "../../../hooks/global-simplebar";

interface Props {
  selected: Ecosystem;
  onSelect: (value: Ecosystem) => void;
}

export const EcosystemFilterDropdown: FunctionComponent<Props> = ({
  onSelect,
  selected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const intl = useIntl();

  const globalSimpleBar = useGlobarSimpleBar();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const scrollElement = globalSimpleBar.ref.current?.getScrollElement();

    scrollElement?.addEventListener("scroll", () => setIsOpen(false));

    return () => {
      scrollElement?.removeEventListener("scroll", () => setIsOpen(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Styles.MenuContainer>
      <Styles.MenuButton onClick={() => setIsOpen((prev) => !prev)}>
        <Subtitle4
          style={{
            color:
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"],
          }}
        >
          {intl.formatMessage({
            id: "pages.manage-chains.ecosystem-filter-dropdown.title",
          })}
        </Subtitle4>
        <Subtitle4 style={{ color: ColorPalette["blue-300"] }}>
          {selected}
        </Subtitle4>
        <ArrowDownIcon />
      </Styles.MenuButton>
      {isOpen && (
        <Styles.MenuWrapper>
          <Styles.ContextMenuContent>
            {Object.values(Ecosystem).map((item) => (
              <Styles.MenuItem
                key={item}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                selected={item === selected}
              >
                {item}
              </Styles.MenuItem>
            ))}
          </Styles.ContextMenuContent>
        </Styles.MenuWrapper>
      )}
    </Styles.MenuContainer>
  );
};

function ArrowDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="#ABABB5"
        strokeWidth="1.09091"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Styles = {
  MenuContainer: styled.div`
    position: relative;
    user-select: none;
    background-color: transparent;
  `,

  MenuWrapper: styled.div`
    width: 12.375rem;
    position: absolute;
    left: 0;
    top: calc(100% + 0.5rem);
    z-index: 9999;
    min-width: 8rem;
    overflow: visible;
    box-shadow: ${(props) =>
      props.theme.mode === "light"
        ? "0px 1px 3px 0px rgba(43, 39, 55, 0.10), 0px 5px 30px 0px rgba(43, 39, 55, 0.05), 0px 10px 50px 0px rgba(43, 39, 55, 0.05)"
        : "none"};
  `,

  ContextMenuContent: styled.div`
    border-radius: 0.5rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-500"]};
    box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
    overflow: hidden;
  `,

  MenuItem: styled.div<{ selected?: boolean }>`
    padding: 0.6875rem 1rem;
    cursor: pointer;
    background-color: rgba(37, 37, 37, 0.5);
    border-bottom: 0.03125rem solid rgba(84, 84, 88, 0.65);

    font-size: 1.0625rem;
    line-height: 1.375rem;

    color: ${(props) =>
      props.selected ? ColorPalette["blue-300"] : ColorPalette.white};

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: rgba(51, 51, 51, 0.5);
    }
  `,

  MenuButton: styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    &:hover > :nth-child(2),
    &:hover > :nth-child(3) {
      opacity: 0.7;
    }
  `,
};
