import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { MsgHistory } from "../../main/token-detail/types";
import { HistoryDetailSendBaseUIUpper } from "./send";
import { YAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";

export const HistoryDetailIBCSwapSkip: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

  const modularChainInfoImpl = chainStore.getModularChainInfoImpl(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = modularChainInfoImpl.forceFindCurrency(targetDenom);

    const from = msg.meta["from"];
    if (
      from &&
      Array.isArray(from) &&
      from.length > 0 &&
      typeof from[0] === "string"
    ) {
      for (const coinStr of from) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [modularChainInfoImpl, msg.meta, targetDenom]);

  const fromAddress = (() => {
    return (msg.msg as any)["sender"];
  })();

  const shortenedFromAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(fromAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [fromAddress]);

  return (
    <Box>
      <YAxis alignX="center">
        <HistoryDetailSendBaseUIUpper
          fromAddress={fromAddress}
          shortenedFromAddress={shortenedFromAddress}
          fromText={chainStore.getChain(msg.chainId).chainName}
          fromAmount={sendAmountPretty}
        />
      </YAxis>
    </Box>
  );
});

export const HistoryDetailIBCSwapSkipIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41"
      height="41"
      fill="none"
      viewBox="0 0 41 41"
    >
      <path
        stroke={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.53"
        d="m12.65 35.42-7.59-7.59m0 0 7.59-7.59m-7.59 7.59h22.77m0-22.77 7.59 7.59m0 0-7.59 7.59m7.59-7.59H12.65"
      />
    </svg>
  );
};
