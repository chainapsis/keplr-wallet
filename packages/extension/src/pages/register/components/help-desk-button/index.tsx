import React, { FunctionComponent } from "react";
import { Columns } from "../../../../components/column";
import { H2, Subtitle1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import styled from "styled-components";
import { HelpDeskUrl } from "../../../../config.ui";
import { FormattedMessage } from "react-intl";

const Container = styled.div`
  position: fixed;
  top: 2.75rem;
  right: 3.25rem;
  z-index: 1000;
`;

const Styles = {
  Title: styled(Subtitle1)`
    color: ${ColorPalette["gray-300"]};

    ${Container}:hover & {
      color: ${ColorPalette["gray-200"]};
    }
  `,
  QuestionBox: styled(Box)`
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-500"]};

    ${Container}:hover & {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-400"]};
    }
  `,
  QuestionText: styled(H2)`
    color: ${ColorPalette["gray-300"]};

    ${Container}:hover & {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-100"]};
    }
  `,
};

export const HelpDeskButton: FunctionComponent = () => {
  return (
    <a href={HelpDeskUrl} target="_blank" rel="noreferrer">
      <Container>
        <Columns sum={1} gutter="0.5rem" alignY="center">
          <Styles.Title>
            <FormattedMessage id="pages.register.components.help-desk-button.title" />
          </Styles.Title>
          <Styles.QuestionBox
            width="2.375rem"
            height="2.375rem"
            borderRadius="50%"
            alignX="center"
            alignY="center"
          >
            <Styles.QuestionText>
              <FormattedMessage id="pages.register.components.help-desk-button.question" />
            </Styles.QuestionText>
          </Styles.QuestionBox>
        </Columns>
      </Container>
    </a>
  );
};
