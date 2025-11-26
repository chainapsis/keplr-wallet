import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { DirectTxExecutorService } from "./service";
import {
  RecordAndExecuteDirectTxsMsg,
  GetDirectTxsExecutionDataMsg,
  ExecuteDirectTxMsg,
  GetDirectTxsExecutionResultMsg,
  CancelDirectTxsExecutionMsg,
} from "./messages";

export const getHandler: (service: DirectTxExecutorService) => Handler = (
  service: DirectTxExecutorService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RecordAndExecuteDirectTxsMsg:
        return handleRecordAndExecuteDirectTxsMsg(service)(
          env,
          msg as RecordAndExecuteDirectTxsMsg
        );
      case GetDirectTxsExecutionDataMsg:
        return handleGetDirectTxsExecutionDataMsg(service)(
          env,
          msg as GetDirectTxsExecutionDataMsg
        );
      case ExecuteDirectTxMsg:
        return handleExecuteDirectTxMsg(service)(
          env,
          msg as ExecuteDirectTxMsg
        );
      case GetDirectTxsExecutionResultMsg:
        return handleGetDirectTxsExecutionResultMsg(service)(
          env,
          msg as GetDirectTxsExecutionResultMsg
        );
      case CancelDirectTxsExecutionMsg:
        return handleCancelDirectTxsExecutionMsg(service)(
          env,
          msg as CancelDirectTxsExecutionMsg
        );
      default:
        throw new KeplrError("direct-tx-executor", 100, "Unknown msg type");
    }
  };
};

const handleRecordAndExecuteDirectTxsMsg: (
  service: DirectTxExecutorService
) => InternalHandler<RecordAndExecuteDirectTxsMsg> = (service) => {
  return async (env, msg) => {
    return await service.recordAndExecuteDirectTxs(env, msg.vaultId, msg.txs);
  };
};

const handleExecuteDirectTxMsg: (
  service: DirectTxExecutorService
) => InternalHandler<ExecuteDirectTxMsg> = (service) => {
  return async (env, msg) => {
    return await service.executeDirectTx(env, msg.id, msg.vaultId, msg.txIndex);
  };
};

const handleGetDirectTxsExecutionDataMsg: (
  service: DirectTxExecutorService
) => InternalHandler<GetDirectTxsExecutionDataMsg> = (service) => {
  return async (_env, msg) => {
    return await service.getDirectTxsExecutionData(msg.id);
  };
};

const handleGetDirectTxsExecutionResultMsg: (
  service: DirectTxExecutorService
) => InternalHandler<GetDirectTxsExecutionResultMsg> = (service) => {
  return async (_env, msg) => {
    return await service.getDirectTxsExecutionResult(msg.id);
  };
};

const handleCancelDirectTxsExecutionMsg: (
  service: DirectTxExecutorService
) => InternalHandler<CancelDirectTxsExecutionMsg> = (service) => {
  return async (_env, msg) => {
    await service.cancelDirectTxsExecution(msg.id);
  };
};
