import { useFetch } from "./use-fetch";
import { useEffect, useState } from "react";
import { AxiosRequestConfig } from "axios";

export interface WasmTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export const useWasmTokenInfo = (
  baseUrl: string,
  contractAddress: string,
  config?: AxiosRequestConfig
) => {
  const [url, setUrl] = useState("");

  const [tokenInfo, setTokenInfo] = useState<WasmTokenInfo | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const fetch = useFetch<{
    result: {
      smart?: string;
    };
    error?: string;
  }>(url, "get", config);

  useEffect(() => {
    // Clear the informations of reward if address is changed.
    setTokenInfo(undefined);

    if (contractAddress) {
      setUrl(
        baseUrl +
          `/wasm/contract/${contractAddress}/smart/${Buffer.from(
            JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/camelcase
              token_info: {}
            })
          ).toString("hex")}?encoding=hex`
      );
    }
  }, [baseUrl, contractAddress]);

  useEffect(() => {
    if (fetch.dataAlways) {
      const result = fetch.dataAlways.result;

      if (result?.smart) {
        const tokenInfo = JSON.parse(
          Buffer.from(result.smart, "base64").toString()
        );

        setError(undefined);
        setTokenInfo(tokenInfo);
      } else if (fetch.dataAlways.error) {
        setError(new Error(fetch.dataAlways.error));
      }
    }
  }, [fetch.dataAlways]);

  return {
    url: fetch.url,
    contractAddress,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    error: error ?? fetch.error,
    tokenInfo
  };
};
