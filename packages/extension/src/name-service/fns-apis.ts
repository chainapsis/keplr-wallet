import { FNS_CONFIG } from "../config.ui.var";
import { createFNSClient } from "./client";

export const getAllDomainsOwnedBy = async (
  chainId: string,
  address: string
) => {
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

export const getDomainsDataByOwner = async (
  chainId: string,
  address: string
) => {
  const { domains } = await getAllDomainsOwnedBy(chainId, address);
  const domainsData = await Promise.all(
    domains.map(async (domain: string) => await getDomainData(chainId, domain))
  );
  return { domains, domainsData };
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
  domain: string,
  amount: any
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    FNS_CONFIG[chainId].contractAddress,
    {
      set_primary: {
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
        console.log("Txn fullfilled", txhash.toString());
      },
    }
  );
};

export const updateDomain = async (
  chainId: string,
  account: any,
  domain: string,
  data: any,
  amount: any
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
    [amount]
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
