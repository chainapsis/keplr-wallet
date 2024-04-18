import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { Buffer } from "buffer/";

export const MsgRelationIBCSend: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const { chainStore } = useStore();

  const chainInfo = chainStore.getChain(msg.chainId);

  const sendAmountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const token = (msg.msg as any)["token"] as {
      denom: string;
      amount: string;
    };

    if (token.denom !== targetDenom) {
      return new CoinPretty(currency, "0");
    }
    return new CoinPretty(currency, token.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const toAddress = (() => {
    if (!msg.ibcTracking) {
      return "Unknown";
    }

    try {
      let res = Bech32Address.shortenAddress((msg.msg as any)["receiver"], 20);
      const packetData = Buffer.from(
        msg.ibcTracking.originPacket,
        "base64"
      ).toString();
      const parsed = JSON.parse(packetData);
      let obj: any = (() => {
        if (!parsed.memo) {
          return undefined;
        }

        typeof parsed.memo === "string" ? JSON.parse(parsed.memo) : parsed.memo;
      })();

      while (obj) {
        if (obj.receiver) {
          res = Bech32Address.shortenAddress(obj.receiver, 20);
        }
        obj = typeof obj.next === "string" ? JSON.parse(obj.next) : obj.next;
      }

      return res;
    } catch (e) {
      console.log(e);
      return "Unknown";
    }
  })();

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.87"
                d="M3 13.5l10-10m0 0H5.5m7.5 0V11"
              />
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Send"
      paragraph={`To ${toAddress}`}
      amount={sendAmountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        prefix: "minus",
        color: "none",
      }}
    />
  );
});
