export interface EpochMessage {
  tx_id: string;
  msg_id: string;
  block_height: string;
  block_time: string;
  msg: string;
}

export interface LatestEpochMessagesResponse {
  latest_epoch_msgs: {
    epoch_number: string;
    msgs: EpochMessage[];
  }[];
}
