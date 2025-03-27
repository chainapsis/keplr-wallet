import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import lottie from "lottie-web";
import AniFailed from "../../public/assets/lottie/tx-result/failed.json";
import { Stack } from "../../components/stack";
import { Gutter } from "../../components/gutter";
import { H3, Subtitle2 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";

export const TxResultFailedPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();
  const navigate = useNavigate();
  const animDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AniFailed,
      });

      return () => {
        anim.destroy();
      };
    }
  }, []);

  return (
    <Container isLightMode={isLightMode}>
      <Stack flex={1} alignX="center">
        <Gutter size="9.75rem" />
        <div
          ref={animDivRef}
          style={{
            width: "6.5rem",
            height: "6.5rem",
            margin: "-0.75rem",
          }}
        />
        <Gutter size="1.75rem" />
        <H3 color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}>
          {intl.formatMessage({ id: "page.tx-result.failed.title" })}
        </H3>
        <Gutter size="2rem" />

        <Box paddingX="1.25rem" style={{ textAlign: "center" }}>
          <Subtitle2
            color={
              isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
            }
          >
            {intl.formatMessage(
              {
                id: "page.tx-result.failed.paragraph",
              },
              {
                br: <br />,
              }
            )}
          </Subtitle2>
        </Box>
        <Gutter size="2.25rem" />
        <Button
          size="large"
          onClick={() => navigate("/")}
          text={intl.formatMessage({ id: "page.tx-result.failed.go-to-home" })}
          style={{
            width: "18.125rem",
          }}
        />
      </Stack>
    </Container>
  );
});

const Container = styled.div<{
  isLightMode: boolean;
}>`
  display: flex;
  height: 100vh;

  background: ${({ isLightMode }) =>
    isLightMode
      ? "linear-gradient(168deg, #FFE3E3 0%, #FFF 57.63%)"
      : "linear-gradient(168deg, #381111 0%, #0c0101 44.57%)"};
`;
