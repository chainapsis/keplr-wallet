import React, { FunctionComponent, useState } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../styles";
import { Subtitle4 } from "../../../components/typography";
import { Ecosystem } from "..";
import { useIntl } from "react-intl";
import { ContextMenuStyles } from "../../../components/context-menu";

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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {item}
                {selected === item && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="5"
                    height="5"
                    viewBox="0 0 5 5"
                    fill="none"
                  >
                    <circle
                      cx="2.5"
                      cy="2.5"
                      r="2.5"
                      fill={ColorPalette["blue-300"]}
                    />
                  </svg>
                )}
              </div>
            </Styles.MenuItem>
          ))}
        </Styles.ContextMenuContent>
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

  ContextMenuContent: styled(ContextMenuStyles.Container)`
    width: 12.375rem;
    position: absolute;
    left: 0;
    top: calc(100% + 0.5rem);
    z-index: 9999;
    min-width: 8rem;
  `,

  MenuItem: styled(ContextMenuStyles.Item)<{ selected?: boolean }>`
    padding: 0.6875rem 1rem;
    cursor: pointer;
    border-bottom: 0.03125rem solid
      ${({ theme }) =>
        theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-400"]};

    font-size: 1.0625rem;
    line-height: 1.375rem;

    color: ${(props) =>
      props.selected
        ? ColorPalette["blue-300"]
        : props.theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette.white};

    &:last-child {
      border-bottom: none;
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
