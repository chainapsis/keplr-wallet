import { HeaderLayout } from "@layouts/header-layout";
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { SearchInput } from "../../components/notification-search-input";
import { GovStatusChip } from "@components/chips/gov-chip";
import style from "./style.module.scss";
import { Proposal } from "@components/proposal/proposal";
import { fetchProposals, fetchVote } from "@utils/fetch-proposals";
import { ProposalType } from "src/@types/proposal-type";
import { setProposalsInStore, useProposals } from "@chatStore/proposal-slice";
import { useSelector } from "react-redux";
import { store } from "@chatStore/index";
import { useStore } from "../../stores";
import { FormattedMessage, useIntl } from "react-intl";

export const proposalOptions = {
  ProposalActive: "PROPOSAL_STATUS_VOTING_PERIOD",
  ProposalPassed: "PROPOSAL_STATUS_PASSED",
  ProposalRejected: "PROPOSAL_STATUS_REJECTED",
  ProposalFailed: "PROPOSAL_STATUS_FAILED",
};

export const Proposals: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();
  const selectedIdx = history.location.search.split("=")[1];
  const [inputVal, setInputVal] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(
    selectedIdx ? parseInt(selectedIdx) : 1
  );

  const [isLoading, setIsLoading] = useState(false);
  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const reduxProposals = useSelector(useProposals);
  useEffect(() => {
    if (reduxProposals.closedProposals.length === 0) {
      setIsLoading(true);
    }
    (async () => {
      try {
        const response = await fetchProposals(chainStore.current.chainId);
        const votedProposals: ProposalType[] = [];
        const proposalArr = response.proposals.reverse();
        let activeProposals = proposalArr.filter((proposal: ProposalType) => {
          return proposal.status === proposalOptions.ProposalActive;
        });

        const promises = activeProposals.map(async (proposal: ProposalType) => {
          try {
            const vote = await fetchVote(
              proposal.proposal_id,
              accountInfo.bech32Address,
              chainStore.current.rest
            );
            if (vote.vote.option && vote.vote.option != "Unspecified")
              return proposal.proposal_id;
          } catch (e) {}
        });
        const voteArray = await Promise.all(promises);

        activeProposals = activeProposals.filter((proposal: ProposalType) => {
          if (voteArray.indexOf(proposal.proposal_id) != -1) {
            votedProposals.push(proposal);
            return false;
          }
          return true;
        });
        const closedProposals = proposalArr.filter((proposal: ProposalType) => {
          return (
            proposal.status === proposalOptions.ProposalPassed ||
            proposal.status === proposalOptions.ProposalRejected ||
            proposal.status === proposalOptions.ProposalFailed
          );
        });
        setIsLoading(false);

        store.dispatch(
          setProposalsInStore({
            activeProposals,
            closedProposals,
            votedProposals,
          })
        );
        if (selectedIdx === "2") {
          setProposals(closedProposals);
          return;
        }

        if (selectedIdx === "3") {
          setProposals(votedProposals);
          return;
        }

        setProposals(activeProposals);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    let newProposal: ProposalType[] = [];

    if (selectedIndex === 1) {
      newProposal = reduxProposals.activeProposals;
    } else if (selectedIndex === 2) {
      newProposal = reduxProposals.closedProposals;
    } else if (selectedIndex === 3) {
      newProposal = reduxProposals.votedProposals;
    }

    newProposal = newProposal.filter((proposal: ProposalType) => {
      if (
        proposal.content.title
          .toLowerCase()
          .includes(inputVal.trim().toLowerCase()) ||
        proposal.proposal_id.includes(inputVal)
      )
        return true;
    });

    setProposals(newProposal);
  }, [selectedIndex, inputVal]);
  const handleCheck = (id: number) => {
    if (isLoading) return;
    setSelectedIndex(id);
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
      <SearchInput
        inputVal={inputVal}
        setInputVal={setInputVal}
        handleSearch={() => {}}
        searchTitle="Search by title or Proposal ID"
      />
      <GovStatusChip
        name={"Active"}
        id={1}
        selectedIndex={selectedIndex}
        handleCheck={handleCheck}
        filter={true}
      />
      <GovStatusChip
        id={3}
        name={"Voted"}
        selectedIndex={selectedIndex}
        handleCheck={handleCheck}
        filter={true}
      />
      <GovStatusChip
        id={2}
        name={"Closed"}
        selectedIndex={selectedIndex}
        handleCheck={handleCheck}
        filter={true}
      />

      <div className={style.proposalContainer}>
        {isLoading ? (
          <div className={style.isLoading}>
            <i className="fa fa-spinner fa-spin fa-2x fa-fw" />
          </div>
        ) : proposals.length === 0 ? (
          <div className={style.resultText}>
            <p>
              <FormattedMessage id="search.no-result-found" />
              {inputVal !== "" && (
                <Fragment>
                  <br />
                  <FormattedMessage id="search.refine.search" />
                </Fragment>
              )}
            </p>
          </div>
        ) : (
          proposals.map((proposal: any) => (
            <Proposal
              title={proposal.content.title}
              key={proposal.proposal_id}
              id={proposal.proposal_id}
              status={proposal.status}
            />
          ))
        )}
      </div>
    </HeaderLayout>
  );
};
