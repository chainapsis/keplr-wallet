import styled, { useTheme } from "styled-components";
import React, { FunctionComponent } from "react";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { Body3, Subtitle1 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { useIntl } from "react-intl";

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

  ButtonDiv: styled.div`
    display: flex;
    gap: 0.75rem;
    width: 100%;
  `,
};

interface MainEmptyViewProps {
  buttons: React.ReactNode[];
}

export const MainEmptyView: FunctionComponent<MainEmptyViewProps> = ({
  buttons,
}) => {
  const theme = useTheme();
  const intl = useIntl();

  return (
    <Box marginBottom="2rem" paddingX="0.625rem">
      <Stack alignX="center" gutter="0.75rem">
        <Box>
          <img
            src={require(theme.mode === "light"
              ? "../../../../public/assets/img/main-empty-balance-light.png"
              : "../../../../public/assets/img/main-empty-balance.png")}
            style={{
              width: "6.25rem",
              height: "6.25rem",
            }}
            alt="empty balance image"
          />
        </Box>
        <Styles.Title>
          {intl.formatMessage({
            id: "page.main.spendable.empty-view-title",
          })}
        </Styles.Title>
        <Styles.Paragraph>
          {intl.formatMessage({
            id: "page.main.spendable.empty-view-paragraph",
          })}
        </Styles.Paragraph>

        <Gutter size="1rem" />
        <Styles.ButtonDiv>
          {buttons.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </Styles.ButtonDiv>
      </Stack>
    </Box>
  );
};
