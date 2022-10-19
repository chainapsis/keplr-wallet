import { AminoMsg } from "@cosmjs/amino";
import {
  AminoMsgExecuteContract,
  AminoMsgInstantiateContract,
} from "@cosmjs/cosmwasm-stargate/build/modules";
import { AminoMsgSend } from "@cosmjs/stargate";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faWallet } from "@fortawesome/free-solid-svg-icons/faWallet";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import React, { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";

import { formatCoin } from "../../balances";
import { useStore } from "../../stores";
import ArrowUpIcon from "./assets/arrowUpIcon.svg";

export function PrettyMessage({ message }: { message: AminoMsg }) {
  switch (message.type) {
    case "cosmos-sdk/MsgSend":
      return <PrettyMessageSend value={message.value} />;
    case "wasm/MsgExecuteContract":
      return <PrettyMessageExecuteContract message={message} />;
    case "wasm/MsgInstantiateContract":
      return <PrettyMessageInstantiateContract value={message.value} />;
    default:
      return <PrettyMessageUnknown />;
  }
}

function PrettyMessageSend({ value }: { value: AminoMsgSend["value"] }) {
  return (
    <MessageElement
      icon={<FontAwesomeIcon icon={faPaperPlane} size={33} color="white" />}
      title="Send"
    >
      <Text style={{ color: "white" }}>
        {Bech32Address.shortenAddress(value.to_address, 20)}
        <Text style={{ opacity: 0.6 }}> will receive:</Text>
      </Text>
      {value.amount.map((coin) => {
        const { amount, denom } = formatCoin(coin);
        return (
          <Text style={{ color: "white" }} key={denom}>
            {amount} {denom}
          </Text>
        );
      })}
    </MessageElement>
  );
}

const PrettyMessageInstantiateContract = observer(
  ({ value }: { value: AminoMsgInstantiateContract["value"] }) => {
    const { chainStore } = useStore();
    const intl = useIntl();

    if (
      value.code_id ===
      chainStore.currentChainInformation.currentCodeId.toString()
    ) {
      return (
        <MessageElement
          icon={<FontAwesomeIcon icon={faWallet} size={33} color="white" />}
          title={intl.formatMessage({
            id: "signature.modal.createobiwallet",
            defaultMessage: "Create Obi Wallet",
          })}
        />
      );
    }

    return (
      <MessageElement
        icon={<ArrowUpIcon />}
        title={intl.formatMessage({
          id: "signature.modal.initcontract",
          defaultMessage: "Init Contract",
        })}
      />
    );
  }
);

const PrettyMessageExecuteContract = observer(
  ({ message }: { message: AminoMsg }) => {
    const value = message.value as AminoMsgExecuteContract["value"];
    const intl = useIntl();

    if (value.msg["propose_update_admin"] !== undefined) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.proposeupdateadmin",
            defaultMessage: "Propose new admin for Obi Wallet",
          })}
        />
      );
    }

    if (value.msg["confirm_update_admin"] !== undefined) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.confirmupdateadmin",
            defaultMessage: "Confirm new admin for Obi Wallet",
          })}
        />
      );
    }

    return (
      <MessageElement
        icon={<FontAwesomeIcon icon={faPlay} size={33} color="white" />}
        title="Execute Wasm Contract"
      >
        <Text style={{ color: "white" }}>
          Execute wasm contract{" "}
          <Text style={{ fontWeight: "700" }}>
            {Bech32Address.shortenAddress(message.value.contract, 20)}
          </Text>
        </Text>
        <Text style={{ color: "white" }}>
          {message.value.funds.length > 0 && "by sending:"}
          {message.value.funds.map(
            (token: { amount: string; denom: "string" }) => {
              const { amount, denom } = formatCoin(token);
              return (
                <Text
                  style={{ color: "white" }}
                  key={denom ? denom : token.denom}
                >
                  {amount ? amount : token.amount} {denom ? denom : token.denom}
                </Text>
              );
            }
          )}
        </Text>
        <Text style={{ color: "white" }}>
          {JSON.stringify(message.value.msg, null, 2)}
        </Text>
      </MessageElement>
    );
  }
);

function PrettyMessageUnknown() {
  const intl = useIntl();

  return (
    <MessageElement
      icon={<ArrowUpIcon />}
      title={intl.formatMessage({
        id: "signature.modal.unknownmessage.heading",
        defaultMessage: "Unknown message",
      })}
      subTitle={intl.formatMessage({
        id: "signature.modal.unknownmessage.subheading",
        defaultMessage: "Please check data tab",
      })}
    />
  );
}

interface MessageElementProps {
  icon: ReactNode;
  title?: string;
  subTitle?: string;
  children?: ReactNode;
}

function MessageElement({
  icon,
  title,
  subTitle,
  children,
}: MessageElementProps) {
  return (
    <View
      style={{
        minHeight: 50,
        flexDirection: "row",
        borderBottomColor: "rgba(255,255,255, 0.6)",
        borderBottomWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
      }}
    >
      <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
        {icon}
      </View>
      <View
        style={{ flex: 1, justifyContent: "space-around", paddingLeft: 10 }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "600",
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          {title ? title : ""}
        </Text>
        {subTitle ? (
          <Text style={{ color: "white", opacity: 0.6 }}>{subTitle}</Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}
