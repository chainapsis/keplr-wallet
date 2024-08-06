import React, { FunctionComponent } from "react";
import { IMessageRenderer } from "../types";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { FormattedMessage } from "react-intl";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageClaimRewardIcon } from "../../../../../components/icon";

export const ClaimRewardsMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if (
        "type" in msg &&
        msg.type === "cosmos-sdk/MsgWithdrawDelegationReward"
      ) {
        return {
          validatorAddress: msg.value.validator_address,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl ===
          "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
      ) {
        return {
          validatorAddress: (msg.unpacked as MsgWithdrawDelegatorReward)
            .validatorAddress,
        };
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
          <FormattedMessage id="page.sign.components.messages.claim-rewards.title" />
        ),
        content: (
          <ClaimRewardsMessagePretty
            chainId={chainId}
            validatorAddress={d.validatorAddress}
          />
        ),
      };
    }
  },
};

const ClaimRewardsMessagePretty: FunctionComponent<{
  chainId: string;
  validatorAddress: string;
}> = observer(({ chainId, validatorAddress }) => {
  const { queriesStore } = useStore();

  const moniker = queriesStore
    .get(chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
    .getValidator(validatorAddress)?.description.moniker;

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.components.messages.claim-rewards.paragraph"
        values={{
          validator:
            moniker || Bech32Address.shortenAddress(validatorAddress, 28),
          b: (...chunks: any) => <b>{chunks}</b>,
        }}
      />
    </React.Fragment>
  );
});
