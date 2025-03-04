import { Currency } from "@keplr-wallet/types";
import { PricePretty, Dec } from "@keplr-wallet/unit";
import React from "react";
import { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { XAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { Button } from "../../../components/button";
import { Gutter } from "../../../components/gutter";
import { Image } from "../../../components/image";
import {
  Subtitle3,
  Subtitle4,
  H1,
  Body3,
} from "../../../components/typography";
import { useGetEarnApy } from "../../../hooks/use-get-apy";
import { useStore } from "../../../stores";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useTheme } from "styled-components";

export const EarnOverviewBalanceSection: FunctionComponent<{
  chainId: string;
  holdingCurrency: Currency;
  rewardCurrency?: Currency;
  bech32Address: string;
}> = observer(({ chainId, holdingCurrency, rewardCurrency, bech32Address }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const intl = useIntl();

  const { queriesStore, priceStore, uiConfigStore } = useStore();
  const balanceRes = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(bech32Address);

  const balance = balanceRes.balances.find(
    ({ currency }) =>
      currency.coinMinimalDenom === rewardCurrency?.coinMinimalDenom
  )?.balance;

  const price = balance
    ? priceStore.calculatePrice(balance, balance.currency.coinDenom)?.toString()
    : new PricePretty(uiConfigStore.fiatCurrency, new Dec(0)).toString();

  const { apy } = useGetEarnApy(chainId);

  const navigate = useNavigate();

  return (
    <Box paddingX="1.25rem">
      <XAxis alignY="center" gap="0.25rem">
        {rewardCurrency && (
          <Image
            src={rewardCurrency.coinImageUrl}
            width="20px"
            height="20px"
            alt={rewardCurrency.coinDenom}
          />
        )}

        <Subtitle3
          color={
            isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]
          }
        >
          {rewardCurrency?.coinDenom}
        </Subtitle3>

        <Dot />

        <Subtitle4
          color={
            isLightMode ? ColorPalette["green-600"] : ColorPalette["green-400"]
          }
        >
          APY {apy}
        </Subtitle4>
      </XAxis>
      <Gutter size="0.75rem" />

      <H1 color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}>
        {balance?.hideDenom(true).shrink(true).toString() || "0"}
      </H1>
      <Gutter size="0.5rem" />

      <Body3 color={ColorPalette["gray-300"]}>{price}</Body3>
      <Gutter size="1.25rem" />

      <XAxis gap="0.75rem">
        {rewardCurrency && (
          <Button
            text={intl.formatMessage({ id: "button.withdraw" })}
            color="secondary"
            size="medium"
            disabled={balance?.toDec().equals(new Dec(0))}
            style={{ width: "100%" }}
            onClick={() => {
              navigate(
                `/earn/withdraw/amount?chainId=${chainId}&coinMinimalDenom=${rewardCurrency.coinMinimalDenom}`
              );
            }}
          />
        )}
        <Button
          text={intl.formatMessage({ id: "button.deposit" })}
          color="secondary"
          size="medium"
          style={{ width: "100%" }}
          onClick={() => {
            navigate(
              `/earn/amount?chainId=${chainId}&coinMinimalDenom=${holdingCurrency.coinMinimalDenom}`
            );
          }}
        />
      </XAxis>
    </Box>
  );
});

const Dot: FunctionComponent = () => (
  <Box
    width="3px"
    height="3px"
    backgroundColor={ColorPalette["gray-400"]}
    style={{ borderRadius: "50%" }}
  />
);
