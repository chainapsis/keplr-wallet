import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { MsgVote } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "@keplr-wallet/proto-types/cosmos/gov/v1beta1/gov";
import { Image } from "../../../../../components/image";

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
        icon: (
          <Image
            alt="icns-icon"
            src={require("../../../../../public/assets/img/sign-vote.png")}
            style={{ width: "3rem", height: "3rem" }}
          />
        ),
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
