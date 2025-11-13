import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";

import { FormattedMessage } from "react-intl";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageRegisterIcon } from "../../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";

export const CreateBtcDelegationMessage: IMessageRenderer = {
  process(_chainId: string, msg) {
    if (
      ("type" in msg &&
        msg.type === "/babylon.btcstaking.v1.MsgCreateBTCDelegation") ||
      ("unpacked" in msg &&
        msg.typeUrl === "/babylon.btcstaking.v1.MsgCreateBTCDelegation")
    ) {
      return {
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageRegisterIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.create-btc-delegation.title" />
        ),
        content: <CreateBtcDelegationMessagePretty chainId={_chainId} />,
      };
    }
  },
};

const CreateBtcDelegationMessagePretty: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { chainStore } = useStore();

  const chainName = chainStore.getModularChain(chainId).chainName;

  return (
    <FormattedMessage
      id="page.sign.components.messages.create-btc-delegation.paragraph"
      values={{
        chainName,
      }}
    />
  );
});
