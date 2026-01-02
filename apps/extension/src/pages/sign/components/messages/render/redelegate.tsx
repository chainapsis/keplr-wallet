import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgBeginRedelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { Coin } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { FormattedMessage } from "react-intl";
import { MessageRedelegateIcon } from "../../../../../components/icon";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";
import { MsgWrappedBeginRedelegate } from "@keplr-wallet/proto-types/babylon/epoching/v1/tx";

export const RedelegateMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgBeginRedelegate") {
        return {
          validatorSrcAddress: msg.value.validator_src_address,
          validatorDstAddress: msg.value.validator_dst_address,
          amount: msg.value.amount,
        };
      }

      if (
        "type" in msg &&
        msg.type === "/babylon.epoching.v1.MsgWrappedBeginRedelegate"
      ) {
        return {
          validatorSrcAddress: msg.value.msg.validator_src_address,
          validatorDstAddress: msg.value.msg.validator_dst_address,
          amount: msg.value.msg.amount,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/cosmos.staking.v1beta1.MsgBeginRedelegate"
      ) {
        return {
          validatorSrcAddress: (msg.unpacked as MsgBeginRedelegate)
            .validatorSrcAddress,
          validatorDstAddress: (msg.unpacked as MsgBeginRedelegate)
            .validatorDstAddress,
          amount: (msg.unpacked as MsgBeginRedelegate).amount,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/babylon.epoching.v1.MsgWrappedBeginRedelegate" &&
        (msg.unpacked as MsgWrappedBeginRedelegate).msg
      ) {
        return {
          validatorSrcAddress: (msg.unpacked as MsgWrappedBeginRedelegate).msg!
            .validatorSrcAddress,
          validatorDstAddress: (msg.unpacked as MsgWrappedBeginRedelegate).msg!
            .validatorDstAddress,
          amount: (msg.unpacked as MsgWrappedBeginRedelegate).msg!.amount,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={<MessageRedelegateIcon width="2.5rem" height="2.5rem" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.redelegate.title" />
        ),
        content: (
          <RedelegateMessagePretty
            chainId={chainId}
            validatorSrcAddress={d.validatorSrcAddress}
            validatorDstAddress={d.validatorDstAddress}
            amount={d.amount}
          />
        ),
      };
    }
  },
};

const RedelegateMessagePretty: FunctionComponent<{
  chainId: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  amount: Coin;
}> = observer(
  ({ chainId, validatorSrcAddress, validatorDstAddress, amount }) => {
    const { chainStore, queriesStore } = useStore();

    const currency = chainStore
      .getModularChainInfoImpl(chainId)
      .forceFindCurrency(amount.denom);
    const coinPretty = new CoinPretty(currency, amount.amount);

    const srcMoniker = queriesStore
      .get(chainId)
      .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorSrcAddress)?.description.moniker;

    const sdstMoniker = queriesStore
      .get(chainId)
      .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorDstAddress)?.description.moniker;

    return (
      <React.Fragment>
        <FormattedMessage
          id="page.sign.components.messages.redelegate.paragraph"
          values={{
            coin: coinPretty.trim(true).toString(),
            from:
              srcMoniker ||
              Bech32Address.shortenAddress(validatorSrcAddress, 28),
            to:
              sdstMoniker ||
              Bech32Address.shortenAddress(validatorDstAddress, 28),
            b: (...chunks: any) => <b>{chunks}</b>,
          }}
        />
      </React.Fragment>
    );
  }
);
