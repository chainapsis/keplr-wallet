import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  DismissNewTokenFoundInMainMsg,
  GetIsShowNewTokenFoundInMainMsg,
  GetTokenScansMsg,
  RevalidateTokenScansMsg,
  SyncTokenScanInfosMsg,
  UpdateIsShowNewTokenFoundInMainMsg,
} from "./messages";
import { TokenScanService } from "./service";

export const getHandler: (service: TokenScanService) => Handler = (
  service: TokenScanService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetTokenScansMsg:
        return handleGetTokenScansMsg(service)(env, msg as GetTokenScansMsg);
      case RevalidateTokenScansMsg:
        return handleRevalidateTokenScansMsg(service)(
          env,
          msg as RevalidateTokenScansMsg
        );
      case SyncTokenScanInfosMsg:
        return handleSyncTokenScanInfosMsg(service)(
          env,
          msg as SyncTokenScanInfosMsg
        );
      case GetIsShowNewTokenFoundInMainMsg:
        return handleGetIsShowNewTokenFoundInMainMsg(service)(
          env,
          msg as GetIsShowNewTokenFoundInMainMsg
        );
      case UpdateIsShowNewTokenFoundInMainMsg:
        return handleUpdateIsShowNewTokenFoundInMainMsg(service)(
          env,
          msg as UpdateIsShowNewTokenFoundInMainMsg
        );
      case DismissNewTokenFoundInMainMsg:
        return handleDismissNewTokenFoundInMainMsg(service)(
          env,
          msg as DismissNewTokenFoundInMainMsg
        );
      default:
        throw new KeplrError("tx", 110, "Unknown msg type");
    }
  };
};

const handleGetTokenScansMsg: (
  service: TokenScanService
) => InternalHandler<GetTokenScansMsg> = (service) => {
  return (_, msg) => {
    return service.getTokenScans(msg.vaultId);
  };
};

const handleRevalidateTokenScansMsg: (
  service: TokenScanService
) => InternalHandler<RevalidateTokenScansMsg> = (service) => {
  return async (_, msg) => {
    await service.scanAll(msg.vaultId);
    return {
      vaultId: msg.vaultId,
      tokenScans: service.getTokenScans(msg.vaultId),
    };
  };
};

const handleSyncTokenScanInfosMsg: (
  service: TokenScanService
) => InternalHandler<SyncTokenScanInfosMsg> = (service) => {
  return async (_, msg) => {
    await service.syncPreviousAndCurrentTokenScan(msg.vaultId);
    return {
      vaultId: msg.vaultId,
      tokenScans: service.getTokenScans(msg.vaultId),
    };
  };
};

const handleGetIsShowNewTokenFoundInMainMsg: (
  service: TokenScanService
) => InternalHandler<GetIsShowNewTokenFoundInMainMsg> = (service) => {
  return async (_, msg) => {
    return service.getIsShowNewTokenFoundInMain(msg.vaultId);
  };
};

const handleUpdateIsShowNewTokenFoundInMainMsg: (
  service: TokenScanService
) => InternalHandler<UpdateIsShowNewTokenFoundInMainMsg> = (service) => {
  return async (_, msg) => {
    return service.resetDismissIfNeeded(msg.vaultId);
  };
};

const handleDismissNewTokenFoundInMainMsg: (
  service: TokenScanService
) => InternalHandler<DismissNewTokenFoundInMainMsg> = (service) => {
  return async (_, msg) => {
    return service.dismissNewTokenFoundInHome(msg.vaultId);
  };
};
