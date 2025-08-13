import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
import { MsgHistory } from "../../main/token-detail/types";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { AppCurrency } from "@keplr-wallet/types";

export const HistoryDetailMergedClaimRewards: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

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

  if (rewardsData.length === 0) {
    return null;
  }

  return (
    <Box>
      <YAxis alignX="center">
        {rewardsData.map((reward, index) => (
          <React.Fragment key={reward.currency.coinMinimalDenom}>
            {index > 0 && <Gutter size="0.5rem" />}
            <RewardItem
              currency={reward.currency}
              amount={reward.amount}
              isMainReward={reward.currency.coinMinimalDenom === targetDenom}
            />
          </React.Fragment>
        ))}
      </YAxis>
    </Box>
  );
});

const RewardItem: FunctionComponent<{
  currency: AppCurrency;
  amount: CoinPretty;
  isMainReward: boolean;
}> = ({ currency, amount, isMainReward }) => {
  const currencySymbol = (() => {
    if ("originCurrency" in currency && currency.originCurrency) {
      return currency.originCurrency.coinDenom;
    }
    return currency.coinDenom;
  })();

  return (
    <Box
      width="100%"
      padding="1rem"
      borderRadius="0.375rem"
      backgroundColor={
        isMainReward ? ColorPalette["gray-650"] : ColorPalette["gray-700"]
      }
    >
      <XAxis alignY="center">
        <YAxis>
          <Box
            backgroundColor={ColorPalette["gray-550"]}
            borderRadius="999px"
            paddingX="0.5rem"
            paddingY="0.25rem"
          >
            <Subtitle3 color={ColorPalette["white"]}>
              {currencySymbol}
            </Subtitle3>
          </Box>
          <Gutter size="0.25rem" />
          <Subtitle4 color={ColorPalette["gray-300"]}>Reward</Subtitle4>
        </YAxis>
        <div style={{ flex: 1 }} />
        <Subtitle3 color={ColorPalette["green-400"]}>
          {`+ ${amount
            .maxDecimals(3)
            .shrink(true)
            .hideIBCMetadata(true)
            .inequalitySymbol(true)
            .inequalitySymbolSeparator(" ")
            .toString()}`}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};

export const HistoryDetailMergedClaimRewardsIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        stroke={ColorPalette["gray-200"]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
        d="m14.31 13.728 4.33-8.72a1.518 1.518 0 0 1 2.716 0l4.33 8.72 9.68 1.406a1.504 1.504 0 0 1 .839 2.57L29.2 24.489l1.654 9.583c.211 1.23-1.089 2.167-2.2 1.587l-8.657-4.527-8.658 4.527c-1.11.581-2.41-.357-2.199-1.589l1.654-9.583-7.004-6.783a1.504 1.504 0 0 1 .839-2.567z"
      />
    </svg>
  );
};
