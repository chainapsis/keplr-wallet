import styled from "styled-components";
import React, { FunctionComponent } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { Body3, Subtitle1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";

const Styles = {
  Title: styled(Subtitle1)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette.white};
  `,
  Paragraph: styled(Body3)`
    padding: 0 1.875rem;
    text-align: center;
    color: ${ColorPalette["gray-300"]};
  `,
};

interface MainEmptyViewProps {
  image: React.ReactNode;
  title: string;
  paragraph: string;
  button: React.ReactNode;
}

export const MainEmptyView: FunctionComponent<MainEmptyViewProps> = ({
  image,
  title,
  paragraph,
  button,
}) => {
  return (
    <Box marginTop="1.25rem" marginBottom="2rem">
      <Stack alignX="center" gutter="0.75rem">
        <Box>{image}</Box>
        <Styles.Title>{title}</Styles.Title>
        <Styles.Paragraph>{paragraph}</Styles.Paragraph>

        <Gutter size="0.75rem" />
        {button}
      </Stack>
    </Box>
  );
};
