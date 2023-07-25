import { FNS_CONFIG } from "../config.ui.var";
import { createFNSClient } from "./client";

export const getAllDomainsOwnedBy = async (chainId: string, address: any) => {
  const queryClient = await createFNSClient(chainId);
  const result = await queryClient.getAllDomainsOwnedBy({
    owner: address,
  });
  return result;
};

export const getDomainData = async (chainId: string, domain: string) => {
  const queryClient = await createFNSClient(chainId);
  const domainData = await queryClient.getDomainData({ domain });
  return domainData;
};
export const getBeneficiaryAddress = async (chainId: string, domain: any) => {
  const queryClient = await createFNSClient(chainId);
  const beneficiaryAddress = await queryClient.resolveName({ domain });
  return beneficiaryAddress;
};
export const getDomainStatus = async (
  chainId: string,
  domain: string
): Promise<any> => {
  const queryClient = await createFNSClient(chainId);
  const domainStatus = await queryClient.getDomainStatus({ domain });
  return domainStatus;
};

export const getDomainPrice = async (chainId: string, domain: string) => {
  const queryClient = await createFNSClient(chainId);
  const domainPrice = await queryClient.getNormalizedDomainAndPrice({
    domain,
  });
  return domainPrice;
};

export const getDomainsByOwner = async (chainId: string, address: string) => {
  const queryClient = await createFNSClient(chainId);
  const { domains } = await queryClient.getAllDomainsOwnedBy({
    owner: address,
  });
  return { domains };
};

export const getDomainsByBeneficiery = async (
  chainId: string,
  address: string
) => {
  const queryClient = await createFNSClient(chainId);
  const { domains } = await queryClient.reverseLookUp({
    target: address,
  });
  return { domains };
};

export const getPrimaryDomain = async (
  chainId: string,
  userAddress: string
) => {
  const queryClient = await createFNSClient(chainId);
  const primary = await queryClient.getPrimary({ userAddress });
  return primary;
};

export const mintDomain = async (
  chainId: string,
  account: any,
  domain: string,
  amount: any
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    FNS_CONFIG[chainId].contractAddress,
    {
      register: {
        domain,
      },
    },
    [amount]
  );
  await tx.send(
    {
      amount: [amount],
      gas: "6000000",
    },
    "",
    {},
    {
      onFullfilled: (txhash: any) => {
        console.log("Txn executed", txhash.toString());
      },
    }
  );
};

export const setPrimary = async (
  chainId: string,
  account: any,
  domain: string
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    FNS_CONFIG[chainId].contractAddress,
    {
      set_primary: {
        domain,
      },
    },
    []
  );
  await tx.send(
    {
      amount: [{ amount: "600000", denom: "afet" }],
      gas: "6000000",
    },
    "",
    {},
    {
      onFullfilled: (txhash: any) => {
        console.log("Txn fullfilled", txhash.toString());
      },
    }
  );
};

export const updateDomain = async (
  chainId: string,
  account: any,
  domain: string,
  data: any
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    FNS_CONFIG[chainId].contractAddress,
    {
      update_record: {
        data,
        domain,
      },
    },
    []
  );
  await tx.send(
    {
      amount: [{ amount: "600000", denom: "afet" }],
      gas: "6000000",
    },
    "",
    {},
    {
      onFullfilled: (txhash: any) => {
        console.log("Txn fullfilled", txhash.toString());
      },
    }
  );
};
