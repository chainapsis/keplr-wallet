import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import { CustomIcon } from "./custom-icon";
import { Box } from "../../../../../components/box";

type Value = {
  spend_action: string;
  owner: string;
};

export const AgoricWalletSpendActionMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    if (!("type" in msg && msg.type === "swingset/WalletSpendAction")) return;

    return {
      icon: <CustomIcon />,
      title: (
        <FormattedMessage id="page.sign.components.messages.agoric.wallet-spend-action.title" />
      ),
      content: (
        <WalletSpendActionMessagePretty chainId={chainId} value={msg.value} />
      ),
    };
  },
};

const b = (...chunks: any) => <b>{chunks}</b>;

const WalletSpendActionMessagePretty: FunctionComponent<{
  chainId: string;
  value: Value;
}> = ({ chainId, value }) => {
  const { owner, spend_action: spendAction } = value;

  const chainIdMessage = (
    <FormattedMessage
      id="page.sign.components.messages.agoric.chain-id"
      values={{
        chainId,
        b,
      }}
    />
  );

  const ownerMessage = (
    <FormattedMessage
      id="page.sign.components.messages.agoric.owner"
      values={{
        owner,
        b,
      }}
    />
  );

  return (
    <Box>
      <Box marginY="0.5rem">{chainIdMessage}</Box>
      <Box marginBottom="0.5rem">{ownerMessage}</Box>
      <Box>
        Offer: <br />
        {spendAction}
      </Box>
    </Box>
  );
};
