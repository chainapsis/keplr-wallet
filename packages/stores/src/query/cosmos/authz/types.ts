export type Granter = {
  grants: Grant[];
};

export type Grant = {
  granter: string;
  grantee: string;
  authorization:
    | BaseAuthorization
    | GenericAuthorization
    | SendAuthorization
    | StakeAuthorization;
  expiration?: string;
};

export interface TokenAmount {
  denom: string;
  amount: string;
}

interface BaseAuthorization {
  "@type": string;
}

export interface GenericAuthorization extends BaseAuthorization {
  msg: string;
}

export interface SendAuthorization extends BaseAuthorization {
  spend_limit: TokenAmount[];
}

export interface StakeAuthorization extends BaseAuthorization {
  authorization_type: string;
  max_tokens?: TokenAmount;
  deny_list?: { address: string[] };
  allow_list?: { address: string[] };
}
