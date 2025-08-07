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

export const HistoryDetailIBCSwapSkip: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

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
  }, [chainInfo, msg.meta, targetDenom]);

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
