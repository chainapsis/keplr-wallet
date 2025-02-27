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
import { Button } from "../../components/button";

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

  const unmountedRef = useRef(false);
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (isFromEarnTransfer) {
      setTimeout(() => {
        if (!unmountedRef.current) {
          navigate(
            isFromEarnTransfer ? `/earn/amount?isFromEarnTransfer=true` : "/",
            {
              replace: true,
            }
          );
        }
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFromEarnTransfer]);

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
        <Box paddingX="1.25rem" style={{ textAlign: "center" }}>
          <Subtitle2 color={ColorPalette["gray-200"]}>
            {intl.formatMessage(
              {
                id: isFromEarnTransfer
                  ? "page.earn.transfer.amount.tx.paragraph"
                  : "page.tx-result.success.paragraph",
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
          text={intl.formatMessage({ id: "page.tx-result.success.done" })}
          style={{
            width: "18.125rem",
          }}
        />
      </Stack>
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  height: 100vh;

  background: linear-gradient(168deg, #174045 0%, #021213 48.3%), #09090a;
`;
