/* eslint-disable react/display-name */

import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinUtils, Coin } from "@keplr-wallet/unit";
import { IntlShape, FormattedMessage, useIntl } from "react-intl";
import { Currency } from "@keplr-wallet/types";
import { Button, Badge } from "reactstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import yaml from "js-yaml";

import { Buffer } from "buffer/";
import { CoinPrimitive } from "@keplr-wallet/stores";

export interface MessageObj {
  readonly type: string;
  readonly value: unknown;
}

export interface MsgSend {
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

export interface MsgTransfer {
  value: {
    source_port: string;
    source_channel: string;
    token: {
      denom: string;
      amount: string;
    };
    sender: string;
    receiver: string;
    timeout_height: {
      revision_number: string | undefined;
      revision_height: string;
    };
  };
}

export interface MsgDelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgUndelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgWithdrawDelegatorReward {
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgBeginRedelegate {
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

export interface MsgVote {
  value: {
    proposal_id: string;
    voter: string;
    // In the stargate, option would be the enum (0: empty, 1: yes, 2: abstain, 3: no, 4: no with veto).
    option: string | number;
  };
}

export interface MsgInstantiateContract {
  value: {
    // Admin field can be omitted.
    admin?: string;
    sender: string;
    code_id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
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
export interface MsgExecuteContract {
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    // eslint-disable-next-line @typescript-eslint/ban-types
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

export interface MsgLink {
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

// eslint-disable-next-line @typescript-eslint/ban-types
export function renderUnknownMessage(msg: object) {
  return {
    icon: undefined,
    title: "Custom",
    content: (
      <React.Fragment>
        <UnknownMsgView msg={msg} />
      </React.Fragment>
    ),
  };
}

export function renderMsgSend(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive[],
  toAddress: string
) {
  const receives: CoinPrimitive[] = [];
  for (const coinPrimitive of amount) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    receives.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  return {
    icon: "fas fa-paper-plane",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgSend.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgSend.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          recipient: Bech32Address.shortenAddress(toAddress, 20),
          amount: receives
            .map((coin) => {
              return `${coin.amount} ${coin.denom}`;
            })
            .join(","),
        }}
      />
    ),
  };
}

export function renderMsgTransfer(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  receiver: string,
  channelId: string
) {
  const coin = new Coin(amount.denom, amount.amount);
  const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  return {
    icon: "fas fa-link",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgTransfer.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgTransfer.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          receiver: Bech32Address.shortenAddress(receiver, 20),
          amount: `${amount.amount} ${amount.denom}`,
          channel: channelId,
        }}
      />
    ),
  };
}

export function renderMsgBeginRedelegate(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorSrcAddress: string,
  validatorDstAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  return {
    icon: "fas fa-layer-group",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgBeginRedelegate.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgBeginRedelegate.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          fromValidator: Bech32Address.shortenAddress(validatorSrcAddress, 24),
          toValidator: Bech32Address.shortenAddress(validatorDstAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`,
        }}
      />
    ),
  };
}

export function renderMsgUndelegate(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  return {
    icon: "fas fa-layer-group",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgUndelegate.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgUndelegate.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          br: <br />,
          validator: Bech32Address.shortenAddress(validatorAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`,
        }}
      />
    ),
  };
}

export function renderMsgDelegate(
  currencies: Currency[],
  intl: IntlShape,
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  return {
    icon: "fas fa-layer-group",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgDelegate.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgDelegate.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          validator: Bech32Address.shortenAddress(validatorAddress, 24),
          amount: `${clearDecimals(parsed.amount)} ${parsed.denom}`,
        }}
      />
    ),
  };
}

export function renderMsgWithdrawDelegatorReward(
  intl: IntlShape,
  validatorAddress: string
) {
  return {
    icon: "fas fa-money-bill",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgWithdrawDelegatorReward.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          validator: Bech32Address.shortenAddress(validatorAddress, 34),
        }}
      />
    ),
  };
}

export function renderMsgVote(
  intl: IntlShape,
  proposalId: string,
  option: string | number
) {
  const textualOption = (() => {
    if (typeof option === "string") {
      return option;
    }

    switch (option) {
      case 0:
        return "Empty";
      case 1:
        return "Yes";
      case 2:
        return "Abstain";
      case 3:
        return "No";
      case 4:
        return "No with veto";
      default:
        return "Unspecified";
    }
  })();

  return {
    icon: "fas fa-vote-yea",
    title: intl.formatMessage({
      id: "sign.list.message.cosmos-sdk/MsgVote.title",
    }),
    content: (
      <FormattedMessage
        id="sign.list.message.cosmos-sdk/MsgVote.content"
        values={{
          b: (...chunks: any[]) => <b>{chunks}</b>,
          id: proposalId,
          option: textualOption,
        }}
      />
    ),
  };
}

export function renderMsgInstantiateContract(
  currencies: Currency[],
  intl: IntlShape,
  initFunds: CoinPrimitive[],
  admin: string | undefined,
  codeId: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  initMsg: object
) {
  const funds: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of initFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    funds.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  return {
    icon: "fas fa-cog",
    title: intl.formatMessage({
      id: "sign.list.message.wasm/MsgInstantiateContract.title",
    }),
    content: (
      <React.Fragment>
        <FormattedMessage
          id="sign.list.message.wasm/MsgInstantiateContract.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            admin: admin ? Bech32Address.shortenAddress(admin, 30) : "",
            ["only-admin-exist"]: (...chunks: any[]) => (admin ? chunks : ""),
            codeId: codeId,
            label: label,
            ["only-funds-exist"]: (...chunks: any[]) =>
              funds.length > 0 ? chunks : "",
            funds: funds
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(","),
          }}
        />
        <br />
        <WasmExecutionMsgView msg={initMsg} />
      </React.Fragment>
    ),
  };
}

export function renderMsgExecuteContract(
  currencies: Currency[],
  intl: IntlShape,
  sentFunds: CoinPrimitive[],
  callbackCodeHash: string | undefined,
  contract: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string
) {
  const sent: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of sentFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    sent.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  const isSecretWasm = callbackCodeHash != null;

  return {
    icon: "fas fa-cog",
    title: intl.formatMessage({
      id: "sign.list.message.wasm/MsgExecuteContract.title",
    }),
    content: (
      <React.Fragment>
        <FormattedMessage
          id="sign.list.message.wasm/MsgExecuteContract.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            address: Bech32Address.shortenAddress(contract, 26),
            ["only-sent-exist"]: (...chunks: any[]) =>
              sent.length > 0 ? chunks : "",
            sent: sent
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(","),
          }}
        />
        {isSecretWasm ? (
          <React.Fragment>
            <br />
            <Badge
              color="primary"
              pill
              style={{ marginTop: "6px", marginBottom: "6px" }}
            >
              <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
            </Badge>
          </React.Fragment>
        ) : (
          <br />
        )}
        <WasmExecutionMsgView msg={msg} />
      </React.Fragment>
    ),
  };
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();

  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
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

          const keplr = await accountStore
            .getAccount(chainStore.current.chainId)
            .getKeplr();
          if (!keplr) {
            throw new Error("Can't get the keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(chainStore.current.chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
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
                "sign.list.message.wasm/MsgExecuteContract.content.warning.secret-wasm.failed-decryption",
            })
          );
        }
      })();
    }
  }, [chainStore, chainStore.current.chainId, intl, msg]);

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
        style={{ float: "right", marginRight: "6px" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          toggleOpen();
        }}
      >
        {isOpen
          ? intl.formatMessage({
              id: "sign.list.message.wasm.button.close",
            })
          : intl.formatMessage({
              id: "sign.list.message.wasm.button.details",
            })}
      </Button>
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const UnknownMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const prettyMsg = useMemo(() => {
    try {
      return yaml.dump(msg);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  }, [msg]);

  return (
    <div>
      <pre style={{ width: "280px" }}>{prettyMsg}</pre>
    </div>
  );
};

export function clearDecimals(dec: string): string {
  if (!dec.includes(".")) {
    return dec;
  }

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
