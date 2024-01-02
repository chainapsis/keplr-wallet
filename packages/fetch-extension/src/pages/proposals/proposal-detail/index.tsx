import { HeaderLayout } from "@layouts/header-layout";
import React, { useEffect, useState, Fragment } from "react";
import { FunctionComponent } from "react";
import { useNavigate, useParams } from "react-router";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { ProposalSetup, ProposalType } from "src/@types/proposal-type";
import { VoteBlock } from "@components/proposal/vote-block";
import moment from "moment";
import { useSelector } from "react-redux";
import { useProposals } from "@chatStore/proposal-slice";
import { useStore } from "../../../stores";
import { useNotification } from "@components/notification";
import classNames from "classnames";
import { proposalOptions } from "../index";
import { FormattedMessage, useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const voteArr = ["Unspecified", "Yes", "Abstain", "No", "NoWithVeto"];

export const ProposalDetail: FunctionComponent = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();
  const { id } = useParams<{ id?: string }>();
  const [proposal, setProposal] = useState<ProposalType>();
  const [votedOn, setVotedOn] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [closed, setClosed] = useState(true);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const reduxProposals: ProposalSetup = useSelector(useProposals);
  const { chainStore, accountStore, analyticsStore } = useStore();
  const [category, setCategory] = useState(1);
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
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
    setIsLoading(false);
    setProposal(proposalItem);
    const cat = reduxProposals.votedProposals.find(
      (proposal) => proposal.proposal_id === id
    )
      ? 3
      : proposalItem?.status === proposalOptions.ProposalRejected ||
        proposalItem?.status === proposalOptions.ProposalPassed ||
        proposalItem?.status === proposalOptions.ProposalFailed
      ? 2
      : 1;
    setCategory(cat);
  }, [id]);

  useEffect(() => {
    const date = new Date();
    if (
      proposal &&
      moment(proposal?.voting_end_time).valueOf() > date.getTime()
    ) {
      setClosed(false);
    }
  }, [proposal]);
  const handleClick = async () => {
    const vote: any = voteArr[votedOn];
    if (!proposal) return;
    if (vote !== "Unspecified" && accountInfo.isReadyToSendTx) {
      const tx = accountInfo.cosmos.makeGovVoteTx(proposal?.proposal_id, vote);
      setIsSendingTx(true);
      try {
        let gas = accountInfo.cosmos.msgOpts.govVote.gas;

        // Gas adjustment is 1.5
        // Since there is currently no convenient way to adjust the gas adjustment on the UI,
        // Use high gas adjustment to prevent failure.
        try {
          gas = (await tx.simulate()).gasUsed * 1.5;
        } catch (e) {
          // Some chain with older version of cosmos sdk (below @0.43 version) can't handle the simulation.
          // Therefore, the failure is expected. If the simulation fails, simply use the default value.
          console.log(e);
        }

        await tx.send(
          { amount: [], gas: gas.toString() },
          "",
          {},
          {
            onBroadcasted: () => {
              analyticsStore.logEvent("Vote tx broadcasted", {
                chainId: chainStore.current.chainId,
                chainName: chainStore.current.chainName,
                proposalId: proposal.proposal_id,
                proposalTitle: proposal.content.title,
              });
            },
          }
        );

        navigate(`/proposal-vote-status/${votedOn}/${id}`, { replace: true });
      } catch (e: any) {
        console.log(e);
        if (e?.message === "Request rejected") {
          notification.push({
            type: "warning",
            placement: "top-center",
            duration: 5,
            content: `Failed to vote: ${e.message}`,
            canDelete: true,
            transition: {
              duration: 0.25,
            },
          });
          navigate("/", { replace: true });
          return;
        }
        notification.push({
          type: "warning",
          placement: "top-center",
          duration: 5,
          content: `Failed to vote: ${e.message}`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
        navigate(-2);
        navigate(`/proposal?id=${category}`, { replace: true });
      } finally {
        setIsSendingTx(false);
      }
    }
  };

  const handleVoteClick = (id: number) => {
    if (closed) {
      return;
    }
    setVotedOn(id);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.proposals.title",
      })}
      onBackButton={() => {
        navigate(-1);
      }}
      showBottomMenu={false}
    >
      <div className={style["pContainer"]}>
        {isLoading ? (
          <div className={style["isLoading"]}>
            <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
          </div>
        ) : (
          <Fragment>
            <div
              className={classNames(style["pContentScroll"], {
                [style["closed"]]: closed,
              })}
            >
              <div className={style["pHeading"]}>
                <p className={style["pTitle"]}>{proposal?.content.title}</p>
                <p className={style["pId"]}>{proposal?.proposal_id}</p>
              </div>
              <div className={style["pVotingDate"]}>
                <div className={style["votingStart"]}>
                  <p className={style["pVotingHead"]}>
                    <FormattedMessage id="proposal.vote.start.time" />
                  </p>
                  <p className={style["pVotingEnd"]}>
                    {moment(proposal?.voting_start_time)
                      .utc()
                      .format("ddd, DD MMM YYYY hh:mm:ss ")}
                    GMT
                  </p>
                </div>
                <div>
                  <p className={style["pVotingHead"]}>
                    <FormattedMessage id="proposal.vote.end.time" />
                  </p>
                  <p className={style["pVotingEnd"]}>
                    {moment(proposal?.voting_end_time)
                      .utc()
                      .format("ddd, DD MMM YYYY hh:mm:ss ")}
                    GMT
                  </p>
                </div>
              </div>
              <p className={style["pDesc"]}>
                {proposal && (
                  <ReactMarkdown
                    linkTarget={"_blank"}
                    skipHtml={true}
                    remarkPlugins={[remarkGfm]}
                  >
                    {proposal.content.description}
                  </ReactMarkdown>
                )}
              </p>
            </div>

            <div className={style["pLinkContainer"]}>
              <p
                className={style["pLink"]}
                onClick={() => {
                  if (chainStore.current.govUrl) {
                    window.open(`${chainStore.current.govUrl}${id}`, "_blank");
                  }
                }}
              >
                <FormattedMessage id="proposal.view.more" />
                <img src={require("@assets/svg/gov-share-blue.svg")} />
              </p>
            </div>

            {!closed && (
              <div className={style["endBody"]}>
                <div className={style["voteContainer"]}>
                  <VoteBlock
                    selected={votedOn}
                    title="Yes"
                    icon="gov-tick"
                    id={1}
                    color="#6ab77a4d"
                    activeColor="#6AB77A"
                    handleClick={handleVoteClick}
                    closed={closed}
                  />

                  <VoteBlock
                    selected={votedOn}
                    title="Abstain"
                    icon="gov-abstain"
                    id={2}
                    color="#ECAA5D4D"
                    activeColor="#ECAA5D"
                    handleClick={handleVoteClick}
                    closed={closed}
                  />

                  <VoteBlock
                    selected={votedOn}
                    title="No"
                    icon="gov-cross-2"
                    id={3}
                    color="#DC64614D"
                    activeColor="#DC6461"
                    handleClick={handleVoteClick}
                    closed={closed}
                  />

                  <VoteBlock
                    selected={votedOn}
                    title="No with veto"
                    icon="gov-no-veto"
                    id={4}
                    color="#3E64C44D"
                    activeColor="#3E64C4"
                    handleClick={handleVoteClick}
                    closed={closed}
                  />
                </div>
                <Button
                  className={style["button"]}
                  color="primary"
                  disabled={votedOn === 0}
                  onClick={handleClick}
                  data-loading={isSendingTx}
                >
                  {"Vote"}
                </Button>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </HeaderLayout>
  );
};
