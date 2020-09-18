import React, { FunctionComponent, useState } from "react";
import { shortenAddress } from "../../../../common/address";
import { truncHashPortion } from "../../../../common/hash";
import { CoinUtils } from "../../../../common/coin-utils";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { IntlShape, FormattedMessage } from "react-intl";
import { Currency } from "../../../../common/currency";
import { Button } from "reactstrap";

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

interface MsgUndelegate {
  type: "cosmos-sdk/MsgUndelegate";
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

interface MsgWithdrawDelegatorReward {
  type: "cosmos-sdk/MsgWithdrawDelegationReward";
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

interface MsgBeginRedelegate {
  type: "cosmos-sdk/MsgBeginRedelegate";
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_dst_address: string;
    validator_src_address: string;
  };
}

interface MsgInstantiateContract {
  type: "wasm/MsgInstantiateContract";
  value: {
    sender: string;
    code_id: string;
    label: string;
    init_msg: object;
    init_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

interface MsgExecuteContract {
  type: "wasm/MsgExecuteContract";
  value: {
    contract: string;
    msg: object;
    sender: string;
    sent_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

interface MsgLink {
  type: "cyber/Link";
  value: {
    links: [
      {
        from: string;
        to: string;
      }
    ];
    address: string;
  };
}

type Messages =
  | MsgSend
  | MsgDelegate
  | MsgUndelegate
  | MsgWithdrawDelegatorReward
  | MsgBeginRedelegate
  | MsgInstantiateContract
  | MsgExecuteContract
  | MsgLink;

// Type guard for messages.
function MessageType<T extends Messages>(
  msg: MessageObj,
  type: T["type"]
): msg is T {
  return msg.type === type;
}

/* eslint-disable react/display-name */
export function renderMessage(
  msg: MessageObj,
  currencies: Currency[],
  intl: IntlShape
): {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  if (MessageType<MsgSend>(msg, "cosmos-sdk/MsgSend")) {
    const receives: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.amount) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

      receives.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
      });
    }

    return {
      icon: "fas fa-paper-plane",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgSend.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgSend.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            recipient: shortenAddress(msg.value.to_address, 20),
            amount: receives
              .map(coin => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(",")
          }}
        />
      )
    };
  }

  if (MessageType<MsgBeginRedelegate>(msg, "cosmos-sdk/MsgBeginRedelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      currencies,
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

    return {
      icon: "fas fa-layer-group",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgBeginRedelegate.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgBeginRedelegate.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            fromValidator: shortenAddress(msg.value.validator_src_address, 24),
            toValidator: shortenAddress(msg.value.validator_dst_address, 24),
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
          }}
        />
      )
    };
  }

  if (MessageType<MsgUndelegate>(msg, "cosmos-sdk/MsgUndelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      currencies,
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

    return {
      icon: "fas fa-layer-group",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgUndelegate.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgUndelegate.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            validator: shortenAddress(msg.value.validator_address, 24),
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
          }}
        />
      )
    };
  }

  if (MessageType<MsgDelegate>(msg, "cosmos-sdk/MsgDelegate")) {
    const parsed = CoinUtils.parseDecAndDenomFromCoin(
      currencies,
      new Coin(msg.value.amount.denom, msg.value.amount.amount)
    );

    return {
      icon: "fas fa-layer-group",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgDelegate.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgDelegate.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            validator: shortenAddress(msg.value.validator_address, 24),
            amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
          }}
        />
      )
    };
  }

  if (
    MessageType<MsgWithdrawDelegatorReward>(
      msg,
      "cosmos-sdk/MsgWithdrawDelegationReward"
    )
  ) {
    return {
      icon: "fas fa-money-bill",
      title: intl.formatMessage({
        id: "sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            validator: shortenAddress(msg.value.validator_address, 34)
          }}
        />
      )
    };
  }

  if (MessageType<MsgInstantiateContract>(msg, "wasm/MsgInstantiateContract")) {
    const funds: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.init_funds) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

      funds.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
      });
    }

    return {
      icon: "fas fa-cog",
      title: "Instantiate Wasm Contract",
      content: (
        <React.Fragment>
          Instantiate code ID <b>{msg.value.code_id}</b> contract with{" "}
          {msg.value.label} label
          {funds.length > 0 ? (
            <React.Fragment>
              {" "}
              by funding{" "}
              <b>
                {funds
                  .map(coin => {
                    return `${coin.amount} ${coin.denom}`;
                  })
                  .join(",")}
              </b>
            </React.Fragment>
          ) : null}
          <br />
          <WasmExecutionMsgView msg={msg.value.init_msg} />
        </React.Fragment>
      )
    };
  }

  if (MessageType<MsgExecuteContract>(msg, "wasm/MsgExecuteContract")) {
    const sent: { amount: string; denom: string }[] = [];
    for (const coinPrimitive of msg.value.sent_funds) {
      const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
      const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

      sent.push({
        amount: clearDecimals(parsed.amount),
        denom: parsed.denom
      });
    }

    return {
      icon: "fas fa-cog",
      title: "Execute Wasm Contract",
      content: (
        <React.Fragment>
          Execute contract <b>{shortenAddress(msg.value.contract, 26)}</b>
          {sent.length > 0 ? (
            <React.Fragment>
              {" "}
              by sending{" "}
              <b>
                {sent
                  .map(coin => {
                    return `${coin.amount} ${coin.denom}`;
                  })
                  .join(",")}
              </b>
            </React.Fragment>
          ) : null}
          <br />
          <WasmExecutionMsgView msg={msg.value.msg} />
        </React.Fragment>
      )
    };
  }

  if (MessageType<MsgLink>(msg, "cyber/Link")) {
    const cyberlinks: { from: string; to: string }[] = [];
    for (const link of msg.value.links) {
      cyberlinks.push({
        from: link.from,
        to: link.to
      });
    }

    return {
      icon: "fas fa-paper-plane",
      title: intl.formatMessage({
        id: "sign.list.message.cyber/Link.title"
      }),
      content: (
        <FormattedMessage
          id="sign.list.message.cyber/Link.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            address: shortenAddress(msg.value.address, 20),
            link: cyberlinks
              .map(link => {
                return `${truncHashPortion(
                  link.from,
                  7,
                  7
                )} → ${truncHashPortion(link.to, 7, 7)}`;
              })
              .join(", ")
          }}
        />
      )
    };
  }

  return {
    icon: undefined,
    title: "Unknown",
    content: <b>Check data tab</b>
  };
}
/* eslint-enable react/display-name */

export const WasmExecutionMsgView: FunctionComponent<{ msg: object }> = ({
  msg
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(isOpen => !isOpen);

  return (
    <div>
      {
        <pre style={{ width: "280px" }}>
          {isOpen ? JSON.stringify(msg, null, 2) : ""}
        </pre>
      }
      <Button
        size="sm"
        style={{ position: "absolute", right: "20px" }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          toggleOpen();
        }}
      >
        {isOpen ? "Close" : "Details"}
      </Button>
      <div style={{ height: "36px" }} />
    </div>
  );
};

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
