import { IMessageRenderer } from "../types";

import React, { FunctionComponent } from "react";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { IconProps } from "../../../../../components/icon/types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { CoinPrimitive, Staking } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";

export const DelegateMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgDelegate") {
        return {
          amount: msg.value.amount,
          validatorAddress: msg.value.validator_address,
          delegatorAddress: msg.value.delegatorAddress,
        };
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/cosmos.staking.v1beta1.MsgDelegate"
      ) {
        return {
          amount: (msg.unpacked as MsgDelegate).amount,
          validatorAddress: (msg.unpacked as MsgDelegate).validatorAddress,
          delegatorAddress: (msg.unpacked as MsgDelegate).delegatorAddress,
        };
      }
    })();

    if (d) {
      return {
        icon: <DelegateIcon />,
        title: "Delegate",
        content: (
          <DelegateMessagePretty
            chainId={chainId}
            amount={d.amount}
            validatorAddress={d.validatorAddress}
          />
        ),
      };
    }
  },
};

const DelegateMessagePretty: FunctionComponent<{
  chainId: string;
  amount: CoinPrimitive;
  validatorAddress: string;
}> = observer(({ chainId, amount, validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();

  const currency = chainStore.getChain(chainId).forceFindCurrency(amount.denom);
  const coinpretty = new CoinPretty(currency, amount.amount);
  const moniker = queriesStore
    .get(chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
    .getValidator(validatorAddress)?.description.moniker;

  return (
    <React.Fragment>
      Delegate <b>{coinpretty.trim(true).toString()}</b> to{" "}
      <b>{moniker || Bech32Address.shortenAddress(validatorAddress, 28)}</b>
    </React.Fragment>
  );
});

export const DelegateIcon: FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.0017 4C11.7715 4 11.5573 4.06067 11.3653 4.15771H11.3528L4.65273 7.59562C4.39348 7.70046 4.21002 7.95321 4.21002 8.25C4.21002 8.54467 4.39078 8.79742 4.6472 8.90438V8.91821L11.3584 12.3451L11.3639 12.3423C11.5566 12.44 11.7708 12.5 12.0017 12.5C12.2326 12.5 12.4468 12.44 12.6395 12.3423L12.645 12.3451L19.3562 8.91821V8.90438C19.6126 8.79742 19.7934 8.54467 19.7934 8.25C19.7934 7.95321 19.6099 7.70046 19.3506 7.59562L12.6505 4.15771H12.6381C12.4461 4.06067 12.2319 4 12.0017 4ZM5.96425 11.1733L4.65273 11.8456C4.39348 11.9505 4.21002 12.2032 4.21002 12.5C4.21002 12.7947 4.39078 13.0474 4.6472 13.1544V13.1682L11.3584 16.5951L11.3639 16.5923C11.5566 16.69 11.7708 16.75 12.0017 16.75C12.2326 16.75 12.4468 16.69 12.6395 16.5923L12.645 16.5951L19.3562 13.1682V13.1544C19.6126 13.0474 19.7934 12.7947 19.7934 12.5C19.7934 12.2032 19.6099 11.9505 19.3506 11.8456L18.0391 11.1733C15.9814 12.2266 13.1729 13.6598 13.1403 13.6718C12.7755 13.8347 12.3934 13.9167 12.0017 13.9167C11.6086 13.9167 11.2252 13.834 10.8589 13.6704C10.8278 13.6591 8.02267 12.2273 5.96425 11.1733ZM5.96425 15.4233L4.65273 16.0956C4.39348 16.2005 4.21002 16.4532 4.21002 16.75C4.21002 17.0447 4.39078 17.2974 4.6472 17.4044V17.4182L11.3584 20.8451L11.3639 20.8423C11.5566 20.94 11.7708 21 12.0017 21C12.2326 21 12.4468 20.94 12.6395 20.8423L12.645 20.8451L19.3562 17.4182V17.4044C19.6126 17.2974 19.7934 17.0447 19.7934 16.75C19.7934 16.4532 19.6099 16.2005 19.3506 16.0956L18.0391 15.4233C15.9814 16.4766 13.1729 17.9098 13.1403 17.9218C12.7755 18.0847 12.3934 18.1667 12.0017 18.1667C11.6086 18.1667 11.2252 18.084 10.8589 17.9204C10.8278 17.9091 8.02267 16.4773 5.96425 15.4233Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
