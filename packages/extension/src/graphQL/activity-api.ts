import { gql } from "@apollo/client";
import { blocks, govProposals, transactions } from "./activity-queries";
import { doradoActivityClient, fetchhubActivityClient } from "./client";
import { CHAIN_ID_DORADO } from "../config.ui.var";

export const fetchTransactions = async (
  chainId: string,
  after: string,
  address: string,
  filter: string[]
) => {
  const variables: any = {
    after,
    address,
    filter,
  };

  const activityClient =
    chainId === CHAIN_ID_DORADO ? doradoActivityClient : fetchhubActivityClient;

  const { data, errors } = await activityClient.query({
    query: gql(transactions),
    fetchPolicy: "no-cache",
    variables,
  });

  if (errors) {
    console.log("errors", errors);
    return null;
  }
  return data.account?.nativeBalanceChanges || null;
};

export const fetchGovProposalTransactions = async (
  chainId: string,
  after: string,
  address: string,
  filter: string[]
) => {
  const variables: any = {
    after,
    address,
    filter,
  };

  const activityClient =
    chainId === CHAIN_ID_DORADO ? doradoActivityClient : fetchhubActivityClient;

  const { data, errors } = await activityClient.query({
    query: gql(govProposals),
    fetchPolicy: "no-cache",
    variables,
  });

  if (errors) {
    console.log("errors", errors);
    return null;
  }

  return data.govProposalVotes || null;
};

export const fetchLatestBlock = async (chainId: string) => {
  const activityClient =
    chainId === CHAIN_ID_DORADO ? doradoActivityClient : fetchhubActivityClient;

  const { data, errors } = await activityClient.query({
    query: gql(blocks),
    fetchPolicy: "no-cache",
  });

  if (errors) console.log("errors", errors);

  return data.blocks.nodes[0].height;
};
