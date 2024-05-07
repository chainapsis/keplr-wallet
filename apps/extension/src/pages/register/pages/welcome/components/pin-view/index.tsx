import React, { FunctionComponent } from "react";
import { Box } from "../../../../../../components/box";
import { ColorPalette } from "../../../../../../styles";
import { Columns } from "../../../../../../components/column";
import { PinIcon } from "../pin-icon";
import { Stack } from "../../../../../../components/stack";
import styled, { useTheme } from "styled-components";
import { PuzzleIcon } from "../puzzle-icon";
import { Gutter } from "../../../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";

const Styles = {
  Title: styled.div`
    font-weight: 600;
    font-size: 1rem;
  `,
  Paragraph: styled.div`
    font-weight: 500;
    font-size: 0.875rem;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-200"]};
  `,
};

export const PinView: FunctionComponent = () => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box
      position="absolute"
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-500"]
      }
      borderRadius="1.5rem"
      padding="1.5rem 1rem"
      style={{
        top: "1.25rem",
        right: "1.25rem",
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      <Columns sum={1} alignY="top" gutter="1rem">
        <Box
          backgroundColor={ColorPalette["blue-400"]}
          borderRadius="50%"
          padding="0.375rem"
        >
          <PinIcon color={ColorPalette.white} />
        </Box>

        <Stack gutter="0.25rem">
          <Styles.Title>
            <FormattedMessage id="pages.register.pages.welcome.pin-view.title" />
          </Styles.Title>

          <Gutter size="0.25rem" />

          <Columns sum={1} alignY="center" gutter="0.25rem">
            {intl.formatMessage(
              {
                id: "pages.register.pages.welcome.pin-view.paragraph-1",
              },
              {
                p: (...chunks: any) => (
                  <Styles.Paragraph>{chunks}</Styles.Paragraph>
                ),
                icon: (
                  <PuzzleIcon
                    size="1rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette.white
                    }
                  />
                ),
              }
            )}
          </Columns>

          <Columns sum={1} alignY="center" gutter="0.25rem">
            {intl.formatMessage(
              {
                id: "pages.register.pages.welcome.pin-view.paragraph-2",
              },
              {
                p: (...chunks: any) => (
                  <Styles.Paragraph>{chunks}</Styles.Paragraph>
                ),
                icon: (
                  <PinIcon
                    size="1rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette.white
                    }
                  />
                ),
              }
            )}
          </Columns>
        </Stack>
      </Columns>
    </Box>
  );
};
