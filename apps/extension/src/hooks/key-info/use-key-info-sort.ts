import { KeyInfo } from "@keplr-wallet/background";
import { useStore } from "../../stores";
import { useMemo } from "react";

export const KEY_INFO_SORT_KEY = {
  MNEMONIC: "sort-mnemonic",
  PRIVATE_KEY: "sort-private-key",
  LEDGER: "sort-ledger",
  KEYSTONE: "sort-keystone",
  UNKNOWN: "sort-unknown",
};

const sortKeyInfos = (keyInfos: KeyInfo[], indexMap: Map<string, number>) => {
  return keyInfos.sort((key1, key2) => {
    const key1Id = key1.id;
    const key2Id = key2.id;

    const key1Index = indexMap.get(key1Id);
    const key2Index = indexMap.get(key2Id);

    if (key1Index == null && key2Index != null) {
      return 1;
    }
    if (key1Index != null && key2Index == null) {
      return -1;
    }
    if (key1Index == null && key2Index == null) {
      return 0;
    }
    return key1Index! - key2Index!;
  });
};

export const useKeyInfoSort = (sortKey: string, keyInfos: KeyInfo[]) => {
  const { uiConfigStore } = useStore();

  const indexMap =
    uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(sortKey);
  const sortedKeyInfos = useMemo(() => {
    return sortKeyInfos(keyInfos, indexMap);
  }, [keyInfos, indexMap]);

  return { sortedKeyInfos };
};

export const useGetKeyInfosSeparatedByType = (keyInfos: KeyInfo[]) => {
  const mnemonicKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "mnemonic";
    });
  }, [keyInfos]);

  const socialPrivateKeyInfos = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      if (
        keyInfo.type === "private-key" &&
        typeof keyInfo.insensitive === "object" &&
        keyInfo.insensitive["keyRingMeta"] &&
        typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
        keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
        typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
      ) {
        const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
        if (web3Auth["type"] && web3Auth["email"]) {
          return true;
        }
      }

      return false;
    });
  }, [keyInfos]);

  const privateKeyInfos = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return (
        keyInfo.type === "private-key" &&
        !socialPrivateKeyInfos.some((k) => k.id === keyInfo.id)
      );
    });
  }, [keyInfos, socialPrivateKeyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "ledger";
    });
  }, [keyInfos]);

  const keystoneKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "keystone";
    });
  }, [keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys
      .concat(ledgerKeys)
      .concat(privateKeyInfos)
      .concat(socialPrivateKeyInfos)
      .concat(keystoneKeys);
    return keyInfos.filter((keyInfo) => {
      return !knownKeys.find((k) => k.id === keyInfo.id);
    });
  }, [
    keyInfos,
    ledgerKeys,
    mnemonicKeys,
    privateKeyInfos,
    socialPrivateKeyInfos,
    keystoneKeys,
  ]);

  const socialPrivateKeyInfoByType: {
    type: string;
    keyInfos: KeyInfo[];
  }[] = useMemo(() => {
    const typeMap = new Map<string, KeyInfo[]>();

    socialPrivateKeyInfos.forEach((keyInfo) => {
      if (
        keyInfo.type === "private-key" &&
        typeof keyInfo.insensitive === "object" &&
        keyInfo.insensitive["keyRingMeta"] &&
        typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
        keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
        typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
      ) {
        const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
        if (
          web3Auth["type"] &&
          web3Auth["email"] &&
          typeof web3Auth["type"] === "string" &&
          typeof web3Auth["email"] === "string"
        ) {
          const type = web3Auth["type"];

          const arr = typeMap.get(type) || [];
          arr.push(keyInfo);

          typeMap.set(type, arr);
        }
      }
    });

    const res: {
      type: string;
      keyInfos: KeyInfo[];
    }[] = [];

    for (const [type, keyInfos] of typeMap.entries()) {
      res.push({
        type,
        keyInfos,
      });
    }

    return res;
  }, [socialPrivateKeyInfos]);

  return {
    mnemonicKeys,
    socialPrivateKeyInfoByType,
    privateKeyInfos,
    ledgerKeys,
    keystoneKeys,
    unknownKeys,
  };
};

export const useGetAllSortedKeyInfos = (keyInfos: KeyInfo[]) => {
  const { uiConfigStore } = useStore();
  const {
    mnemonicKeys,
    socialPrivateKeyInfoByType,
    privateKeyInfos,
    ledgerKeys,
    keystoneKeys,
    unknownKeys,
  } = useGetKeyInfosSeparatedByType(keyInfos);

  const sortedKeyInfos = useMemo(() => {
    const res: KeyInfo[] = [];
    if (mnemonicKeys.length > 0) {
      const indexMap =
        uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
          KEY_INFO_SORT_KEY.MNEMONIC
        );
      res.push(...sortKeyInfos(mnemonicKeys, indexMap));
    }

    if (socialPrivateKeyInfoByType.length > 0) {
      const socialKeys = socialPrivateKeyInfoByType.flatMap(
        (info) => info.type
      );
      socialKeys.forEach((key) => {
        const indexMap =
          uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
            `sort-social-${key}`
          );
        res.push(
          ...sortKeyInfos(
            socialPrivateKeyInfoByType.find((info) => info.type === key)
              ?.keyInfos || [],
            indexMap
          )
        );
      });
    }

    if (privateKeyInfos.length > 0) {
      const indexMap =
        uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
          KEY_INFO_SORT_KEY.PRIVATE_KEY
        );
      res.push(...sortKeyInfos(privateKeyInfos, indexMap));
    }

    if (ledgerKeys.length > 0) {
      const indexMap =
        uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
          KEY_INFO_SORT_KEY.LEDGER
        );
      res.push(...sortKeyInfos(ledgerKeys, indexMap));
    }

    if (keystoneKeys.length > 0) {
      const indexMap =
        uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
          KEY_INFO_SORT_KEY.KEYSTONE
        );
      res.push(...sortKeyInfos(keystoneKeys, indexMap));
    }

    if (unknownKeys.length > 0) {
      const indexMap =
        uiConfigStore.selectWalletConfig.getKeyToSortVaultIdsMapIndex(
          KEY_INFO_SORT_KEY.UNKNOWN
        );
      res.push(...sortKeyInfos(unknownKeys, indexMap));
    }
    return res;
  }, [
    mnemonicKeys,
    socialPrivateKeyInfoByType,
    privateKeyInfos,
    ledgerKeys,
    keystoneKeys,
    unknownKeys,
    uiConfigStore.selectWalletConfig,
  ]);

  return sortedKeyInfos;
};
