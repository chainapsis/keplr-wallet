import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
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
import { CoinPrimitive } from "../../../hooks/use-reward";

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

export function renderSendMsg(
  currencies: Currency[],
  intl: IntlShape,
  toAddress: string,
  amount: CoinPrimitive[]
) {
  const receives: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of amount) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin, true);

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
          // eslint-disable-next-line react/display-name
          b: (...chunks: any[]) => <b>{chunks}</b>,
          recipient: shortenAddress(toAddress, 20),
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

export function renderBeginRedelegateMsg(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorSrcAddress: string,
  validatorDstAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount),
    true
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
          // eslint-disable-next-line react/display-name
          b: (...chunks: any[]) => <b>{chunks}</b>,
          fromValidator: shortenAddress(validatorSrcAddress, 24),
          toValidator: shortenAddress(validatorDstAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
        }}
      />
    )
  };
}

export function renderUndelegateMsg(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount),
    true
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
          // eslint-disable-next-line react/display-name
          b: (...chunks: any[]) => <b>{chunks}</b>,
          br: <br />,
          validator: shortenAddress(validatorAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
        }}
      />
    )
  };
}

export function renderDelegateMsg(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount),
    true
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
          // eslint-disable-next-line react/display-name
          b: (...chunks: any[]) => <b>{chunks}</b>,
          validator: shortenAddress(validatorAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`
        }}
      />
    )
  };
}

export function renderWithdrawDelegatorRewardMsg(
  _currencies: Currency[],
  intl: IntlShape,
  validatorAddress: string
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
          // eslint-disable-next-line react/display-name
          b: (...chunks: any[]) => <b>{chunks}</b>,
          validator: shortenAddress(validatorAddress, 34)
        }}
      />
    )
  };
}

export function renderInstantiateContractMsg(
  currencies: Currency[],
  intl: IntlShape,
  initFunds: CoinPrimitive[],
  codeId: string,
  label: string,
  initMsg: object,
  admin?: string
) {
  const funds: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of initFunds) {
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
            // eslint-disable-next-line react/display-name
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            admin: admin ? shortenAddress(admin, 30) : "",
            ["only-admin-exist"]: (...chunks: any[]) => (admin ? chunks : ""),
            codeId: codeId,
            label: label,
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
        <WasmExecutionMsgView msg={initMsg} />
      </React.Fragment>
    )
  };
}

export function renderUnknownMessage(
  _currencies: Currency[],
  _intl: IntlShape,
  msg: object
) {
  return {
    icon: undefined,
    title: "Unknown",
    content: (
      <React.Fragment>
        <b>Check data tab</b>
        <UnknownMsgView msg={msg} />
      </React.Fragment>
    )
  };
}

/* eslint-disable react/display-name */
export function renderAminoMessage(
  msg: MessageObj,
  currencies: Currency[],
  intl: IntlShape
): {
  icon: string | undefined;
  title: string;
  content: React.ReactElement;
} {
  if (MessageType<MsgSend>(msg, "cosmos-sdk/MsgSend")) {
    return renderSendMsg(
      currencies,
      intl,
      msg.value.to_address,
      msg.value.amount
    );
  }

  if (MessageType<MsgBeginRedelegate>(msg, "cosmos-sdk/MsgBeginRedelegate")) {
    return renderBeginRedelegateMsg(
      currencies,
      intl,
      msg.value.amount,
      msg.value.validator_src_address,
      msg.value.validator_dst_address
    );
  }

  if (MessageType<MsgUndelegate>(msg, "cosmos-sdk/MsgUndelegate")) {
    return renderUndelegateMsg(
      currencies,
      intl,
      msg.value.amount,
      msg.value.validator_address
    );
  }

  if (MessageType<MsgDelegate>(msg, "cosmos-sdk/MsgDelegate")) {
    return renderDelegateMsg(
      currencies,
      intl,
      msg.value.amount,
      msg.value.validator_address
    );
  }

  if (
    MessageType<MsgWithdrawDelegatorReward>(
      msg,
      "cosmos-sdk/MsgWithdrawDelegationReward"
    )
  ) {
    return renderWithdrawDelegatorRewardMsg(
      currencies,
      intl,
      msg.value.validator_address
    );
  }

  if (MessageType<MsgInstantiateContract>(msg, "wasm/MsgInstantiateContract")) {
    return renderInstantiateContractMsg(
      currencies,
      intl,
      msg.value.init_funds,
      msg.value.code_id,
      msg.value.label,
      msg.value.init_msg,
      msg.value.admin
    );
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

  return renderUnknownMessage(currencies, intl, msg);
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

export const UnknownMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();

  const toggleOpen = () => setIsOpen(isOpen => !isOpen);

  const prettyMsg = useMemo(() => {
    try {
      return JSON.stringify(msg, undefined, 2);
    } catch (e) {
      console.log(e);
      return "";
    }
  }, [msg]);

  return (
    <div>
      {isOpen ? (
        <React.Fragment>
          <pre style={{ width: "280px" }}>{isOpen ? prettyMsg : ""}</pre>
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
