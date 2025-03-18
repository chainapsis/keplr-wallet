import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  SupportedPaymentType,
} from "@keplr-wallet/types";
import { Network, networks } from "bitcoinjs-lib";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { GetBitcoinKeysSettledMsg } from "@keplr-wallet/background";

enum BestInSlotApiUrl {
  MAINNET = "https://api.bestinslot.xyz/v3",
  TESTNET = "https://testnet.api.bestinslot.xyz/v3",
  SIGNET = "https://signet_api.bestinslot.xyz/v3",
}

export const useBitcoinNetworkConfig = (chainId: string) => {
  const { chainStore } = useStore();

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Not a bitcoin chain");
  }

  return useMemo(() => {
    const [, genesisHash, paymentType] = chainId.split(":");

    const currentNetwork = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];

    let bestInSlotApiUrl = "";
    let networkConfig: Network | undefined;

    switch (currentNetwork) {
      case "mainnet":
        bestInSlotApiUrl = BestInSlotApiUrl.MAINNET;
        networkConfig = networks.bitcoin;
        break;
      case "testnet":
        bestInSlotApiUrl = BestInSlotApiUrl.TESTNET;
        networkConfig = networks.testnet;
        break;
      case "signet":
        bestInSlotApiUrl = BestInSlotApiUrl.SIGNET;
        networkConfig = networks.testnet;
        break;
      default:
        throw new Error("Unknown network");
    }

    return {
      currentNetwork,
      currentPaymentType: paymentType as SupportedPaymentType,
      bestInSlotApiUrl,
      networkConfig,
    };
  }, [chainId]);
};

export const useGetBitcoinKeys = (chainId: string) => {
  const { chainStore } = useStore();
  const [bitcoinKeys, setBitcoinKeys] = useState<
    {
      name: string;
      pubKey: Uint8Array;
      address: string;
      paymentType: SupportedPaymentType;
      isNanoLedger: boolean;
      masterFingerprintHex?: string | undefined;
      derivationPath?: string | undefined;
    }[]
  >([]);

  const getBitcoinKeys = useCallback(async () => {
    const modularChainInfo = chainStore.getModularChain(chainId);
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error("Not a bitcoin chain");
    }

    const linkedChainKey = modularChainInfo.linkedChainKey;

    const linkedChainInfos = chainStore.modularChainInfosInUI.filter(
      (modularChainInfo) =>
        "bitcoin" in modularChainInfo &&
        modularChainInfo.linkedChainKey === linkedChainKey
    );

    const linkedChainIds = linkedChainInfos.map((info) => info.chainId);

    const res = await new InExtensionMessageRequester().sendMessage(
      BACKGROUND_PORT,
      new GetBitcoinKeysSettledMsg(linkedChainIds)
    );

    setBitcoinKeys([
      ...res
        .filter((key) => key.status === "fulfilled")
        .map((key) => {
          if (key.status === "fulfilled") {
            return key.value;
          }
          throw new Error("Unexpected status");
        }),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, chainStore, chainStore.modularChainInfosInUI]);

  useEffect(() => {
    getBitcoinKeys();
  }, [getBitcoinKeys]);

  return bitcoinKeys;
};
