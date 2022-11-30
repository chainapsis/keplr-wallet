import { ChainIdHelper } from "./cosmos";

export class EthermintChainIdHelper {
  static parse(
    chainId: string
  ): {
    identifier: string;
    version: number;

    ethChainId: number;
  } {
    const matches = chainId.match(
      "^([a-z]{1,})_{1}([1-9][0-9]*)-{1}([1-9][0-9]*)$"
    );

    if (
      !matches ||
      matches.length !== 4 ||
      matches[1] === "" ||
      Number.isNaN(parseFloat(matches[2])) ||
      !Number.isInteger(parseFloat(matches[2]))
    ) {
      throw new Error(`Invalid chainId for ethermint: ${chainId}`);
    }

    const cosmosChainId = ChainIdHelper.parse(chainId);

    return {
      ...cosmosChainId,
      ethChainId: parseFloat(matches[2]),
    };
  }
}
