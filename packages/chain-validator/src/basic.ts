import { ChainInfo } from "@keplr-wallet/types";
import { ChainInfoSchema } from "./schema";

export async function validateBasicChainInfoType(
  chainInfo: ChainInfo
): Promise<ChainInfo> {
  return await ChainInfoSchema.validateAsync(chainInfo, {
    stripUnknown: true,
  });
}
