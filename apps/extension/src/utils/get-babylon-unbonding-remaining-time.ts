import { ObservableSimpleQuery } from "@keplr-wallet/stores/build/query/simple";

const AVG_BTC_BLOCK_TIME_IN_SECONDS = 10 * 60; // 10 minutes per block

/**
 * Leverages Bitcoin's block time to estimate when an Babylon unbonding process will complete.
 */
export function getBabylonUnbondingRemainingTime(
  simpleQuery: ObservableSimpleQuery,
  rest: string,
  currentHeight: string
): string {
  try {
    const epochsParamsData = simpleQuery.queryGet<EpochParamsResponse>(
      rest,
      `/babylon/epoching/v1/params`
    ).response?.data;
    const epochNumber = calculateEpochNumber(
      Number(currentHeight),
      Number(epochsParamsData?.params.epoch_interval)
    );

    const checkpointData = simpleQuery.queryGet<BtcCheckpointResponse>(
      rest,
      `/babylon/btccheckpoint/v1/${epochNumber}`
    ).response?.data;
    const checkPointBtcBlockHeight = Number(
      checkpointData?.info.best_submission_btc_block_height
    );

    const paramsData = simpleQuery.queryGet<BtcCheckpointParamsResponse>(
      rest,
      `/babylon/btccheckpoint/v1/params`
    ).response?.data;
    const finalizationBlockCount = Number(
      paramsData?.params.checkpoint_finalization_timeout
    );

    const btcLightClientData = simpleQuery.queryGet<BtcLightClientTipResponse>(
      rest,
      `/babylon/btclightclient/v1/tip`
    ).response?.data;
    const currentBtcHeight = Number(btcLightClientData?.header.height);

    const elapsedBlockCount = currentBtcHeight - checkPointBtcBlockHeight;

    const remainingTimeInSeconds =
      (finalizationBlockCount - elapsedBlockCount) *
      AVG_BTC_BLOCK_TIME_IN_SECONDS;
    const currentDate = new Date();
    const estimatedCompletionDate = new Date(
      currentDate.getTime() + remainingTimeInSeconds * 1000
    ).toISOString();

    return estimatedCompletionDate;
  } catch (error) {
    return "";
  }
}

interface EpochParamsResponse {
  params: {
    epoch_interval: string;
    epoch_number: string;
  };
}
interface BtcCheckpointResponse {
  info: {
    best_submission_btc_block_height: string;
    best_submission_btc_block_time: string;
  };
}
interface BtcCheckpointParamsResponse {
  params: {
    checkpoint_finalization_timeout: string;
  };
}
interface BtcLightClientTipResponse {
  header: {
    height: string;
    hash_hex: string;
  };
}

function calculateEpochNumber(height: number, epochInterval: number): number {
  if (height === 0) {
    return 0;
  }

  height--; // 0-indexed
  return Math.floor(height / epochInterval) + 1;
}
