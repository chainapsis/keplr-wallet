import {
  AccountSetBase,
  CosmosAccount,
  CosmwasmAccount,
  MakeTxResponse,
  SecretAccount,
} from "@keplr-wallet/stores";
import { FNS_CONFIG } from "../config.ui.var";
import { createFNSClient } from "./client";
import { ContextProps } from "@components/notification";

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
  account: AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount,
  domain: string,
  amount: any,
  notification: ContextProps
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    `mint:${domain}`,
    FNS_CONFIG[chainId].contractAddress,
    {
      register: {
        domain,
      },
    },
    [amount]
  );
  await executeTxn(tx, amount, notification);
};

export const setPrimary = async (
  chainId: string,
  account: AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount,
  domain: string,
  notification: ContextProps
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    `setPrimary:${domain}`,
    FNS_CONFIG[chainId].contractAddress,
    {
      set_primary: {
        domain,
      },
    },
    []
  );
  await executeTxn(tx, { amount: "600000", denom: "afet" }, notification);
};

export const updateDomain = async (
  chainId: string,
  account: AccountSetBase & CosmosAccount & CosmwasmAccount & SecretAccount,
  domain: string,
  data: any,
  notification: ContextProps
) => {
  const tx = account.cosmwasm.makeExecuteContractTx(
    `updateDomain:${domain}`,
    FNS_CONFIG[chainId].contractAddress,
    {
      update_record: {
        data,
        domain,
      },
    },
    []
  );
  await executeTxn(tx, { amount: "600000", denom: "afet" }, notification);
};

const executeTxn = async (
  tx: MakeTxResponse,
  amount: any,
  notification: ContextProps
) => {
  const gasResponse = await tx.simulate();
  await tx.send(
    {
      amount: [amount],
      gas: Math.floor(gasResponse.gasUsed * 1.5).toString(),
    },
    "",
    {},
    {
      onFulfill: (tx: any) => {
        console.log(tx);
        notification.push({
          placement: "top-center",
          type: "success",
          duration: 2,
          content: `Transaction Successful!`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      },
      onBroadcastFailed: (tx: any) => {
        console.log(tx);
        notification.push({
          placement: "top-center",
          type: "danger",
          duration: 2,
          content: `Transaction Failed!`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
      },
    }
  );
};
