import { AminoMsg } from "@cosmjs/amino";
import { AminoMsgInstantiateContract } from "@cosmjs/cosmwasm-stargate/build/modules";
import { AminoMsgSend } from "@cosmjs/stargate";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import React, { ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Text, View } from "react-native";

import { formatCoin } from "../../../balances";
import { useStore } from "../../../stores";
import ArrowUpIcon from "./assets/arrowUpIcon.svg";

export function PrettyMessage({ message }: { message: AminoMsg }) {
  switch (message.type) {
    case "cosmos-sdk/MsgSend":
      return <PrettyMessageSend value={message.value} />;
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
          <Text style={{ color: "white" }}>
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
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.createobiwallet",
            defaultMessage: "Create ObiWallet",
          })}
        />
      );
    }

    return null;
  }
);

function PrettyMessageUnknown() {
  return (
    <View
      style={{
        height: 50,
        flexDirection: "row",
        borderBottomColor: "rgba(255,255,255, 0.6)",
        borderBottomWidth: 1,
      }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <ArrowUpIcon />
      </View>
      <View
        style={{ flex: 1, justifyContent: "space-around", paddingLeft: 10 }}
      >
        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
          <FormattedMessage
            id="signature.modal.unknownmessage.heading"
            defaultMessage="Unknown message"
          />
        </Text>
        <Text style={{ color: "white", opacity: 0.6 }}>
          <FormattedMessage
            id="signature.modal.unknownmessage.subheading"
            defaultMessage="Please check data tab"
          />
        </Text>
      </View>
    </View>
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
      <View style={{ justifyContent: "center", alignItems: "center" }}>
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
