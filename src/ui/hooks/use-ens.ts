import { ChainInfo } from "../../chain-info";
import { useEffect, useMemo, useState } from "react";

// TODO: Add definition for ethereum-ens.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ENS = require("ethereum-ens");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Resolver } = require("@ensdomains/resolver");

import Web3 from "web3";
import { EthereumEndpoint } from "../../config";
import { Address } from "@everett-protocol/cosmosjs/crypto";

// In this case, web3 doesn't make a transaction.
// And, it is used for just fetching a registered address from ENS.
// So, just using http provider is fine.
const provider = new Web3.providers.HttpProvider(EthereumEndpoint);
const ens = new ENS(provider);

export class InvalidENSNameError extends Error {
  constructor() {
    super("Invalid ENS name");

    Object.setPrototypeOf(this, InvalidENSNameError.prototype);
  }
}

export const isValidENS = (name: string): boolean => {
  const strs = name.split(".");
  if (strs.length <= 1) {
    return false;
  }

  const tld = strs[strs.length - 1];
  // TODO: What if more top level domain is added?
  return tld === "eth" || tld === "xyz" || tld === "luxe" || tld === "kred";
};

export const useENS = (chainInfo: ChainInfo, name: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const [address, setAddress] = useState<Uint8Array | undefined>();
  const [bech32Address, setBech32Address] = useState<string | undefined>();

  useEffect(() => {
    if (chainInfo.coinType === undefined || chainInfo.coinType < 0) {
      setError(new Error("This chain doesn't support ENS"));
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetch = async () => {
      try {
        setLoading(true);

        setAddress(undefined);
        setBech32Address(undefined);
        setError(undefined);

        if (!isValidENS(name)) {
          throw new InvalidENSNameError();
        }

        // It seems that ethereum ens doesn't support the abi of recent public resolver yet.
        // So to solve this problem, inject the recent public resolver's abi manually.
        const resolver = await ens.resolver(name, Resolver.abi);
        const addr = await resolver.addr(chainInfo.coinType);
        const address = new Address(Buffer.from(addr.replace("0x", ""), "hex"));

        const addressBytes = address.toBytes();
        if (addressBytes.length === 0 || addressBytes.length !== 20) {
          throw new Error("Failed to convert address to bech32");
        }

        // If address bytes consists only of 0, throw error.
        for (let i = 0; i < addressBytes.length; i++) {
          if (addressBytes[i] !== 0) {
            break;
          }
          if (i === addressBytes.length - 1) {
            throw new Error("Failed to convert address to bech32");
          }
        }

        if (isMounted) {
          setAddress(addressBytes);
          setBech32Address(
            address.toBech32(chainInfo.bech32Config.bech32PrefixAccAddr)
          );
          setError(undefined);
        }
      } catch (e) {
        if (isMounted) {
          setAddress(undefined);
          setBech32Address(undefined);
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [chainInfo.bech32Config.bech32PrefixAccAddr, chainInfo.coinType, name]);

  return useMemo(
    () => ({
      name,
      address,
      bech32Address,
      loading,
      error
    }),
    [address, bech32Address, error, loading, name]
  );
};
