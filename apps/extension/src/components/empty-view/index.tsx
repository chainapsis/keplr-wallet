import React, { FunctionComponent, PropsWithChildren } from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Subtitle3 } from "../typography";
import { FormattedMessage } from "react-intl";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    align-items: center;

    gap: 0.75rem;
  `,
  Icon: styled.div`
    width: 4.5rem;
    height: 4.5rem;
  `,
};

export const EmptyView: FunctionComponent<
  PropsWithChildren<{
    subject?: string;
    altSvg?: React.ReactElement;

    style?: React.CSSProperties;
  }>
> = ({ subject, altSvg, style, children }) => {
  const theme = useTheme();

  return (
    <Styles.Container style={style}>
      <Styles.Icon>
        {altSvg ? (
          altSvg
        ) : (
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M45 40.5H27M39.182 18.932L32.818 12.568C31.9741 11.7241 30.8295 11.25 29.636 11.25H13.5C9.77208 11.25 6.75 14.2721 6.75 18V54C6.75 57.7279 9.77208 60.75 13.5 60.75H58.5C62.2279 60.75 65.25 57.7279 65.25 54V27C65.25 23.2721 62.2279 20.25 58.5 20.25H42.364C41.1705 20.25 40.0259 19.7759 39.182 18.932Z"
              stroke={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-400"]
              }
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Styles.Icon>
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"]
        }
      >
        {subject ? (
          <FormattedMessage
            id="components.empty-view.text"
            values={{ subject }}
          />
        ) : (
          children
        )}
      </Subtitle3>
    </Styles.Container>
  );
};
