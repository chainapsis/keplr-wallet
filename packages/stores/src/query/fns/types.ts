export interface DomainsOwnedBy {
  domains: string[];
  owner: string;
}

export interface DomainDataType {
  address: string;
  avatar: string;
  background: string;
  description: string;
  email: string;
  github: string;
  twitter: string;
  website: string;
}

export interface DomainPriceType {
  amount: string;
  denom: string;
}

export interface DomainPriceResult {
  Success: {
    normalized_domain: string;
    pricing: DomainPriceType;
    can_register: boolean;
  };
}

export interface OwnedDomainStatus {
  Owned: {
    is_renewable: boolean;
    owner: string;
    registration_time: string;
  };
}

export interface DomainData {
  domain_data: DomainDataType;
}

export interface DomainStatus {
  domain_status: OwnedDomainStatus | string;
}

export interface PrimaryDomain {
  domain: string;
}

export interface DomainPrice {
  is_valid_domain: boolean;
  result: DomainPriceResult;
}
export interface BeneficiaryAddress {
  address: string;
}

export interface DomainsByBeneficiary {
  address: string;
  domains: string[];
}
