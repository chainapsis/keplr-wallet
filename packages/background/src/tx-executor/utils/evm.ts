import { EVMInfo } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { Dec } from "@keplr-wallet/unit";
import { BackgroundTxFeeType } from "../types";
import { JsonRpcResponse } from "@keplr-wallet/types";

const ETH_FEE_HISTORY_REWARD_PERCENTILES = [25, 50, 75];
const ETH_FEE_SETTINGS_BY_FEE_TYPE: Record<
  BackgroundTxFeeType,
  {
    percentile: number;
  }
> = {
  low: {
    percentile: ETH_FEE_HISTORY_REWARD_PERCENTILES[0],
  },
  average: {
    percentile: ETH_FEE_HISTORY_REWARD_PERCENTILES[1],
  },
  high: {
    percentile: ETH_FEE_HISTORY_REWARD_PERCENTILES[2],
  },
};

const FEE_MULTIPLIERS: Record<BackgroundTxFeeType, number> = {
  low: 1.1,
  average: 1.25,
  high: 1.5,
};
const GAS_ADJUSTMENT_NUM = BigInt(13);
const GAS_ADJUSTMENT_DEN = BigInt(10);

const TX_COUNT_ID = 1;
const LATEST_BLOCK_ID = 2;
const FEE_HISTORY_ID = 3;
const ESTIMATE_GAS_ID = 4;
const MAX_PRIORITY_FEE_ID = 5;

type BigNumberishLike = string | number | bigint | { toString(): string };

const toBigIntFromTxField = (value: BigNumberishLike): bigint => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return BigInt(value);
  }

  if (value && typeof value === "object" && "toString" in value) {
    return BigInt((value as { toString(): string }).toString());
  }

  throw new Error("Unsupported numeric value in unsigned transaction");
};

export async function fillUnsignedEVMTx(
  origin: string,
  evmInfo: EVMInfo,
  signer: string,
  tx: UnsignedTransaction,
  feeType: BackgroundTxFeeType = "average"
): Promise<UnsignedTransaction> {
  const hasProvidedPriorityFee = tx.maxPriorityFeePerGas != null;
  const hasProvidedGasLimit = tx.gasLimit != null;

  const getTransactionCountRequest = {
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [signer, "pending"],
    id: TX_COUNT_ID,
  };

  const getBlockRequest = {
    jsonrpc: "2.0",
    method: "eth_getBlockByNumber",
    params: ["latest", false],
    id: LATEST_BLOCK_ID,
  };

  const getFeeHistoryRequest = hasProvidedPriorityFee
    ? null
    : {
        jsonrpc: "2.0",
        method: "eth_feeHistory",
        params: [20, "latest", ETH_FEE_HISTORY_REWARD_PERCENTILES],
        id: FEE_HISTORY_ID,
      };

  const estimateGasRequest = hasProvidedGasLimit
    ? null
    : {
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
        id: ESTIMATE_GAS_ID,
      };

  const getMaxPriorityFeePerGasRequest = hasProvidedPriorityFee
    ? null
    : {
        jsonrpc: "2.0",
        method: "eth_maxPriorityFeePerGas",
        params: [],
        id: MAX_PRIORITY_FEE_ID,
      };

  // rpc request in batch (as 2.0 jsonrpc supports batch requests)
  const batchRequest = [
    getTransactionCountRequest,
    getBlockRequest,
    ...(getFeeHistoryRequest ? [getFeeHistoryRequest] : []),
    ...(estimateGasRequest ? [estimateGasRequest] : []),
    ...(getMaxPriorityFeePerGasRequest ? [getMaxPriorityFeePerGasRequest] : []),
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

  const getResult = <T = any>(id: number, optional = false): T | undefined => {
    const res = rpcResponses.find((r) => r.id === id);
    if (!res) {
      if (optional) {
        return undefined;
      }
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
  const nonceHex = getResult<string>(TX_COUNT_ID);
  if (!nonceHex) {
    throw new Error("Failed to get nonce to fill unsigned transaction");
  }

  const latestBlock = getResult<{ baseFeePerGas?: string }>(LATEST_BLOCK_ID);
  if (!latestBlock) {
    throw new Error("Failed to get latest block to fill unsigned transaction");
  }
  const feeHistory = hasProvidedPriorityFee
    ? undefined
    : getResult<{
        baseFeePerGas?: string[];
        gasUsedRatio: number[];
        oldestBlock: string;
        reward?: string[][];
      }>(FEE_HISTORY_ID);
  const gasLimitHex = hasProvidedGasLimit
    ? undefined
    : getResult<string>(ESTIMATE_GAS_ID, true);
  const networkMaxPriorityFeePerGasHex = hasProvidedPriorityFee
    ? undefined
    : getResult<string>(MAX_PRIORITY_FEE_ID, true);

  let maxPriorityFeePerGasDec: Dec | undefined;

  if (hasProvidedPriorityFee) {
    if (tx.maxPriorityFeePerGas == null) {
      throw new Error("maxPriorityFeePerGas is required but missing");
    }
    maxPriorityFeePerGasDec = new Dec(
      toBigIntFromTxField(tx.maxPriorityFeePerGas)
    );
  } else if (feeHistory?.reward && feeHistory.reward.length > 0) {
    const percentile =
      ETH_FEE_SETTINGS_BY_FEE_TYPE[feeType].percentile ??
      ETH_FEE_HISTORY_REWARD_PERCENTILES[1];
    const percentileIndex =
      ETH_FEE_HISTORY_REWARD_PERCENTILES.indexOf(percentile);

    if (percentileIndex >= 0) {
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
          deviation > deviationThreshold
            ? mean > median
              ? mean
              : median
            : mean;

        maxPriorityFeePerGasDec = new Dec(pick);
      }
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
  const suggestedFeeFromBase = baseFeePerGasDec.mul(multiplier);

  const providedMaxFeePerGasDec = tx.maxFeePerGas
    ? new Dec(toBigIntFromTxField(tx.maxFeePerGas))
    : undefined;

  const maxFeePerGasDec =
    providedMaxFeePerGasDec && hasProvidedPriorityFee
      ? providedMaxFeePerGasDec.gte(
          suggestedFeeFromBase.add(maxPriorityFeePerGasDec)
        )
        ? providedMaxFeePerGasDec
        : suggestedFeeFromBase.add(maxPriorityFeePerGasDec)
      : suggestedFeeFromBase.add(maxPriorityFeePerGasDec);

  const maxFeePerGasHex = `0x${maxFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  const maxPriorityFeePerGasHex = `0x${maxPriorityFeePerGasDec
    .truncate()
    .toBigNumber()
    .toString(16)}`;

  const finalNonce =
    tx.nonce != null
      ? Math.max(Number(tx.nonce), parseInt(nonceHex, 16))
      : parseInt(nonceHex, 16);

  let finalGasLimit: UnsignedTransaction["gasLimit"];
  if (tx.gasLimit != null) {
    finalGasLimit = tx.gasLimit;
  } else if (gasLimitHex) {
    const estimatedGas = toBigIntFromTxField(gasLimitHex);
    const adjustedGas =
      (estimatedGas * GAS_ADJUSTMENT_NUM + (GAS_ADJUSTMENT_DEN - BigInt(1))) /
      GAS_ADJUSTMENT_DEN;
    finalGasLimit = `0x${adjustedGas.toString(16)}`;
  } else {
    throw new Error("Failed to estimate gas to fill unsigned transaction");
  }

  const newUnsignedTx: UnsignedTransaction = {
    ...tx,
    nonce: finalNonce,
    maxFeePerGas: maxFeePerGasHex,
    maxPriorityFeePerGas: maxPriorityFeePerGasHex,
    gasLimit: finalGasLimit,
  };

  return newUnsignedTx;
}
