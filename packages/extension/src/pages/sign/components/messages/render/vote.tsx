import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { IconProps } from "../../../../../components/icon/types";
import { VoteOption } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/gov";

export const VoteMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "cosmos-sdk/MsgVote") {
        return {
          proposalId: msg.value.proposal_id,
          voter: msg.value.voter,
          option: msg.value.option,
        };
      }

      if ("unpacked" in msg && msg.typeUrl === "/cosmos.gov.v1beta1.MsgVote") {
        return {
          proposalId: (msg.unpacked as MsgVote).proposalId,
          voter: (msg.unpacked as MsgVote).voter,
          option: (msg.unpacked as MsgVote).option,
        };
      }
    })();

    if (d) {
      return {
        icon: <VoteIcon />,
        title: "Vote",
        content: (
          <VoteMessagePretty
            chainId={chainId}
            proposalId={d.proposalId}
            voter={d.voter}
            option={d.option}
          />
        ),
      };
    }
  },
};

const VoteMessagePretty: FunctionComponent<{
  chainId: string;
  proposalId: string;
  voter: string;
  option: VoteOption | string;
}> = ({ proposalId, option }) => {
  const textualOption = (() => {
    if (typeof option === "string") {
      return option;
    }

    switch (option) {
      case 0:
        return "Empty";
      case 1:
        return "Yes";
      case 2:
        return "Abstain";
      case 3:
        return "No";
      case 4:
        return "No with veto";
      default:
        return "Unspecified";
    }
  })();

  return (
    <React.Fragment>
      Vote <b>{textualOption}</b> on <b>Proposal {proposalId}</b>
    </React.Fragment>
  );
};

const VoteIcon: FunctionComponent<IconProps> = ({
  width = "1.5rem",
  height = "1.5rem",
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
        d="M13.2779 8.554C13.4823 8.35374 13.8067 8.34549 14.0211 8.53512C14.2354 8.72475 14.2667 9.04776 14.0928 9.27505L6.66465 18.985C6.1644 19.6389 5.21439 19.7311 4.59777 19.1855C3.98115 18.6399 3.95691 17.6858 4.54503 17.1096L13.2779 8.554Z"
        fill="#FEFEFE"
      />
      <path
        d="M13.3777 3.89704C15.823 5.32321 16.9743 6.37292 18.7029 8.60868L15.3374 12.4124C12.8509 11.0352 11.679 10.0044 10.0122 7.70074L13.3777 3.89704Z"
        fill="#FEFEFE"
      />
      <rect
        x="11.8124"
        y="1.83401"
        width="1.52365"
        height="6.09459"
        rx="0.761824"
        transform="rotate(41.5019 11.8124 1.83401)"
        fill="#FEFEFE"
      />
      <rect
        x="19.8002"
        y="8.90146"
        width="1.52365"
        height="6.09459"
        rx="0.761824"
        transform="rotate(41.5019 19.8002 8.90146)"
        fill={color || "currentColor"}
      />
      <rect
        x="12"
        y="19"
        width="9"
        height="1.5"
        rx="0.75"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
