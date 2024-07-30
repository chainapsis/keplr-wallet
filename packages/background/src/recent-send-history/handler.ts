import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCPacketForwardingMsg,
  SendTxAndRecordWithIBCSwapMsg,
  GetIBCHistoriesMsg,
  RemoveIBCHistoryMsg,
  ClearAllIBCHistoryMsg,
} from "./messages";
import { RecentSendHistoryService } from "./service";

export const getHandler: (service: RecentSendHistoryService) => Handler = (
  service: RecentSendHistoryService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetRecentSendHistoriesMsg:
        return handleGetRecentSendHistoriesMsg(service)(
          env,
          msg as GetRecentSendHistoriesMsg
        );
      case SendTxAndRecordMsg:
        return handleSendTxAndRecordMsg(service)(
          env,
          msg as SendTxAndRecordMsg
        );
      case SendTxAndRecordWithIBCPacketForwardingMsg:
        return handleSendTxAndRecordWithIBCPacketForwardingMsg(service)(
          env,
          msg as SendTxAndRecordWithIBCPacketForwardingMsg
        );
      case SendTxAndRecordWithIBCSwapMsg:
        return handleSendTxAndRecordWithIBCSwapMsg(service)(
          env,
          msg as SendTxAndRecordWithIBCSwapMsg
        );
      case GetIBCHistoriesMsg:
        return handleGetIBCHistoriesMsg(service)(
          env,
          msg as GetIBCHistoriesMsg
        );
      case RemoveIBCHistoryMsg:
        return handleRemoveIBCHistoryMsg(service)(
          env,
          msg as RemoveIBCHistoryMsg
        );
      case ClearAllIBCHistoryMsg:
        return handleClearAllIBCHistoryMsg(service)(
          env,
          msg as ClearAllIBCHistoryMsg
        );
      default:
        throw new KeplrError("tx", 110, "Unknown msg type");
    }
  };
};

const handleGetRecentSendHistoriesMsg: (
  service: RecentSendHistoryService
) => InternalHandler<GetRecentSendHistoriesMsg> = (service) => {
  return (_env, msg) => {
    return service.getRecentSendHistories(msg.chainId, msg.historyType);
  };
};

const handleSendTxAndRecordMsg: (
  service: RecentSendHistoryService
) => InternalHandler<SendTxAndRecordMsg> = (service) => {
  return (_env, msg) => {
    return service.sendTxAndRecord(
      msg.historyType,
      msg.sourceChainId,
      msg.destinationChainId,
      msg.tx,
      msg.mode,
      msg.silent,
      msg.sender,
      msg.recipient,
      msg.amount,
      msg.memo,
      undefined,
      {
        currencies: [],
      },
      msg.isSkipTrack
    );
  };
};

const handleSendTxAndRecordWithIBCPacketForwardingMsg: (
  service: RecentSendHistoryService
) => InternalHandler<SendTxAndRecordWithIBCPacketForwardingMsg> = (service) => {
  return async (_env, msg) => {
    return await service.sendTxAndRecord(
      msg.historyType,
      msg.sourceChainId,
      msg.destinationChainId,
      msg.tx,
      msg.mode,
      msg.silent,
      msg.sender,
      msg.recipient,
      msg.amount,
      msg.memo,
      msg.channels,
      msg.notificationInfo
    );
  };
};

const handleSendTxAndRecordWithIBCSwapMsg: (
  service: RecentSendHistoryService
) => InternalHandler<SendTxAndRecordWithIBCSwapMsg> = (service) => {
  return async (_env, msg) => {
    return await service.sendTxAndRecordIBCSwap(
      msg.swapType,
      msg.sourceChainId,
      msg.destinationChainId,
      msg.tx,
      msg.mode,
      msg.silent,
      msg.sender,
      msg.amount,
      msg.memo,
      msg.channels,
      msg.destinationAsset,
      msg.swapChannelIndex,
      msg.swapReceiver,
      msg.notificationInfo,
      msg.isSkipTrack
    );
  };
};

const handleGetIBCHistoriesMsg: (
  service: RecentSendHistoryService
) => InternalHandler<GetIBCHistoriesMsg> = (service) => {
  return (_env, _msg) => {
    return service.getRecentIBCHistories();
  };
};

const handleRemoveIBCHistoryMsg: (
  service: RecentSendHistoryService
) => InternalHandler<RemoveIBCHistoryMsg> = (service) => {
  return (_env, msg) => {
    service.removeRecentIBCHistory(msg.id);
    return service.getRecentIBCHistories();
  };
};

const handleClearAllIBCHistoryMsg: (
  service: RecentSendHistoryService
) => InternalHandler<ClearAllIBCHistoryMsg> = (service) => {
  return () => {
    service.clearAllRecentIBCHistory();
  };
};
