import { ChainIdHelper } from "./cosmos";

export class EthermintChainIdHelper {
  static parse(chainId: string): {
    identifier: string;
    version: number;
    ethChainId: number;
  } {
    const cosmosChainId = ChainIdHelper.parse(chainId);

    if (chainId === "carbon-1") {
      return {
        ethChainId: 9790,
        ...cosmosChainId,
      };
    }

    if (chainId.startsWith("injective")) {
      const injectiveTestnetChainIds = ["injective-777", "injective-888"];

      if (injectiveTestnetChainIds.includes(chainId)) {
        return {
          ethChainId: 5,
          ...cosmosChainId,
        };
      }

      return {
        ethChainId: 1,
        ...cosmosChainId,
      };
    }

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

    return {
      ...cosmosChainId,
      ethChainId: parseFloat(matches[2]),
    };
  }
}
