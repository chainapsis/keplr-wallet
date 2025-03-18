import { useNavigate } from "react-router";
import React, { Fragment } from "react";
import { useStore } from "../../../../stores";
import { observer } from "mobx-react-lite";
import { NOBLE_CHAIN_ID } from "../../../../config.ui";
import { Dec } from "@keplr-wallet/unit";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { FormattedMessage, useIntl } from "react-intl";
import { Button2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import {
  ArrowTopRightOnSquareIcon,
  GraphRisingIcon,
  PercentageIcon,
} from "../../../../components/icon";
import { validateIsUsdcFromNoble } from "../../../earn/utils";
import { StakeWithKeplrDashboardButton } from "../stake-with-keplr-dashboard-button";

export const AvailableTabLinkButtonList = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();
  const theme = useTheme();

  const { analyticsStore, hugeQueriesStore } = useStore();

  const usdcToken = hugeQueriesStore.allKnownBalances.find((balance) =>
    validateIsUsdcFromNoble(balance.token.currency, balance.chainInfo.chainId)
  )?.token;
  const usdnToken = hugeQueriesStore.allKnownBalances.find(
    (balance) => balance.token.currency.coinMinimalDenom === "uusdn"
  )?.token;

  if (!usdcToken || usdcToken?.toDec().isZero()) {
    return (
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
  }

  const buttons = [
    {
      label: intl.formatMessage({ id: "page.main.chart.earn-button" }),
      Icon: ({ color }: { color: string }) => (
        <PercentageIcon width="0.75rem" height="0.75rem" color={color} />
      ),
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (usdnToken?.toDec().gt(new Dec(0))) {
          navigate(`/earn/overview?chainId=${NOBLE_CHAIN_ID}`);
        } else {
          navigate(`/earn/intro?chainId=${NOBLE_CHAIN_ID}`);
        }
      },
    },
    {
      label: intl.formatMessage({ id: "page.main.chart.dashboard-button" }),
      Icon: ({ color }: { color: string }) => (
        <Box width="1rem" height="1rem" alignX="center" alignY="center">
          <GraphRisingIcon color={color} />
        </Box>
      ),
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        analyticsStore.logEvent("click_keplrDashboard", {
          tabName: "available",
        });
        browser.tabs.create({
          url: "https://wallet.keplr.app/?utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_portfolio",
        });
      },
    },
  ];

  return (
    <Box marginTop="-0.5rem" marginBottom="0.25rem" width="100%">
      <XAxis alignY="center">
        {buttons.map((button, index) => (
          <Fragment key={button.label}>
            {index > 0 && (
              <Box
                width="1px"
                height="20px"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-550"]
                }
              />
            )}
            <Box
              alignY="center"
              alignX="center"
              onClick={button.onClick}
              cursor="pointer"
              height="49px"
              width="50%"
            >
              <XAxis alignY="center" gap="0.5rem">
                <button.Icon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["green-400"]
                      : ColorPalette["green-500"]
                  }
                />
                <Button2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                >
                  {button.label}
                </Button2>
              </XAxis>
            </Box>
          </Fragment>
        ))}
      </XAxis>
    </Box>
  );
});
