import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  AddRecentSendHistoryMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCPacketForwardingMsg,
  SendTxAndRecordWithIBCSwapMsg,
  GetIBCHistoriesMsg,
  RemoveIBCHistoryMsg,
  ClearAllIBCHistoryMsg,
  GetSkipHistoriesMsg,
  RemoveSkipHistoryMsg,
  ClearAllSkipHistoryMsg,
  RecordTxWithSkipSwapMsg,
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
      case AddRecentSendHistoryMsg:
        return handleAddRecentSendHistoryMsg(service)(
          env,
          msg as AddRecentSendHistoryMsg
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
      case RecordTxWithSkipSwapMsg:
        return handleRecordTxWithSkipSwapMsg(service)(
          env,
          msg as RecordTxWithSkipSwapMsg
        );
      case GetSkipHistoriesMsg:
        return handleGetSkipHistoriesMsg(service)(
          env,
          msg as GetSkipHistoriesMsg
        );
      case RemoveSkipHistoryMsg:
        return handleRemoveSkipHistoryMsg(service)(
          env,
          msg as RemoveSkipHistoryMsg
        );
      case ClearAllSkipHistoryMsg:
        return handleClearAllSkipHistoryMsg(service)(
          env,
          msg as ClearAllSkipHistoryMsg
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
      msg.shouldLegacyTrack
    );
  };
};

const handleAddRecentSendHistoryMsg: (
  service: RecentSendHistoryService
) => InternalHandler<AddRecentSendHistoryMsg> = (service) => {
  return (_env, msg) => {
    return service.addRecentSendHistory(msg.chainId, msg.historyType, {
      sender: msg.sender,
      recipient: msg.recipient,
      amount: msg.amount,
      memo: msg.memo,

      ibcChannels: msg.ibcChannels,
    });
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
      msg.shouldLegacyTrack
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

const handleRecordTxWithSkipSwapMsg: (
  service: RecentSendHistoryService
) => InternalHandler<RecordTxWithSkipSwapMsg> = (service) => {
  return async (_env, msg) => {
    return service.recordTxWithSkipSwap(
      msg.sourceChainId,
      msg.destinationChainId,
      msg.destinationAsset,
      msg.simpleRoute,
      msg.sender,
      msg.recipient,
      msg.amount,
      msg.notificationInfo,
      msg.routeDurationSeconds,
      msg.txHash,
      msg.isOnlyUseBridge
    );
  };
};

const handleGetSkipHistoriesMsg: (
  service: RecentSendHistoryService
) => InternalHandler<GetSkipHistoriesMsg> = (service) => {
  return (_env, _msg) => {
    return service.getRecentSkipHistories();
  };
};

const handleRemoveSkipHistoryMsg: (
  service: RecentSendHistoryService
) => InternalHandler<RemoveSkipHistoryMsg> = (service) => {
  return async (_env, msg) => {
    service.removeRecentSkipHistory(msg.id);
    return service.getRecentSkipHistories();
  };
};

const handleClearAllSkipHistoryMsg: (
  service: RecentSendHistoryService
) => InternalHandler<ClearAllSkipHistoryMsg> = (service) => {
  return (_env, _msg) => {
    service.clearAllRecentSkipHistory();
  };
};
