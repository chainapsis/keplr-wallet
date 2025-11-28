import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { BackgroundTxExecutorService } from "./service";
import {
  RecordAndExecuteTxsMsg,
  ResumeTxMsg,
  CancelTxExecutionMsg,
  GetTxExecutionMsg,
} from "./messages";

export const getHandler: (service: BackgroundTxExecutorService) => Handler = (
  service: BackgroundTxExecutorService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RecordAndExecuteTxsMsg:
        return handleRecordAndExecuteTxsMsg(service)(
          env,
          msg as RecordAndExecuteTxsMsg
        );
      case GetTxExecutionMsg:
        return handleGetTxExecutionMsg(service)(env, msg as GetTxExecutionMsg);
      case ResumeTxMsg:
        return handleResumeTxMsg(service)(env, msg as ResumeTxMsg);
      case CancelTxExecutionMsg:
        return handleCancelTxExecutionMsg(service)(
          env,
          msg as CancelTxExecutionMsg
        );
      default:
        throw new KeplrError("direct-tx-executor", 100, "Unknown msg type");
    }
  };
};

const handleRecordAndExecuteTxsMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<RecordAndExecuteTxsMsg> = (service) => {
  return (env, msg) => {
    return service.recordAndExecuteTxs(
      env,
      msg.vaultId,
      msg.executionType,
      msg.txs,
      msg.executableChainIds
    );
  };
};

const handleResumeTxMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<ResumeTxMsg> = (service) => {
  return async (env, msg) => {
    return await service.resumeTx(env, msg.id, msg.txIndex, msg.signedTx);
  };
};

const handleGetTxExecutionMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<GetTxExecutionMsg> = (service) => {
  return (_env, msg) => {
    return service.getTxExecution(msg.id);
  };
};

const handleCancelTxExecutionMsg: (
  service: BackgroundTxExecutorService
) => InternalHandler<CancelTxExecutionMsg> = (service) => {
  return async (_env, msg) => {
    await service.cancelTxExecution(msg.id);
  };
};
