export const ENDPOINT_BY_CHAIN_ID: Record<string, Record<string, string>> = {
  "interwoven-1": {
    delegations: "/initia/mstaking/v1/delegations/{bech32Address}",
    pool: "/initia/mstaking/v1/pool",
    params: "/initia/mstaking/v1/params",
    unbondingDelegations:
      "/initia/mstaking/v1/delegators/{delegatorAddress}/unbonding_delegations?pagination.limit=1000",
    validators: "/initia/mstaking/v1/validators",
  },
};
