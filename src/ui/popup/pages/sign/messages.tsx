import React from "react";
import { shortenAddress } from "../../../../common/address";
import { CoinUtils } from "../../../../common/coin-utils";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

export interface MessageObj {
  type: string;
  value: unknown;
}

interface MsgSend {
  type: "cosmos-sdk/MsgSend";
  value: {
    amount: [
      {
        amount: string;
        denom: string;
      }
    ];
    from_address: string;
    to_address: string;
  };
}

interface MsgDelegate {
  type: "cosmos-sdk/MsgDelegate";
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

type Messages = MsgSend | MsgDelegate;

// Type guard for messages.
function MessageType<T extends Messages>(
  msg: MessageObj,
  type: T["type"]
): msg is T {
  return msg.type === type;
}

export function renderMessage(
  msg: MessageObj
): {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  if (MessageType<MsgSend>(msg, "cosmos-sdk/MsgSend")) {
    const receives: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.amount) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(coin);

      receives.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
      });
    }

    return {
      icon: "fas fa-paper-plane",
      title: "Send",
      content: (
        <>
          <b>{shortenAddress(msg.value.to_address, 20)}</b> will receive{" "}
          <b>
            {receives
              .map(coin => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(",")}
          </b>
        </>
      )
    };
  }

  if (MessageType<MsgDelegate>(msg, "cosmos-sdk/MsgDelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

    return {
      icon: "fas fa-layer-group",
      title: "Delegate",
      content: (
        <>
          <b>{shortenAddress(msg.value.validator_address, 28)}</b> will be
          delegated <b>{`${clearDecimals(parsed.amount)} ${parsed.denom}`}</b>
        </>
      )
    };
  }

  return {
    icon: undefined,
    title: "Unknown",
    content: <b>Check data tab</b>
  };
}

function clearDecimals(dec: string): string {
  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === "0") {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === ".") {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}
