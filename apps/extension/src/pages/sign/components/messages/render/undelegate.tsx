import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { Coin } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { FormattedMessage } from "react-intl";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MessageUndelegateIcon } from "../../../../../components/icon";

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
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageUndelegateIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.undelegate.title" />
        ),
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
      <FormattedMessage
        id="page.sign.components.messages.undelegate.paragraph"
        values={{
          coin: coinPretty.trim(true).toString(),
          from: moniker || Bech32Address.shortenAddress(validatorAddress, 28),
          b: (...chunks: any) => <b>{chunks}</b>,
          br: <br />,
        }}
      />
    </React.Fragment>
  );
});
