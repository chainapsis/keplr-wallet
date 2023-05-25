import React, { FunctionComponent } from "react";
import { IMessageRenderer } from "../types";
import { MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { Staking } from "@keplr-wallet/stores";
import { IconProps } from "../../../../../components/icon/types";

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
        icon: <ClaimIcon />,
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
      Claim pending staking reward from{" "}
      <b>{moniker || Bech32Address.shortenAddress(validatorAddress, 28)}</b>
    </React.Fragment>
  );
});

const ClaimIcon: FunctionComponent<IconProps> = ({
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
        d="M20.8032 11.3438C20.3368 11.3438 19.825 11.6566 18.7368 12.2321C17.8355 12.7095 17.0018 13.1631 16.4723 13.494C16.5182 13.697 16.5455 13.9074 16.5455 14.1243C16.5455 15.6577 15.3218 16.9048 13.8182 16.9048H10.4091C10.0327 16.9048 9.72728 16.5938 9.72728 16.2096C9.72728 15.8255 10.0327 15.5145 10.4091 15.5145H13.8182C14.57 15.5145 15.1818 14.8908 15.1818 14.1243C15.1818 13.7086 14.9982 13.3392 14.7136 13.0839C14.3905 12.8661 14.0068 12.734 13.5909 12.734H11.5941H11.3182C11.305 12.734 11.2927 12.7308 11.2796 12.7299C10.0814 12.7109 9.50592 12.5848 9.00001 12.4713C8.54001 12.3679 8.10547 12.2706 7.37592 12.2706C4.0432 12.2706 2.14047 16.4418 2.06138 16.6193C1.95865 16.8491 1.98638 17.117 2.1332 17.32L5.31502 21.7196C5.44456 21.899 5.64865 22 5.86229 22C5.90547 22 5.9482 21.9958 5.99138 21.9875C6.24865 21.9374 6.45683 21.7391 6.52365 21.481C6.55956 21.3443 6.90683 20.1487 8.13638 20.1487C9.02365 20.1487 9.94137 20.2654 10.8291 20.378C11.7332 20.4934 12.6686 20.6121 13.5909 20.6121C14.8468 20.6121 15.7509 19.6301 18.3636 16.9048C21.6827 13.4426 22 13.14 22 12.4537C22 11.8596 21.4886 11.3438 20.8032 11.3438ZM17.9091 5.31707C17.9091 6.30415 17.3045 7.14293 16.4545 7.48122C16.0909 5.78049 15.1818 4.85366 13.5136 4.48293C13.8455 3.61634 14.6682 3 15.6364 3C16.8909 3 17.9091 4.03805 17.9091 5.31707ZM12.6818 5.31707C11.8982 5.31707 11.1467 5.63443 10.5926 6.19932C10.0386 6.76422 9.72728 7.53038 9.72728 8.32927C9.72728 9.12815 10.0386 9.89432 10.5926 10.4592C11.1467 11.0241 11.8982 11.3415 12.6818 11.3415C13.4654 11.3415 14.2169 11.0241 14.771 10.4592C15.3251 9.89432 15.6364 9.12815 15.6364 8.32927C15.6364 7.53038 15.3251 6.76422 14.771 6.19932C14.2169 5.63443 13.4654 5.31707 12.6818 5.31707Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
