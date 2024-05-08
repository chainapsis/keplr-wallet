import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { ColorPalette } from "../../../../styles";
import styled, { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import Color from "color";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body3, Button2, Subtitle3 } from "../../../../components/typography";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { AppCurrency } from "@keplr-wallet/types";

export const MsgRelationMergedClaimRewards: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({ msg, prices, targetDenom, isInAllActivitiesPage }) => {
  const { chainStore } = useStore();
  const theme = useTheme();

  const chainInfo = chainStore.getChain(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const rewards = msg.meta["rewards"];
    if (
      rewards &&
      Array.isArray(rewards) &&
      rewards.length > 0 &&
      typeof rewards[0] === "string"
    ) {
      for (const coinStr of rewards) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainInfo, msg.meta, targetDenom]);

  const otherKnownCurrencies = (() => {
    const res: AppCurrency[] = [];
    if (msg.denoms) {
      for (const denom of msg.denoms) {
        if (denom !== targetDenom) {
          const currency = chainInfo.findCurrency(denom);
          if (currency) {
            if (
              currency.coinMinimalDenom.startsWith("ibc/") &&
              (!("originCurrency" in currency) || !currency.originCurrency)
            ) {
              continue;
            }
            res.push(currency);
          }
        }
      }
    }
    return res;
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              stroke="none"
              viewBox="0 0 32 32"
            >
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["green-400"]
                    : ColorPalette["green-400"]
                }
                d="M25.08 12.14L13.8 23.42 7 16.62l2.24-2.24 4.56 4.56 9.04-9.04 2.24 2.24z"
              />
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Claim Reward"
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: "green",
        prefix: "plus",
      }}
      bottom={(() => {
        if (isInAllActivitiesPage) {
          if (msg.code === 0 && otherKnownCurrencies.length > 0) {
            return (
              <BottomExpandableOtherRewarsOnAllActivitiesPage
                msg={msg}
                prices={prices}
                currencies={otherKnownCurrencies}
              />
            );
          }
        }
      })()}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

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

const BottomExpandableOtherRewarsOnAllActivitiesPage: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  currencies: AppCurrency[];
}> = observer(({ msg, prices, currencies }) => {
  const { priceStore } = useStore();

  const theme = useTheme();

  const defaultVsCurrency = priceStore.defaultVsCurrency;

  const [isCollapsed, setIsCollapsed] = React.useState(true);

  return (
    <React.Fragment>
      <VerticalCollapseTransition collapsed={isCollapsed}>
        {currencies.map((currency) => {
          const amountPretty = (() => {
            const rewards = msg.meta["rewards"];
            if (
              rewards &&
              Array.isArray(rewards) &&
              rewards.length > 0 &&
              typeof rewards[0] === "string"
            ) {
              for (const coinStr of rewards) {
                if (isValidCoinStr(coinStr as string)) {
                  const coin = parseCoinStr(coinStr as string);
                  if (coin.denom === currency.coinMinimalDenom) {
                    return new CoinPretty(currency, coin.amount);
                  }
                }
              }
            }

            return new CoinPretty(currency, "0");
          })();

          const sendAmountPricePretty = (() => {
            if (currency && currency.coinGeckoId) {
              const price = (prices || {})[currency.coinGeckoId];
              if (price != null && price[defaultVsCurrency] != null) {
                const dec = amountPretty.toDec();
                const priceDec = new Dec(price[defaultVsCurrency]!.toString());
                const fiatCurrency =
                  priceStore.getFiatCurrency(defaultVsCurrency);
                if (fiatCurrency) {
                  return new PricePretty(fiatCurrency, dec.mul(priceDec));
                }
              }
            }
            return;
          })();

          return (
            <Box
              key={currency.coinMinimalDenom}
              paddingX="1rem"
              paddingY="0.875rem"
              alignY="center"
              minHeight="4rem"
            >
              <XAxis alignY="center">
                <Box marginRight="0.75rem">
                  <XAxis alignY="center">
                    <ItemLogo
                      backgroundColor={ColorPalette["green-400"]}
                      center={
                        <svg
                          style={{
                            marginTop: "0.2rem",
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="15"
                          fill="none"
                          viewBox="0 0 19 15"
                        >
                          <path
                            fill={
                              theme.mode === "light"
                                ? ColorPalette["white"]
                                : ColorPalette["gray-600"]
                            }
                            d="M18.08 3.14L6.8 14.42 0 7.62l2.24-2.24L6.8 9.94 15.84.9l2.24 2.24z"
                          />
                        </svg>
                      }
                    />
                  </XAxis>
                </Box>
                <div
                  style={{
                    flex: 1,
                    minWidth: "0.75rem",
                  }}
                >
                  <XAxis alignY="center">
                    <Box style={{ overflow: "hidden" }}>
                      <YAxis>
                        <Subtitle3
                          color={
                            theme.mode === "light"
                              ? ColorPalette["black"]
                              : ColorPalette["gray-10"]
                          }
                        >
                          Claim Reward
                        </Subtitle3>
                      </YAxis>
                    </Box>

                    <div
                      style={{
                        flex: 1,
                      }}
                    />
                    <YAxis alignX="right">
                      {(() => {
                        return (
                          <React.Fragment>
                            <Subtitle3
                              color={
                                theme.mode === "light"
                                  ? ColorPalette["green-500"]
                                  : ColorPalette["green-400"]
                              }
                              style={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              +
                              {amountPretty
                                .maxDecimals(2)
                                .shrink(true)
                                .hideIBCMetadata(true)
                                .inequalitySymbol(true)
                                .inequalitySymbolSeparator("")
                                .toString()}
                            </Subtitle3>
                            {sendAmountPricePretty ? (
                              <React.Fragment>
                                <Gutter size="0.25rem" />
                                <Body3
                                  color={ColorPalette["gray-300"]}
                                  style={{
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {sendAmountPricePretty.toString()}
                                </Body3>
                              </React.Fragment>
                            ) : null}
                          </React.Fragment>
                        );
                      })()}
                    </YAxis>
                  </XAxis>
                </div>
              </XAxis>
            </Box>
          );
        })}
      </VerticalCollapseTransition>
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
    </React.Fragment>
  );
});
