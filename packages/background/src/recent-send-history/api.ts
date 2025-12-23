import { simpleFetch } from "@keplr-wallet/simple-fetch";
import {
  SwapProvider,
  SwapV2TxStatusResponse,
  TxStatusResponse,
  SwapV2TxStatusRequest,
} from "./types";
import { EthTxReceipt, JsonRpcResponse } from "@keplr-wallet/types";

export async function requestSkipTxTrack(params: {
  endpoint: string;
  chainId: string;
  txHash: string;
}) {
  const { endpoint, chainId, txHash } = params;
  return simpleFetch<any>(endpoint, "/v1/swap/tx", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      tx_hash: txHash,
      chain_id: chainId,
    }),
  });
}

export async function requestSkipTxStatus(params: {
  endpoint: string;
  chainId: string;
  txHash: string;
}) {
  const { endpoint, chainId, txHash } = params;

  const requestParams = new URLSearchParams({
    chain_id: chainId,
    tx_hash: txHash,
  }).toString();

  return simpleFetch<TxStatusResponse>(
    endpoint,
    `/v1/swap/tx?${requestParams}`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }
  );
}

export async function requestSwapV2TxStatus(params: {
  endpoint: string;
  fromChainId: string;
  toChainId: string;
  provider: SwapProvider;
  txHash: string;
}) {
  const { endpoint, fromChainId, toChainId, provider, txHash } = params;

  const request: SwapV2TxStatusRequest = {
    provider,
    from_chain: fromChainId,
    to_chain: toChainId,
    tx_hash: txHash,
  };

  return simpleFetch<SwapV2TxStatusResponse>(endpoint, "v2/swap/tx_status", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });
}

export async function requestEthTxReceipt(params: {
  rpc: string;
  txHash: string;
  origin?: string;
  id?: number;
}) {
  const { rpc, txHash, origin, id = 1 } = params;
  return simpleFetch<JsonRpcResponse<EthTxReceipt>>(rpc, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { "request-source": origin } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
      id,
    }),
  });
}

export async function requestEthTxTrace(params: {
  rpc: string;
  txHash: string;
  origin?: string;
  id?: number;
}) {
  const { rpc, txHash, origin, id = 1 } = params;
  return simpleFetch<JsonRpcResponse<any>>(rpc, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { "request-source": origin } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "debug_traceTransaction",
      params: [txHash, { tracer: "callTracer" }],
      id,
    }),
  });
}
