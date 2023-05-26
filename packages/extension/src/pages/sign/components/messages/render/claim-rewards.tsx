import React, { FunctionComponent } from "react";
import { IMessageRenderer } from "../types";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Image } from "../../../../../components/image";

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
          <Image
            alt="icns-icon"
            src={require("../../../../../public/assets/img/sign-claim.png")}
            style={{ width: "3rem", height: "3rem" }}
          />
        ),
        title: "Claim Rewards",
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
      Claim staking reward from{" "}
      <b>{moniker || Bech32Address.shortenAddress(validatorAddress, 28)}</b>
    </React.Fragment>
  );
});
