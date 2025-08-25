import React, { FunctionComponent, useMemo, useState } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Button2, Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { MsgHistory } from "../../main/token-detail/types";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import styled, { useTheme } from "styled-components";
import { CurrencyImageFallback } from "../../../components/image";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import Color from "color";
import { Bleed } from "../../../components/bleed";

export const HistoryDetailMergedClaimRewards: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

  const theme = useTheme();

  const chainInfo = chainStore.getChain(msg.chainId);

  const isNobleClaimMessage = msg.relation === "noble-claim-yield";

  const rewardsData = useMemo(() => {
    const result: { currency: AppCurrency; amount: CoinPretty }[] = [];

    const rewards = isNobleClaimMessage
      ? msg.meta["yields"]
      : msg.meta["rewards"];

    if (
      rewards &&
      Array.isArray(rewards) &&
      rewards.length > 0 &&
      typeof rewards[0] === "string"
    ) {
      const processedDenoms = new Set<string>();

      for (const coinStr of rewards) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);

          if (!processedDenoms.has(coin.denom)) {
            const currency = chainInfo.findCurrency(coin.denom);
            if (currency) {
              if (
                currency.coinMinimalDenom.startsWith("ibc/") &&
                (!("originCurrency" in currency) || !currency.originCurrency)
              ) {
                continue;
              }
              result.push({
                currency,
                amount: new CoinPretty(currency, coin.amount),
              });
              processedDenoms.add(coin.denom);
            }
          }
        }
      }
    }

    return result.sort((a, b) => {
      if (a.currency.coinMinimalDenom === targetDenom) return -1;
      if (b.currency.coinMinimalDenom === targetDenom) return 1;
      return 0;
    });
  }, [isNobleClaimMessage, chainInfo, msg.meta, targetDenom]);

  const needCollapse = rewardsData.length > 1;
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Box>
      <YAxis alignX="center">
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-650"]
          }
          style={{
            boxShadow:
              theme.mode === "light"
                ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
                : undefined,
          }}
        >
          {rewardsData.length > 0 ? (
            <RewardItem
              key={rewardsData[0].currency.coinMinimalDenom}
              index={0}
              currency={rewardsData[0].currency}
              amount={rewardsData[0].amount}
              chainInfo={chainInfo}
            />
          ) : null}
          {needCollapse
            ? (() => {
                return (
                  <VerticalCollapseTransition collapsed={isCollapsed}>
                    {rewardsData.slice(1).map((reward, index) => {
                      index = index + 1;
                      return (
                        <RewardItem
                          key={reward.currency.coinMinimalDenom}
                          index={index}
                          currency={reward.currency}
                          amount={reward.amount}
                          chainInfo={chainInfo}
                        />
                      );
                    })}
                  </VerticalCollapseTransition>
                );
              })()
            : null}
          {needCollapse ? (
            <Bleed bottom="1rem" horizontal="1rem">
              <Styles.ExpandButton
                onClick={(e) => {
                  e.preventDefault();

                  setIsCollapsed(!isCollapsed);
                }}
              >
                <XAxis alignY="center">
                  <Button2>{isCollapsed ? "Expand" : "Collapse"}</Button2>
                  <Gutter size="0.25rem" />
                  {isCollapsed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      fill="none"
                      viewBox="0 0 17 17"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.5 6l-5 5-5-5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="17"
                      fill="none"
                      viewBox="0 0 16 17"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.667"
                        d="M3 11l5-5 5 5"
                      />
                    </svg>
                  )}
                </XAxis>
              </Styles.ExpandButton>
            </Bleed>
          ) : null}
        </Box>
      </YAxis>
    </Box>
  );
});

const RewardItem: FunctionComponent<{
  index: number;
  currency: AppCurrency;
  amount: CoinPretty;
  chainInfo: ChainInfo;
}> = observer(({ currency, amount, chainInfo }) => {
  const { priceStore } = useStore();

  const theme = useTheme();

  const price = (() => {
    if (!currency.coinGeckoId) {
      return;
    }

    return priceStore.calculatePrice(amount);
  })();

  return (
    <Box width="100%" paddingBottom="1rem">
      <XAxis alignY="center">
        <CurrencyImageFallback
          size="2rem"
          chainInfo={chainInfo}
          currency={currency}
        />
        <Gutter size="0.5rem" />
        <Subtitle4
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["gray-50"]
          }
        >
          {(() => {
            if ("originCurrency" in currency && currency.originCurrency) {
              return currency.originCurrency.coinDenom;
            }
            return currency.coinDenom;
          })()}
        </Subtitle4>
        <div style={{ flex: 1 }} />
        <YAxis alignX="right">
          <Subtitle3 color={ColorPalette["green-400"]}>
            {`+${amount
              .maxDecimals(3)
              .shrink(true)
              .hideIBCMetadata(true)
              .inequalitySymbol(true)
              .inequalitySymbolSeparator("")
              .toString()}`}
          </Subtitle3>
          {price != null ? (
            <Subtitle3 color={ColorPalette["gray-300"]}>
              {price.toString()}
            </Subtitle3>
          ) : null}
        </YAxis>
      </XAxis>
    </Box>
  );
});

export const HistoryDetailMergedClaimRewardsIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        stroke={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
        d="m14.31 13.728 4.33-8.72a1.518 1.518 0 0 1 2.716 0l4.33 8.72 9.68 1.406a1.504 1.504 0 0 1 .839 2.57L29.2 24.489l1.654 9.583c.211 1.23-1.089 2.167-2.2 1.587l-8.657-4.527-8.658 4.527c-1.11.581-2.41-.357-2.199-1.589l1.654-9.583-7.004-6.783a1.504 1.504 0 0 1 .839-2.567z"
      />
    </svg>
  );
};

const Styles = {
  ExpandButton: styled(Box)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 2.125rem;

    cursor: pointer;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};

    :hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-300"]
          : ColorPalette["gray-300"]};
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-10"]
          : Color(ColorPalette["gray-500"]).alpha(0.5).toString()};
    }

    :active {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-300"]
          : ColorPalette["gray-300"]};
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-500"]};
    }
  `,
};
