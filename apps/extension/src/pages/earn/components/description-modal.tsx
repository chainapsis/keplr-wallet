import { observer } from "mobx-react-lite";
import React, { FunctionComponent, ReactElement } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { useTheme } from "styled-components";
import { XAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { InformationPlainIcon } from "../../../components/icon";
import { H4, Body2 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Stack } from "../../../components/stack";

export const DescriptionModal: FunctionComponent<{
  close: () => void;
  title: string;
  paragraphs: (string | ReactElement)[];
}> = observer(({ close, title, paragraphs }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";
  const intl = useIntl();

  return (
    <Styles.Container>
      <Box paddingX="0.25rem" paddingY="0.5rem" marginBottom="0.75rem">
        <XAxis alignY="center">
          <InformationPlainIcon
            width="1.25rem"
            height="1.25rem"
            color={ColorPalette["gray-300"]}
          />
          <Gutter size="0.5rem" />
          <H4
            color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
          >
            <FormattedMessage id={title} />
          </H4>
        </XAxis>
      </Box>

      <Box paddingX="0.5rem" marginBottom="1.25rem">
        <Stack gutter="0.75rem">
          {paragraphs.map((paragraph) => (
            <Body2
              key={typeof paragraph === "string" ? paragraph : paragraph.key}
              color={
                isLightMode
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-200"]
              }
            >
              {paragraph}
            </Body2>
          ))}
        </Stack>
      </Box>

      <Button
        size="large"
        color="primary"
        text={intl.formatMessage({
          id: "page.earn.intro.learn-more-modal.got-it-button",
        })}
        onClick={close}
      />
    </Styles.Container>
  );
});

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};
