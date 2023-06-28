export const transactions = `query TransactionsFromAddress($after: Cursor, $address: String!, $filter: [String!]) {
  account(
   
    id: $address) {
    nativeBalanceChanges( after: $after
      first: 30
      filter: {
        transaction: {
          messages: {
            every: {
              typeUrl: {
                in: $filter
              }
            }
          }
        }
      }
      orderBy: NATIVE_BALANCE_CHANGES_BY_BLOCK_HEIGHT_DESC) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
          id
          balanceOffset
          transaction{
            status
            id
            signerAddress
            messages {
              nodes {
                json
                typeUrl
              }
            }
          }
      }
    }
  }
}`;

export const blocks = `query LatestBlock {
  blocks(first: 1, orderBy: TIMESTAMP_DESC) {
    nodes {
      timestamp
      height
    }
  }
}`;

export const govProposals = `query govFilters($after: Cursor, $address: String!, $filter: [GovProposalVoteOption!]){
  govProposalVotes(after: $after
    first: 30
    filter: {
      option: { in: $filter }
      voterAddress: { equalTo: $address }
    }
    orderBy: GOV_PROPOSAL_VOTES_BY_BLOCK_HEIGHT_DESC
  ) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }

    nodes {
      transaction {
        status
        log
        id
      }
      option
      id
      message {
        json
      }
    }
  }
}`;
