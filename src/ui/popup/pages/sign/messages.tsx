import React, { FunctionComponent, useEffect, useState } from "react";
import { shortenAddress } from "../../../../common/address";
import { truncHashPortion } from "../../../../common/hash";
import { CoinUtils } from "../../../../common/coin-utils";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { IntlShape, FormattedMessage, useIntl } from "react-intl";
import { Currency } from "../../../../common/currency";
import { Button, Badge } from "reactstrap";
import { sendMessage } from "../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { RequestDecryptMsg } from "../../../../background/secret-wasm";
import { observer } from "mobx-react";
import { useStore } from "../../stores";

const Buffer = require("buffer/").Buffer;

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
    // Admin field can be omitted.
    admin?: string;
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

// This message can be a normal cosmwasm message or a secret-wasm message.
interface MsgExecuteContract {
  type: "wasm/MsgExecuteContract";
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    msg: object | string;
    sender: string;
    sent_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
    // The bottom two fields are for secret-wasm message.
    callback_code_hash?: string;
    callback_sig?: string | null;
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
      title: intl.formatMessage({
        id: "sign.list.message.wasm/MsgInstantiateContract.title"
      }),
      content: (
        <React.Fragment>
          <FormattedMessage
            id="sign.list.message.wasm/MsgInstantiateContract.content"
            values={{
              b: (...chunks: any[]) => <b>{chunks}</b>,
              br: <br />,
              admin: msg.value.admin ? shortenAddress(msg.value.admin, 30) : "",
              ["only-admin-exist"]: (...chunks: any[]) =>
                msg.value.admin ? chunks : "",
              codeId: msg.value.code_id,
              label: msg.value.label,
              ["only-funds-exist"]: (...chunks: any[]) =>
                funds.length > 0 ? chunks : "",
              funds: funds
                .map(coin => {
                  return `${coin.amount} ${coin.denom}`;
                })
                .join(",")
            }}
          />
          <br />
          <WasmExecutionMsgView msg={msg.value.init_msg} />
        </React.Fragment>
      )
    };
  }

  // TODO: Show users that this message is encrypted if message is for secret-wasm
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

    const isSecretWasm = msg.value.callback_code_hash != null;

    return {
      icon: "fas fa-cog",
      title: intl.formatMessage({
        id: "sign.list.message.wasm/MsgExecuteContract.title"
      }),
      content: (
        <React.Fragment>
          <FormattedMessage
            id="sign.list.message.wasm/MsgExecuteContract.content"
            values={{
              b: (...chunks: any[]) => <b>{chunks}</b>,
              br: <br />,
              address: shortenAddress(msg.value.contract, 26),
              ["only-sent-exist"]: (...chunks: any[]) =>
                sent.length > 0 ? chunks : "",
              sent: sent
                .map(coin => {
                  return `${coin.amount} ${coin.denom}`;
                })
                .join(",")
            }}
          />
          {isSecretWasm ? (
            <React.Fragment>
              <br />
              <Badge color="primary" pill style={{ marginTop: "6px" }}>
                <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
              </Badge>
            </React.Fragment>
          ) : (
            <br />
          )}
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
export const WasmExecutionMsgView: FunctionComponent<{
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();

  const toggleOpen = () => setIsOpen(isOpen => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(JSON.stringify(msg, null, 2));
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via Keplr, Keplr cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that Kepler cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          let plainText = Buffer.from(
            await sendMessage(
              BACKGROUND_PORT,
              new RequestDecryptMsg(
                chainStore.chainInfo.chainId,
                cipherText.toString("hex"),
                nonce.toString("hex")
              )
            ),
            "hex"
          );

          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            intl.formatMessage({
              id:
                "sign.list.message.wasm/MsgExecuteContract.content.warning.secret-wasm.failed-decryption"
            })
          );
        }
      })();
    }
  }, [chainStore.chainInfo.chainId, intl, msg]);

  return (
    <div>
      {isOpen ? (
        <React.Fragment>
          <pre style={{ width: "280px" }}>{isOpen ? detailsMsg : ""}</pre>
          {warningMsg ? <div>{warningMsg}</div> : null}
        </React.Fragment>
      ) : null}
      <Button
        size="sm"
        style={{ position: "absolute", right: "20px" }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          toggleOpen();
        }}
      >
        {isOpen
          ? intl.formatMessage({
              id: "sign.list.message.wasm.button.close"
            })
          : intl.formatMessage({
              id: "sign.list.message.wasm.button.details"
            })}
      </Button>
      <div style={{ height: "36px" }} />
    </div>
  );
});

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
