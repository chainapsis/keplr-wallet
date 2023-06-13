import { HeaderLayout } from "@layouts/header-layout";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Button } from "reactstrap";
import { ProposalSetup, ProposalType } from "src/@types/proposal-type";
import style from "./style.module.scss";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useProposals } from "@chatStore/proposal-slice";
import { FormattedMessage, useIntl } from "react-intl";
export const PropsalVoteStatus: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();
  const { votedOn, id } = useParams<{ votedOn?: string; id?: string }>();
  const [proposal, setProposal] = useState<ProposalType>();
  const reduxProposals: ProposalSetup = useSelector(useProposals);
  let icon: string;
  let color: string;
  let text: string;

  switch (votedOn) {
    case "1":
      icon = "gov-tick.svg";
      text = "Yes";
      color = "#6AB77A";
      break;
    case "2":
      icon = "gov-abstain.svg";
      text = "Abstain";
      color = "#ECAA5D";
      break;
    case "3":
      icon = "gov-cross-2.svg";
      text = "No";
      color = "#DC6461";
      break;
    default:
      icon = "gov-no-veto.svg";
      text = "No with veto";
      color = "#3E64C4";
  }
  useEffect(() => {
    let proposalItem = reduxProposals.activeProposals.find(
      (proposal) => proposal.proposal_id === id
    );
    if (!proposalItem) {
      proposalItem = reduxProposals.closedProposals.find(
        (proposal) => proposal.proposal_id === id
      );
    }
    if (!proposalItem) {
      proposalItem = reduxProposals.votedProposals.find(
        (proposal) => proposal.proposal_id === id
      );
    }
    setProposal(proposalItem);
  }, [id]);

  const handleReturnHome = () => {
    history.replace("/");
  };
  const handleChangeVote = () => {
    if (history.location.search === "?true") {
      history.replace(`/proposal-detail/${id}`);
      return;
    }
    history.goBack();
  };
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.proposals.title",
      })}
      onBackButton={() => {
        history.goBack();
      }}
      showBottomMenu={false}
    >
      <div className={style.pContainer}>
        <div className={style.pCenter}>
          <p className={style.pTitle}>{proposal?.content.title}</p>
          <img
            src={require(`@assets/svg/${icon}`)}
            className={style.pImage}
            alt={"Proposal_icon"}
          />
          <p className={style.voteText} style={{ color: color }}>
            {`Voted ${text}`}
          </p>
        </div>
        <div className={style.pButtonContainer}>
          <Button
            className={classNames(style.whiteButton, style.invertedButton)}
            onClick={handleChangeVote}
          >
            <FormattedMessage id="proposal.change.vote" />
          </Button>
          <Button
            className={style.button}
            color="primary"
            onClick={handleReturnHome}
          >
            <FormattedMessage id="proposal.return.home" />
          </Button>
        </div>
      </div>
    </HeaderLayout>
  );
};
