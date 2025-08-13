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
