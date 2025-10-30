import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { MainHeaderLayout } from "../main/layouts/header";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { Gutter } from "../../components/gutter";
import { Subtitle2 } from "../../components/typography";
import { useStore } from "../../stores";
import { TokenItem } from "../main/components";
import { Dec } from "@keplr-wallet/unit";
import { TextButton } from "../../components/button-text";
import { useNavigate } from "react-router";
import { ChevronIcon } from ".";
import { FormattedMessage, useIntl } from "react-intl";
import { MainH1 } from "../../components/typography/main-h1";
import { useGetStakingApr } from "../../hooks/use-get-staking-apr";

const zeroDec = new Dec(0);

export const StakeEmptyPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  const { hugeQueriesStore, priceStore } = useStore();

  const stakableTokens = hugeQueriesStore.stakables
    .filter((token) => token.token.toDec().gt(zeroDec))
    .sort((a, b) => {
      const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
      const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

      if (aPrice.equals(bPrice)) {
        return 0;
      }
      return aPrice.gt(bPrice) ? -1 : 1;
    })
    .slice(0, 4);

  return (
    <MainHeaderLayout
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
      }}
    >
      <Box paddingX="1rem" paddingY="1.25rem">
        <Box paddingX="0.25rem">
          <MainH1
            style={{
              fontWeight: 600,
            }}
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette.white
            }
          >
            <FormattedMessage
              id="page.stake.empty.title"
              values={{
                br: <br />,
              }}
            />
          </MainH1>
        </Box>

        <Gutter size="1rem" />

        <Box paddingX="0.25rem">
          <Subtitle2 color={ColorPalette["gray-200"]}>
            {intl.formatMessage({
              id: "page.stake.empty.subtitle",
            })}
          </Subtitle2>
        </Box>

        <Gutter size="1rem" />

        {stakableTokens.map((viewToken) => {
          const isStarknet = "starknet" in viewToken.chainInfo;
          const stakingUrl = isStarknet
            ? "https://dashboard.endur.fi/stake"
            : "walletUrlForStaking" in viewToken.chainInfo
            ? viewToken.chainInfo.walletUrlForStaking
            : undefined;

          const stakingAprDec = useGetStakingApr(viewToken.chainInfo.chainId);

          return (
            <Box
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            >
              <TokenItem
                viewToken={viewToken}
                stakingApr={
                  stakingAprDec
                    ? `APR ${stakingAprDec.toString(2)}%`
                    : undefined
                }
                onClick={() => {
                  if (stakingUrl) {
                    browser.tabs.create({
                      url: stakingUrl,
                    });
                  }
                }}
              />
              <Gutter size="0.5rem" />
            </Box>
          );
        })}

        <Gutter size="1.25rem" />

        <TextButton
          text={intl.formatMessage({
            id: "page.stake.empty.link",
          })}
          color="blue"
          onClick={() => {
            navigate("/stake/explore?showBackButton=true");
          }}
          right={<ChevronIcon width="1rem" height="1rem" />}
          style={{
            margin: "-0.25rem -1rem",
          }}
        />
      </Box>
    </MainHeaderLayout>
  );
});
