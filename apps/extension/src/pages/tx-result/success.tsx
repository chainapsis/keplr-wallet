import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef } from "react";
import styled from "styled-components";
import lottie from "lottie-web";
import AniSuccess from "../../public/assets/lottie/tx-result/success.json";
import { Stack } from "../../components/stack";
import { Gutter } from "../../components/gutter";
import { H3, Subtitle2 } from "../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { useSearchParams, useNavigate } from "react-router-dom";

export const TxResultSuccessPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const animDivRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isFromEarnTransfer = searchParams.get("isFromEarnTransfer");

  useEffect(() => {
    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AniSuccess,
      });

      return () => {
        anim.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (isFromEarnTransfer) {
      setTimeout(() => {
        navigate(`/earn/amount`);
      }, 3000);
    }
  }, [isFromEarnTransfer, navigate]);

  return (
    <Container>
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
        <H3 color={ColorPalette["white"]}>
          {intl.formatMessage({ id: "page.tx-result.success.title" })}
        </H3>
        <Gutter size="2rem" />
        {isFromEarnTransfer && (
          <Box paddingX="1.25rem" style={{ textAlign: "center" }}>
            <Subtitle2 color={ColorPalette["gray-200"]}>
              {intl.formatMessage(
                {
                  id: "page.earn.transfer.amount.tx.paragraph",
                },
                {
                  br: <br />,
                }
              )}
            </Subtitle2>
          </Box>
        )}
      </Stack>
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  height: 100vh;

  background: linear-gradient(168deg, #174045 0%, #021213 48.3%), #09090a;
`;
