import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import lottie from "lottie-web";
import AniPending from "../../public/assets/lottie/tx-result/pending.json";
import { Stack } from "../../components/stack";
import { Gutter } from "../../components/gutter";
import { H3, Subtitle2 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { useSearchParams } from "react-router-dom";

export const TxResultPendingPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();
  const animDivRef = useRef<HTMLDivElement | null>(null);

  const [searchParams] = useSearchParams();
  const isFromEarnTransfer = searchParams.get("isFromEarnTransfer");

  useEffect(() => {
    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AniPending,
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
        <Box
          width="5rem"
          height="5rem"
          borderRadius="50%"
          borderWidth="5.246px"
          borderColor={
            isLightMode ? ColorPalette["blue-400"] : ColorPalette["blue-300"]
          }
          position="relative"
        >
          <div
            ref={animDivRef}
            style={{
              position: "absolute",
              top: "-1.125rem",
              left: "-1.125rem",
              width: "6.5rem",
              height: "6.5rem",
            }}
          />
        </Box>
        <Gutter size="1.75rem" />
        <H3 color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}>
          {intl.formatMessage({ id: "page.tx-result.pending.title" })}
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
                id: isFromEarnTransfer
                  ? "page.earn.transfer.amount.tx.paragraph"
                  : "page.tx-result.pending.paragraph",
              },
              {
                br: <br />,
              }
            )}
          </Subtitle2>
        </Box>
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
      ? "linear-gradient(168deg, #CBDFFF 0%, #FFF 57.49%)"
      : "linear-gradient(168deg, #2b4267 0%, #030e21 45.81%), #09090a"};
`;
