import { EVMInfo } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { Dec } from "@keplr-wallet/unit";
import { BackgroundTxFeeType } from "../types";
import { JsonRpcResponse } from "@keplr-wallet/types";

const FEE_MULTIPLIERS: Record<BackgroundTxFeeType, number> = {
  low: 1.1,
  average: 1.25,
  high: 1.5,
};

export async function fillUnsignedEVMTx(
  origin: string,
  evmInfo: EVMInfo,
  signer: string,
  tx: UnsignedTransaction,
  feeType: BackgroundTxFeeType = "average"
): Promise<UnsignedTransaction> {
  const getTransactionCountRequest = {
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [signer, "pending"],
    id: 1,
  };

  const getBlockRequest = {
    jsonrpc: "2.0",
    method: "eth_getBlockByNumber",
    params: ["latest", false],
    id: 2,
  };

  const getFeeHistoryRequest = {
    jsonrpc: "2.0",
    method: "eth_feeHistory",
    params: [20, "latest", [50]],
    id: 3,
  };

  const estimateGasRequest = {
    jsonrpc: "2.0",
    method: "eth_estimateGas",
    params: [
      {
        from: signer,
        to: tx.to,
        value: tx.value,
        data: tx.data,
      },
    ],
    id: 4,
  };

  const getMaxPriorityFeePerGasRequest = {
    jsonrpc: "2.0",
    method: "eth_maxPriorityFeePerGas",
    params: [],
    id: 5,
  };

  // rpc request in batch (as 2.0 jsonrpc supports batch requests)
  const batchRequest = [
    getTransactionCountRequest,
    getBlockRequest,
    getFeeHistoryRequest,
    estimateGasRequest,
    getMaxPriorityFeePerGasRequest,
  ];

  const { data: rpcResponses } = await simpleFetch<
    Array<JsonRpcResponse<unknown>>
  >(evmInfo.rpc, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "request-source": origin,
    },
    body: JSON.stringify(batchRequest),
  });

  if (
    !Array.isArray(rpcResponses) ||
    rpcResponses.length !== batchRequest.length
  ) {
    throw new Error("Invalid batch response format");
  }

  const getResult = <T = any>(id: number): T => {
    const res = rpcResponses.find((r) => r.id === id);
    if (!res) {
      throw new Error(`No response for id=${id}`);
    }
    if (res.error) {
      throw new Error(
        `RPC error (id=${id}): ${res.error.code} ${res.error.message}`
      );
    }
    return res.result as T;
  };

  // find responses by id
  const nonceHex = getResult<string>(1);
  const latestBlock = getResult<{ baseFeePerGas?: string }>(2);
  const feeHistory = getResult<{
    baseFeePerGas?: string[];
    gasUsedRatio: number[];
    oldestBlock: string;
    reward?: string[][];
  }>(3);
  const gasLimitHex = getResult<string>(4);
  const networkMaxPriorityFeePerGasHex = getResult<string>(5);

  let maxPriorityFeePerGasDec: Dec | undefined;
  if (feeHistory.reward && feeHistory.reward.length > 0) {
    // get 50th percentile rewards (index 0 since we requested [50] percentile)
    const percentileIndex = 0;
    const rewards = feeHistory.reward
      .map((block) => block[percentileIndex])
      .filter((v) => v != null)
      .map((v) => BigInt(v));

    if (rewards.length > 0) {
      const sum = rewards.reduce((acc, x) => acc + x, BigInt(0));
      const mean = sum / BigInt(rewards.length);

      const sortedRewards = [...rewards].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
      );
      const median = sortedRewards[Math.floor(sortedRewards.length / 2)];

      // use 1 Gwei deviation threshold to decide between mean and median
      const deviationThreshold = BigInt(1 * 10 ** 9); // 1 Gwei
      const deviation = mean > median ? mean - median : median - mean;
      const pick =
        deviation > deviationThreshold ? (mean > median ? mean : median) : mean;

      maxPriorityFeePerGasDec = new Dec(pick);
    }
  }

  if (networkMaxPriorityFeePerGasHex) {
    const networkMaxPriorityFeePerGasDec = new Dec(
      BigInt(networkMaxPriorityFeePerGasHex)
    );

    if (
      !maxPriorityFeePerGasDec ||
      (maxPriorityFeePerGasDec &&
        networkMaxPriorityFeePerGasDec.gt(maxPriorityFeePerGasDec))
    ) {
      maxPriorityFeePerGasDec = networkMaxPriorityFeePerGasDec;
    }
  }

  if (!maxPriorityFeePerGasDec) {
    throw new Error(
      "Failed to calculate maxPriorityFeePerGas to fill unsigned transaction"
    );
  }

  if (!latestBlock.baseFeePerGas) {
    throw new Error("Failed to get baseFeePerGas to fill unsigned transaction");
  }

  const multiplier = new Dec(FEE_MULTIPLIERS[feeType]);

  // Calculate maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas
  const baseFeePerGasDec = new Dec(BigInt(latestBlock.baseFeePerGas));
  const maxFeePerGasDec = baseFeePerGasDec
    .add(maxPriorityFeePerGasDec)
    .mul(multiplier);
  const maxFeePerGasHex = `0x${maxFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  maxPriorityFeePerGasDec = maxPriorityFeePerGasDec.mul(multiplier);
  const maxPriorityFeePerGasHex = `0x${maxPriorityFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  const newUnsignedTx: UnsignedTransaction = {
    ...tx,
    nonce: parseInt(nonceHex, 16),
    maxFeePerGas: maxFeePerGasHex,
    maxPriorityFeePerGas: maxPriorityFeePerGasHex,
    gasLimit: gasLimitHex,
  };

  return newUnsignedTx;
}
