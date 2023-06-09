import React, { useEffect, useState } from "react";
import { FunctionComponent } from "react";
import style from "./style.module.scss";
import { GovStatusChip } from "@components/chips/gov-chip";
import { useHistory } from "react-router";
import { proposalOptions } from "../../../pages/proposals/index";
import { useStore } from "../../../stores";
import { fetchVote } from "@utils/fetch-proposals";
import { ProposalSetup } from "src/@types/proposal-type";
import { useSelector } from "react-redux";
import { useProposals } from "@chatStore/proposal-slice";

interface Props {
  title: string;
  id: string;
  status: string;
}

export const Proposal: FunctionComponent<Props> = (props) => {
  const { title, status, id } = props;
  const history = useHistory();
  let icon, color, background, name;
  const reduxProposals: ProposalSetup = useSelector(useProposals);

  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [alreadyVoted, setAlreadyVoted] = useState("");
  useEffect(() => {
    (async () => {
      const proposalItem = reduxProposals.votedProposals.find(
        (proposal) => proposal.proposal_id === id
      );
      if (!proposalItem) {
        return;
      }
      try {
        const vote = await fetchVote(
          id,
          accountInfo.bech32Address,
          chainStore.current.rest
        );
        const voted = vote.vote.option;
        setAlreadyVoted(voted);
      } catch (e) {}
    })();
  }, []);

  switch (status) {
    case proposalOptions.ProposalPassed:
      icon = "gov-tick.svg";
      color = "#6AB77A";
      background = "#E3F4E7";
      name = "Passed";
      break;
    case proposalOptions.ProposalActive:
      icon = "gov-clock.svg";
      color = "#3B82F6";
      background = "#D0DEF5";
      name = "Active";
      break;
    case proposalOptions.ProposalRejected:
      icon = "gov-cross.svg";
      color = "#DC6461";
      background = "#FBECEC";
      name = "Rejected";
      break;
    default:
      icon = "gov-cross.svg";
      color = "#DC6461";
      background = "#FBECEC";
      name = "Failed";
  }
  const handleClick = () => {
    if (alreadyVoted !== "" && alreadyVoted !== "Unspecified") {
      const voteArr = [
        "VOTE_OPTION_UNSPECIFIED",
        "VOTE_OPTION_YES",
        "VOTE_OPTION_ABSTAIN",
        "VOTE_OPTION_NO",
        "VOTE_OPTION_NO_WITH_VETO",
      ];
      history.push(
        `/proposal-vote-status/${voteArr.indexOf(alreadyVoted)}/${id}?true`
      );
      return;
    }
    history.push(`/proposal-detail/${id}`);
  };
  return (
    <div className={style.proposal} onClick={handleClick}>
      <div className={style.pContent}>
        <p className={style.pTitle}>{title}</p>
        <p className={style.pDesc}>{id}</p>
      </div>

      <div className={style.govStatus}>
        <GovStatusChip
          id={4}
          name={name}
          selectedIndex={1}
          background={background}
          icon={icon}
          color={color}
        />
      </div>
    </div>
  );
};
