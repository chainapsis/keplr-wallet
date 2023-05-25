import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CustomIcon } from "./custom-icon";
import { Coin } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";

export const UndelegateMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgUndelegate") {
        return {
          validatorAddress: msg.value.validator_address,
          amount: msg.value.amount,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/cosmos.staking.v1beta1.MsgUndelegate"
      ) {
        return {
          validatorAddress: (msg.unpacked as MsgUndelegate).validatorAddress,
          amount: (msg.unpacked as MsgUndelegate).amount,
        };
      }
    })();

    if (d) {
      return {
        icon: <CustomIcon />,
        title: "Undelegate",
        content: (
          <UndelegateMessagePretty
            chainId={chainId}
            validatorAddress={d.validatorAddress}
            amount={d.amount}
          />
        ),
      };
    }
  },
};

const UndelegateMessagePretty: FunctionComponent<{
  chainId: string;
  validatorAddress: string;
  amount: Coin;
}> = observer(({ chainId, validatorAddress, amount }) => {
  const { chainStore, queriesStore } = useStore();

  const currency = chainStore.getChain(chainId).forceFindCurrency(amount.denom);
  const coinPretty = new CoinPretty(currency, amount.amount);

  const moniker = queriesStore
    .get(chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
    .getValidator(validatorAddress)?.description.moniker;

  return (
    <React.Fragment>
      Undelegate <b>{coinPretty.trim(true).toString()}</b> from{" "}
      <b>{moniker || Bech32Address.shortenAddress(validatorAddress, 28)}</b>
      <br />
      Asset will be liquid after unbonding period
    </React.Fragment>
  );
});
