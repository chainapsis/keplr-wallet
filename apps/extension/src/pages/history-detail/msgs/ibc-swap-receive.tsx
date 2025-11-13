import React, { FunctionComponent, useMemo } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { MsgHistory } from "../../main/token-detail/types";
import { HistoryDetailSendBaseUILower } from "./send";
import { YAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { isValidCoinStr, parseCoinStr } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer";

export const HistoryDetailIBCSwapSkipReceive: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg, targetDenom }) => {
  const { chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainStore
      .getModularChainInfoImpl(msg.chainId)
      .forceFindCurrency(targetDenom);

    const receives = msg.meta["receives"] as string[];
    for (const receive of receives) {
      if (isValidCoinStr(receive)) {
        const coin = parseCoinStr(receive);
        if (coin.denom === targetDenom) {
          return new CoinPretty(currency, coin.amount);
        }
      }
    }

    return new CoinPretty(currency, "0");
  }, [chainStore, msg.chainId, msg.meta, targetDenom]);

  const toAddress = (() => {
    if (!msg.search) {
      return "Unknown";
    }

    if (chainStore.isEvmOnlyChain(msg.chainId)) {
      return "0x" + msg.search;
    }

    if (
      !("cosmos" in modularChainInfo) ||
      !modularChainInfo.cosmos.bech32Config?.bech32PrefixAccAddr
    ) {
      return "Unknown";
    }

    return new Bech32Address(
      new Uint8Array(Buffer.from(msg.search, "hex"))
    ).toBech32(modularChainInfo.cosmos.bech32Config.bech32PrefixAccAddr);
  })();

  const shortenedToAddress = useMemo(() => {
    try {
      return Bech32Address.shortenAddress(toAddress, 18);
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  }, [toAddress]);

  return (
    <Box>
      <YAxis alignX="center">
        <HistoryDetailSendBaseUILower
          toAddress={toAddress}
          shortenedToAddress={shortenedToAddress}
          toText={modularChainInfo.chainName}
          toAmount={sendAmountPretty}
        />
      </YAxis>
    </Box>
  );
});
