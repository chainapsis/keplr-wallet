import { createFNSClient } from "./client";

const createQueryClient = async () => {
  return await createFNSClient();
};

export const getAllDomainsOwnedBy = async (address: string) => {
  const queryClient = await createQueryClient();
  const result = await queryClient.getAllDomainsOwnedBy({
    owner: address,
  });
  return result;
};

export const getDomainData = async (domain: string) => {
  const queryClient = await createQueryClient();
  const domainData = await queryClient.getDomainData({ domain });
  return domainData;
};

export const getDomainStatus = async (domain: string) => {
  const queryClient = await createQueryClient();
  const domainStatus = await queryClient.getDomainStatus({ domain });
  return domainStatus;
};

export const getDomainPrice = async (domain: string) => {
  const queryClient = await createQueryClient();
  const domainPrice = await queryClient.getNormalizedDomainAndPrice({
    domain,
  });
  return domainPrice;
};

export const getDomainsDataByOwner = async (address: string) => {
  const { domains } = await getAllDomainsOwnedBy(address);
  const domainsData = await Promise.all(
    domains.map(async (domain: string) => await getDomainData(domain))
  );
  return { domains, domainsData };
};

export const getPrimaryDomain = async (address: string) => {
  const queryClient = await createQueryClient();
  const primary = await queryClient.getPrimary({ userAddress: address });
  return primary;
};

export const mintDomain = async (account: any, domain: string, amount: any) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    "fetch15hq5u4susv7d064llmupeyevx6hmskkc3p8zvt8rwn0lj02yt72s88skrf",
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
    undefined,
    undefined,
    {
      onFullfilled: (txhash: any) => {
        console.log("Txn executed", txhash.toString());
      },
    }
  );
};

export const setPrimary = async (account: any, domain: string) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    "executeWasm",
    "fetch15hq5u4susv7d064llmupeyevx6hmskkc3p8zvt8rwn0lj02yt72s88skrf",
    {
      set_primary: {
        domain,
      },
    },
    []
  );
  await tx.send(
    {
      amount: [],
      gas: "6000000",
    },
    undefined,
    undefined,
    {
      onFullfilled: (txhash: any) => {
        console.log("Txn fullfilled", txhash.toString());
      },
    }
  );
};
