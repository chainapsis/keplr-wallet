import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";

import { FormattedMessage } from "react-intl";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageClaimRewardIcon } from "../../../../../components/icon";
import { useStore } from "../../../../../stores";
import { observer } from "mobx-react-lite";

export const ClaimBtcDelegationRewardMessage: IMessageRenderer = {
  process(_chainId: string, msg) {
    const d = (() => {
      if (
        "type" in msg &&
        msg.type === "/babylon.incentive.MsgWithdrawReward"
      ) {
        return msg.value.address;
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/babylon.incentive.MsgWithdrawReward"
      ) {
        return (msg.unpacked as { address: string }).address;
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageClaimRewardIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.claim-btc-delegation-reward.title" />
        ),
        content: (
          <ClaimBtcDelegationRewardMessagePretty
            chainId={_chainId}
            bech32Address={d}
          />
        ),
      };
    }
  },
};

const ClaimBtcDelegationRewardMessagePretty: FunctionComponent<{
  chainId: string;
  bech32Address: string;
}> = observer(({ chainId, bech32Address }) => {
  const { queriesStore } = useStore();

  const claimable = queriesStore
    .get(chainId)
    .cosmos.queryBabylonBtcDelegationReward.getQueryBech32Address(
      bech32Address
    ).claimable;

  return (
    <FormattedMessage
      id="page.sign.components.messages.claim-btc-delegation-reward.paragraph"
      values={{
        amount: claimable?.trim(true).toString() || "0",
      }}
    />
  );
});
