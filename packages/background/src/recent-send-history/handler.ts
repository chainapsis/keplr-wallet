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
  GetIBCTransferHistories,
  RemoveIBCTransferHistory,
  ClearAllIBCTransferHistory,
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
      case GetIBCTransferHistories:
        return handleGetIBCTransferHistories(service)(
          env,
          msg as GetIBCTransferHistories
        );
      case RemoveIBCTransferHistory:
        return handleRemoveIBCTransferHistory(service)(
          env,
          msg as RemoveIBCTransferHistory
        );
      case ClearAllIBCTransferHistory:
        return handleClearAllIBCTransferHistory(service)(
          env,
          msg as ClearAllIBCTransferHistory
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
      undefined
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
      msg.channels
    );
  };
};

const handleGetIBCTransferHistories: (
  service: RecentSendHistoryService
) => InternalHandler<GetIBCTransferHistories> = (service) => {
  return (_env, _msg) => {
    return service.getRecentIBCTransferHistories();
  };
};

const handleRemoveIBCTransferHistory: (
  service: RecentSendHistoryService
) => InternalHandler<RemoveIBCTransferHistory> = (service) => {
  return (_env, msg) => {
    service.removeRecentIBCTransferHistory(msg.id);
    return service.getRecentIBCTransferHistories();
  };
};

const handleClearAllIBCTransferHistory: (
  service: RecentSendHistoryService
) => InternalHandler<ClearAllIBCTransferHistory> = (service) => {
  return () => {
    service.clearAllRecentIBCTransferHistory();
  };
};
