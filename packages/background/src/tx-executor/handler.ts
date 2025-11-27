import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { BackgroundTxExecutorService } from "./service";
import {
  RecordAndExecuteDirectTxsMsg,
  ResumeDirectTxsMsg,
  CancelDirectTxsMsg,
  GetDirectTxBatchMsg,
} from "./messages";

export const getHandler: (service: BackgroundTxExecutorService) => Handler = (
  service: BackgroundTxExecutorService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RecordAndExecuteDirectTxsMsg:
        return handleRecordAndExecuteDirectTxsMsg(service)(
          env,
          msg as RecordAndExecuteDirectTxsMsg
        );
      case GetDirectTxBatchMsg:
        return handleGetDirectTxBatchMsg(service)(
          env,
          msg as GetDirectTxBatchMsg
        );
      case ResumeDirectTxsMsg:
        return handleResumeDirectTxsMsg(service)(
          env,
          msg as ResumeDirectTxsMsg
        );
      case CancelDirectTxsMsg:
        return handleCancelDirectTxsMsg(service)(
          env,
          msg as CancelDirectTxsMsg
        );
      default:
        throw new KeplrError("direct-tx-executor", 100, "Unknown msg type");
    }
  };
};

const handleRecordAndExecuteDirectTxsMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<RecordAndExecuteDirectTxsMsg> = (service) => {
  return (env, msg) => {
    return service.recordAndExecuteDirectTxs(
      env,
      msg.vaultId,
      msg.batchType,
      msg.txs
    );
  };
};

const handleResumeDirectTxsMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<ResumeDirectTxsMsg> = (service) => {
  return async (env, msg) => {
    return await service.resumeDirectTxs(
      env,
      msg.id,
      msg.txIndex,
      msg.signedTx,
      msg.signature
    );
  };
};

const handleGetDirectTxBatchMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<GetDirectTxBatchMsg> = (service) => {
  return (_env, msg) => {
    return service.getDirectTxBatch(msg.id);
  };
};

const handleCancelDirectTxsMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<CancelDirectTxsMsg> = (service) => {
  return async (_env, msg) => {
    await service.cancelDirectTxs(msg.id);
  };
};
