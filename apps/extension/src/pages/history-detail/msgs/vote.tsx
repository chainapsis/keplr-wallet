import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { Subtitle3 } from "../../../components/typography";
import { MsgHistory } from "../../main/token-detail/types";
import { useTheme } from "styled-components";

export const HistoryDetailVote: FunctionComponent<{
  msg: MsgHistory;
  targetDenom: string;
}> = observer(({ msg }) => {
  const theme = useTheme();

  const proposal: {
    proposalId: string;
  } = useMemo(() => {
    return {
      proposalId: (msg.msg as any)["proposal_id"],
    };
  }, [msg.msg]);

  const voteText: string = useMemo(() => {
    switch ((msg.msg as any)["option"]) {
      case "VOTE_OPTION_YES":
        return "Yes";
      case "VOTE_OPTION_NO":
        return "No";
      case "VOTE_OPTION_NO_WITH_VETO":
        return "No with Veto";
      case "VOTE_OPTION_ABSTAIN":
        return "Abstain";
      default:
        return "Unknown";
    }
  }, [msg.msg]);

  return (
    <Box>
      <YAxis alignX="center">
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-650"]
          }
          style={{
            boxShadow:
              theme.mode === "light"
                ? "0 1px 4px 0 rgba(43, 39, 55, 0.10)"
                : undefined,
          }}
        >
          <XAxis alignY="center">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-50"]
              }
            >
              {`Proposal #${proposal.proposalId}`}
            </Subtitle3>
            <div style={{ flex: 1 }} />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-50"]
              }
            >
              {voteText}
            </Subtitle3>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});

export const HistoryDetailGovVoteIcon: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      stroke="none"
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#clip0_19471_16337)">
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeWidth="2.5"
          d="m12.276 12.164-4.418 2.522c-1.224.699-1.224 2.463 0 3.162l9.844 5.62a4.38 4.38 0 0 0 4.345 0l9.844-5.62c1.224-.699 1.224-2.463 0-3.162l-4.935-2.817"
        />
        <path
          stroke={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          strokeLinecap="round"
          strokeWidth="2.5"
          d="M7.134 17.087V30.01a2.19 2.19 0 0 0 1.126 1.915l9.488 5.274a4.38 4.38 0 0 0 4.254.001l8.145-4.518"
        />
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
          fillRule="evenodd"
          d="M28.56 2.324a1.25 1.25 0 0 1 .175 1.759l-8.05 10.458a1.25 1.25 0 0 1-1.917.022L12.634 7.5a1.25 1.25 0 1 1 1.898-1.627l5.163 5.93L26.801 2.5a1.25 1.25 0 0 1 1.759-.176"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_19471_16337">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
