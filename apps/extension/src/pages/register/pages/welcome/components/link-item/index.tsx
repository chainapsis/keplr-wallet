import React, { FunctionComponent } from "react";
import { Box } from "../../../../../../components/box";
import { ColorPalette } from "../../../../../../styles";
import { YAxis } from "../../../../../../components/axis";
import { Image } from "../../../../../../components/image";
import { Gutter } from "../../../../../../components/gutter";
import styled, { useTheme } from "styled-components";

const Styles = {
  Container: styled.div`
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
    border-radius: 1rem;

    :hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-550"]};
    }

    box-shadow: ${(props) =>
      props.theme.mode === "light"
        ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
        : "none"};

    cursor: pointer;
  `,
};

export const LinkItem: FunctionComponent<{
  title: string;
  paragraph: string;
  src?: string;
  url?: string;
}> = ({ title, paragraph, src, url }) => {
  const theme = useTheme();

  return (
    <Styles.Container
      onClick={(e) => {
        e.preventDefault();
        if (url) {
          browser.tabs.create({
            url: url,
          });
        }
      }}
    >
      <YAxis>
        <Box width="2.5rem">
          <Image width="40px" height="40px" src={src} alt="service-image" />
        </Box>

        <Gutter size="1rem" />

        <Box
          style={{
            fontWeight: 500,
            fontSize: "0.875rem",
            color:
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"],
          }}
        >
          {title}
        </Box>

        <Gutter size="0.25rem" />

        <Box
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color:
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["white"],
          }}
        >
          {paragraph}
        </Box>
      </YAxis>
    </Styles.Container>
  );
};
