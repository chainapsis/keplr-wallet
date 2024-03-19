import React, { FunctionComponent, useMemo } from "react";
import { MsgHistory } from "../types";
import { observer } from "mobx-react-lite";
import { MsgItemBase } from "./base";
import { ItemLogo } from "./logo";
import { ColorPalette } from "../../../../styles";

export const MsgRelationVote: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
}> = observer(({ msg, prices, targetDenom }) => {
  const proposal: {
    proposalId: string;
    title: string;
  } = useMemo(() => {
    return {
      proposalId: (msg.msg as any)["proposal_id"],
      title: "TODO",
    };
  }, [msg.msg]);

  const voteText: {
    text: string;
    color: string;
  } = useMemo(() => {
    switch ((msg.msg as any)["option"]) {
      case "VOTE_OPTION_YES":
        return {
          text: "Yes",
          color: ColorPalette["gray-10"],
        };
      case "VOTE_OPTION_NO":
        return {
          text: "No",
          color: ColorPalette["gray-10"],
        };
      case "VOTE_OPTION_NO_WITH_VETO":
        return {
          text: "NWV",
          color: ColorPalette["yellow-400"],
        };
      case "VOTE_OPTION_ABSTAIN":
        return {
          text: "Abstain",
          color: ColorPalette["gray-10"],
        };
      default:
        return {
          text: "Unknown",
          color: ColorPalette["gray-10"],
        };
    }
  }, [msg.msg]);

  return (
    <MsgItemBase
      logo={
        <ItemLogo
          center={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="18"
              fill="none"
              viewBox="0 0 14 18"
            >
              <g clipPath="url(#clip0_9040_45523)">
                <rect
                  width="13"
                  height="11"
                  x="0.5"
                  y="4.383"
                  fill="currentColor"
                  rx="2"
                />
                <rect
                  width="5.397"
                  height="7.669"
                  x="7.609"
                  y="0.234"
                  fill="currentColor"
                  stroke="#2E2E32"
                  strokeWidth="1.659"
                  rx="1.106"
                  transform="rotate(36.313 7.61 .234)"
                />
                <path
                  fill="currentColor"
                  d="M3.5 7.498H10.5V12.498000000000001H3.5z"
                />
                <path
                  stroke={ColorPalette["gray-500"]}
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M2.5 7.498h9"
                />
              </g>
              <defs>
                <clipPath id="clip0_9040_45523">
                  <path
                    fill="#fff"
                    d="M0 0H14V17H0z"
                    transform="translate(0 .5)"
                  />
                </clipPath>
              </defs>
            </svg>
          }
        />
      }
      chainId={msg.chainId}
      title="Vote"
      paragraph={`#${proposal.proposalId} ${proposal.title}`}
      amount={voteText.text}
      overrideAmountColor={voteText.color}
      prices={prices || {}}
      targetDenom={targetDenom}
    />
  );
});
