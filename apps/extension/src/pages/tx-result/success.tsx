import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
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
import { NOBLE_CHAIN_ID } from "../../config.ui";

export const TxResultSuccessPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();
  const animDivRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isFromEarnTransfer = searchParams.get("isFromEarnTransfer");
  const isFromEarnDeposit = searchParams.get("isFromEarnDeposit");

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
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFromEarnTransfer]);

  const paragraph = (() => {
    if (isFromEarnDeposit) {
      return "page.tx-result.earn-deposit.success.paragraph";
    }

    if (isFromEarnTransfer) {
      return "page.earn.transfer.amount.tx.paragraph";
    }

    return "page.tx-result.success.paragraph";
  })();

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
          {intl.formatMessage({
            id: isFromEarnDeposit
              ? "page.tx-result.earn-deposit.success.title"
              : "page.tx-result.success.title",
          })}
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
                id: paragraph,
              },
              {
                br: <br />,
              }
            )}
          </Subtitle2>
        </Box>
        <Gutter size="2.25rem" />
        {!isFromEarnTransfer && (
          <Button
            size="large"
            onClick={() => {
              if (isFromEarnDeposit) {
                navigate(`/earn/overview?chainId=${NOBLE_CHAIN_ID}`, {
                  replace: true,
                });
                return;
              }
              navigate("/");
            }}
            text={intl.formatMessage({
              id: isFromEarnDeposit
                ? "page.tx-result.earn-deposit.success.go-to-earn-overview-button"
                : "page.tx-result.success.done",
            })}
            style={{
              width: "18.125rem",
            }}
          />
        )}
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
      ? "linear-gradient(168deg, #D6FAFF 0%, #FFF 53.62%)"
      : "linear-gradient(168deg, #174045 0%, #021213 48.3%), #09090a"};
`;
