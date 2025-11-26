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
  GetDirectTxsBatchMsg,
  GetDirectTxsBatchResultMsg,
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
      case GetDirectTxsBatchMsg:
        return handleGetDirectTxsBatchMsg(service)(
          env,
          msg as GetDirectTxsBatchMsg
        );
      case ResumeDirectTxsMsg:
        return handleResumeDirectTxsMsg(service)(
          env,
          msg as ResumeDirectTxsMsg
        );
      case GetDirectTxsBatchResultMsg:
        return handleGetDirectTxsBatchResultMsg(service)(
          env,
          msg as GetDirectTxsBatchResultMsg
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
    return service.recordAndExecuteDirectTxs(env, msg.vaultId, msg.txs);
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

const handleGetDirectTxsBatchMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<GetDirectTxsBatchMsg> = (service) => {
  return (_env, msg) => {
    return service.getDirectTxsBatch(msg.id);
  };
};

const handleGetDirectTxsBatchResultMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<GetDirectTxsBatchResultMsg> = (service) => {
  return (_env, msg) => {
    return service.getDirectTxsBatchResult(msg.id);
  };
};

const handleCancelDirectTxsMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<CancelDirectTxsMsg> = (service) => {
  return async (_env, msg) => {
    await service.cancelDirectTxs(msg.id);
  };
};
