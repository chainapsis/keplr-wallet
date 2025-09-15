import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { ChainInfo } from "@keplr-wallet/types";

export const encodePubKey = (
  chainInfo: ChainInfo,
  useEthereumSign: boolean,
  pubKey: Uint8Array
) => {
  const chainIsInjective = chainInfo.chainId.startsWith("injective");
  const chainIsStratos = chainInfo.chainId.startsWith("stratos");

  return {
    typeUrl: (() => {
      if (!useEthereumSign) {
        return "/cosmos.crypto.secp256k1.PubKey";
      }

      if (chainIsInjective) {
        return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
      }

      if (chainIsStratos) {
        return "/stratos.crypto.v1.ethsecp256k1.PubKey";
      }

      if (
        chainInfo.features &&
        chainInfo.features.includes("eth-secp256k1-cosmos")
      ) {
        return "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey";
      }
      if (
        chainInfo.features &&
        chainInfo.features.includes("eth-secp256k1-initia")
      ) {
        return "/initia.crypto.v1beta1.ethsecp256k1.PubKey";
      }
      return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
    })(),
    value: PubKey.encode({
      key: pubKey,
    }).finish(),
  };
};
