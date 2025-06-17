import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";

import { FormattedMessage } from "react-intl";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageCustomIcon } from "../../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";

export const AtomoneMintPhotonMessage: IMessageRenderer = {
  process(_chainId: string, msg) {
    if (
      ("type" in msg && msg.type === "atomone/photon/v1/MsgMintPhoton") ||
      ("unpacked" in msg && msg.typeUrl === "/atomone.photon.v1.MsgMintPhoton")
    ) {
      return {
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageCustomIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.atomone-mint-photon.title" />
        ),
        content: <AtomoneMintPhotonMessagePretty chainId={_chainId} />,
      };
    }
  },
};

const AtomoneMintPhotonMessagePretty: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { chainStore } = useStore();

  const chainName = chainStore.getChain(chainId).chainName;

  return (
    <FormattedMessage
      id="page.sign.components.messages.atomone-mint-photon.paragraph"
      values={{
        chainName,
      }}
    />
  );
});
