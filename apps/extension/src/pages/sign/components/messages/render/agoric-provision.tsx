import { IMessageRenderer } from "../types";
import React from "react";
import { FormattedMessage } from "react-intl";
import { CustomIcon } from "./custom-icon";
import { MsgProvision } from "@keplr-wallet/proto-types/agoric/swingset/msgs";
import { Bech32Address } from "@keplr-wallet/cosmos";

const b = (...chunks: any) => <b>{chunks}</b>;

export const AgoricProvisionMessage: IMessageRenderer = {
  process(_chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "swingset/Provision") {
        return msg.value as MsgProvision;
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/agoric.swingset.MsgProvision"
      ) {
        return msg.unpacked as MsgProvision;
      }
    })();

    if (d?.powerFlags.includes("SMART_WALLET")) {
      return {
        icon: <CustomIcon />,
        title: (
          <FormattedMessage id="page.sign.components.messages.agoric.provision.title" />
        ),
        content: (
          <FormattedMessage
            id="page.sign.components.messages.agoric.provision.message"
            values={{
              b,
              address: Bech32Address.shortenAddress(d?.address?.toString(), 20),
            }}
          />
        ),
      };
    }
  },
};
