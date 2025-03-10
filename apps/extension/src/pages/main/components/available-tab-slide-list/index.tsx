import { useNavigate } from "react-router";
import { FullHorizontalSlider } from "../../../../components/full-horizontal-silder";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import {
  PercentageIcon,
  ArrowTopRightOnSquareIcon,
} from "../../../../components/icon";
import { ColorPalette } from "../../../../styles";
import { StakeWithKeplrDashboardButton } from "../stake-with-keplr-dashboard-button";
import { useStore } from "../../../../stores";
import { useGetEarnApy } from "../../../../hooks/use-get-apy";
import { observer } from "mobx-react-lite";
import { NOBLE_CHAIN_ID } from "../../../../config.ui";
import { Dec } from "@keplr-wallet/unit";
import { useTheme } from "styled-components";

export const AvailableTabSlideList = observer(() => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { analyticsStore, hugeQueriesStore } = useStore();
  const { apy } = useGetEarnApy(NOBLE_CHAIN_ID);

  const usdcToken = hugeQueriesStore.allKnownBalances.find(
    (balance) => balance.token.currency.coinMinimalDenom === "uusdc"
  )?.token;
  const usdnToken = hugeQueriesStore.allKnownBalances.find(
    (balance) => balance.token.currency.coinMinimalDenom === "uusdn"
  )?.token;

  const EarnButton = (
    <StakeWithKeplrDashboardButton
      key="earn-apy-with-usdc"
      type="button"
      onClick={(e) => {
        e.preventDefault();
        if (usdnToken?.toDec().gt(new Dec(0))) {
          navigate(`/earn/overview?chainId=${NOBLE_CHAIN_ID}`);
        } else {
          navigate(`/earn/intro?chainId=${NOBLE_CHAIN_ID}`);
        }
      }}
    >
      <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
        <PercentageIcon
          width="0.5rem"
          height="0.5rem"
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette.white
          }
        />
      </Box>
      <Gutter size="0.5rem" />
      <FormattedMessage
        id="page.main.chart.earn-apy-button"
        values={{
          apy,
          tokenName: usdcToken?.currency.coinDenom,
        }}
      />
    </StakeWithKeplrDashboardButton>
  );

  const DashboardButton = (
    <StakeWithKeplrDashboardButton
      key="stake-with-keplr-dashboard"
      type="button"
      onClick={(e) => {
        e.preventDefault();
        analyticsStore.logEvent("click_keplrDashboard", {
          tabName: "available",
        });

        browser.tabs.create({
          url: "https://wallet.keplr.app/?utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_portfolio",
        });
      }}
    >
      <FormattedMessage id="page.main.chart.manage-portfolio-in-keplr-dashboard" />
      <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
        <ArrowTopRightOnSquareIcon width="1rem" height="1rem" />
      </Box>
    </StakeWithKeplrDashboardButton>
  );

  return (
    <FullHorizontalSlider
      Buttons={usdcToken ? [EarnButton, DashboardButton] : [DashboardButton]}
    />
  );
});
