/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { flow, makeObservable, observable } from "mobx";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { toGenerator } from "@keplr-wallet/common";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

export interface ContractInfo {
  contractAddress: string;
  types: string[];
  features: string[];
  imageUrl?: string;
  cw20?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
export interface TokenContractInfo {
  contractAddress: string;
  imageUrl: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const toTokenContractInfo = (
  contractInfo: ContractInfo
): TokenContractInfo => {
  const cw20 = contractInfo.cw20!;
  return {
    contractAddress: contractInfo.contractAddress,
    imageUrl: contractInfo.imageUrl!,
    name: cw20.name,
    symbol: cw20.symbol,
    decimals: cw20.decimals,
  };
};

export interface CosmosContractInfo extends ContractInfo {
  codeId: number;
  label: string;
}

export type AppContractInfo = CosmosContractInfo | ContractInfo;

export interface ContractRegistryData {
  chainId: string;
  virtualMachineType: string;
  contracts: AppContractInfo[];
}

export class ContractStore {
  @observable.shallow
  protected communityContractInfo: Map<
    string,
    {
      contractInfo: AppContractInfo[];
      isLoading: boolean;
    }
  > = new Map();

  constructor(
    protected readonly communityContractInfoRepo: {
      readonly organizationName: string;
      readonly repoName: string;
      readonly branchName: string;
    }
  ) {
    makeObservable(this);
  }

  get communityContractInfoRepoUrl(): string {
    return `https://github.com/${this.communityContractInfoRepo.organizationName}/${this.communityContractInfoRepo.repoName}`;
  }

  getCommunityContractInfoUrl(chainId: string): string {
    const chainIdHelper = ChainIdHelper.parse(chainId);
    return `${this.communityContractInfoRepo}/blob/${this.communityContractInfoRepo.branchName}/cosmos/${chainIdHelper.identifier}.json`;
  }

  getCommunityContractsInfo(chainId: string): {
    contractInfo: AppContractInfo[];
    isLoading: boolean;
  } {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    if (!this.communityContractInfo.has(chainIdentifier)) {
      this.fetchCommunityContractInfo(chainId);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.communityContractInfo.get(chainIdentifier)!;
  }

  getCommunityTokenContractsInfo(chainId: string): {
    contractInfo: AppContractInfo[];
    isLoading: boolean;
  } {
    const { contractInfo, isLoading } = this.getCommunityContractsInfo(chainId);
    if (isLoading) {
      return { contractInfo, isLoading };
    }

    return {
      contractInfo: contractInfo.filter(
        (c) => c.types.includes("cw20") && c.cw20
      ),
      isLoading,
    };
  }

  @flow
  protected *fetchCommunityContractInfo(chainId: string) {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
    const communityChainInfo = this.communityContractInfo.get(chainIdentifier);
    if (communityChainInfo) {
      return;
    }

    this.communityContractInfo.set(chainIdentifier, {
      isLoading: true,
      contractInfo: [],
    });

    try {
      const response = yield* toGenerator(
        simpleFetch<ContractRegistryData>(
          `https://raw.githubusercontent.com/${this.communityContractInfoRepo.organizationName}/${this.communityContractInfoRepo.repoName}/${this.communityContractInfoRepo.branchName}`,
          `/cosmos/${chainIdentifier}.json`
        )
      );

      if (
        ChainIdHelper.parse(response.data.chainId).identifier !==
        chainIdentifier
      ) {
        throw new Error(
          `Invalid chain identifier: (expected: ${chainIdentifier}, actual: ${
            ChainIdHelper.parse(response.data.chainId).identifier
          })`
        );
      }

      if (!Array.isArray(response.data.contracts)) {
        throw new Error('Invalid contract info: Field "contracts" is missing');
      }

      this.communityContractInfo.set(chainIdentifier, {
        isLoading: false,
        contractInfo: response.data.contracts,
      });
    } catch (e) {
      console.log(e);
      this.communityContractInfo.set(chainIdentifier, {
        isLoading: false,
        contractInfo: [],
      });
    }
  }
}
