export const transactions = `query TransactionsFromAddress($after: Cursor, $address: String!) {
  account(
   
    id: $address) {
    nativeBalanceChanges( after: $after
      first: 30
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
