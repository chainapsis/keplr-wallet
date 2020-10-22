import { useFetch } from "./use-fetch";
import { useEffect, useState } from "react";
import Axios, { AxiosRequestConfig } from "axios";
import {
  ReqeustEncryptMsg,
  RequestDecryptMsg
} from "../../background/secret-wasm";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";

const Buffer = require("buffer/").Buffer;

export interface WasmTokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export const useWasmTokenInfo = (
  chainId: string,
  baseUrl: string,
  contractAddress: string,
  config?: AxiosRequestConfig,
  isSecret20: boolean = false
) => {
  const [url, setUrl] = useState("");
  // Hex encoded nonce to be used to query to the secret wasm.
  const [nonce, setNonce] = useState("");

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

    if (contractAddress && !isSecret20) {
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
  }, [baseUrl, contractAddress, isSecret20]);

  useEffect(() => {
    (async () => {
      if (contractAddress && isSecret20) {
        try {
          const contractCodeHashResult = await Axios.get<{
            result: string;
          }>(baseUrl + `/wasm/contract/${contractAddress}/code-hash`, config);

          const contractCodeHash = contractCodeHashResult.data.result;

          const encryptMsg = new ReqeustEncryptMsg(
            "12345678",
            chainId,
            contractCodeHash,
            {
              // eslint-disable-next-line @typescript-eslint/camelcase
              token_info: {}
            }
          );

          const encrypted = await sendMessage(BACKGROUND_PORT, encryptMsg);

          setNonce(encrypted.slice(0, 64));

          const encoded = Buffer.from(
            Buffer.from(encrypted, "hex").toString("base64")
          ).toString("hex");

          setUrl(
            baseUrl +
              `/wasm/contract/${contractAddress}/query/${encoded}?encoding=hex`
          );
        } catch (e) {
          setError(e);
        }
      }
    })();
  }, [baseUrl, chainId, config, contractAddress, isSecret20]);

  useEffect(() => {
    if (fetch.dataAlways) {
      const result = fetch.dataAlways.result;

      if (!isSecret20) {
        if (result?.smart) {
          const tokenInfo = JSON.parse(
            Buffer.from(result.smart, "base64").toString()
          );

          setError(undefined);
          setTokenInfo(tokenInfo);
        } else if (fetch.dataAlways.error) {
          setError(new Error(fetch.dataAlways.error));
        }
      } else if (result?.smart) {
        (async () => {
          const decryptMsg = new RequestDecryptMsg(
            chainId,
            Buffer.from(result.smart, "base64").toString("hex"),
            nonce
          );
          const decrypted = await sendMessage(BACKGROUND_PORT, decryptMsg);

          const message = Buffer.from(
            Buffer.from(decrypted, "hex").toString(),
            "base64"
          ).toString();

          const tokenInfo = JSON.parse(message);

          setError(undefined);
          setTokenInfo(tokenInfo.token_info);
        })();
      }
    }
  }, [chainId, fetch.dataAlways, isSecret20, nonce]);

  return {
    url: fetch.url,
    contractAddress,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    error: error ?? fetch.error,
    tokenInfo
  };
};
