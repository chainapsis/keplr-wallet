import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { Subtitle3, Subtitle4 } from "../../../components/typography";
import { Gutter } from "../../../components/gutter";
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

  const voteText: {
    text: string;
    color: string;
  } = useMemo(() => {
    const optionTextColor =
      theme.mode === "light"
        ? ColorPalette["gray-700"]
        : ColorPalette["gray-10"];

    switch ((msg.msg as any)["option"]) {
      case "VOTE_OPTION_YES":
        return {
          text: "Yes",
          color: ColorPalette["green-400"],
        };
      case "VOTE_OPTION_NO":
        return {
          text: "No",
          color: ColorPalette["red-400"],
        };
      case "VOTE_OPTION_NO_WITH_VETO":
        return {
          text: "No with Veto",
          color: ColorPalette["yellow-400"],
        };
      case "VOTE_OPTION_ABSTAIN":
        return {
          text: "Abstain",
          color: optionTextColor,
        };
      default:
        return {
          text: "Unknown",
          color: optionTextColor,
        };
    }
  }, [msg.msg, theme.mode]);

  return (
    <Box>
      <YAxis alignX="center">
        {/* Proposal Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>Proposal</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["white"]}>
              #{proposal.proposalId}
            </Subtitle3>
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        {/* Vote Option Info */}
        <Box
          width="100%"
          padding="1rem"
          borderRadius="0.375rem"
          backgroundColor={ColorPalette["gray-700"]}
        >
          <XAxis alignY="center">
            <Subtitle4 color={ColorPalette["gray-300"]}>Option</Subtitle4>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={voteText.color}>{voteText.text}</Subtitle3>
          </XAxis>
        </Box>
      </YAxis>
    </Box>
  );
});
