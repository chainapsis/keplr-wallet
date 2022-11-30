import { ChainInfo } from "@keplr-wallet/types";
import { ChainInfoSchema } from "./schema";

export async function validateBasicChainInfoType(
  chainInfo: ChainInfo,
  stripUnknown: boolean = true
): Promise<ChainInfo> {
  return await ChainInfoSchema.validateAsync(chainInfo, {
    stripUnknown,
  });
}
