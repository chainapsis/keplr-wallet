import { ManageViewAssetTokenService } from "./service";
import {
  DisableViewAssetTokenMsg,
  GetAllDisabledViewAssetTokenMsg,
  GetDisabledViewAssetTokenListMsg,
} from "./messages";
import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";

export const getHandler: (service: ManageViewAssetTokenService) => Handler = (
  service: ManageViewAssetTokenService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAllDisabledViewAssetTokenMsg:
        return handleGetAllDisabledViewAssetTokenMsg(service)(
          env,
          msg as GetAllDisabledViewAssetTokenMsg
        );
      case GetDisabledViewAssetTokenListMsg:
        return handleGetDisabledViewAssetTokenListMsg(service)(
          env,
          msg as GetDisabledViewAssetTokenListMsg
        );
      case DisableViewAssetTokenMsg:
        return handleDisableViewAssetTokenMsg(service)(
          env,
          msg as DisableViewAssetTokenMsg
        );
      default:
        throw new KeplrError("manage-asset", 110, "Unknown msg type");
    }
  };
};

const handleGetDisabledViewAssetTokenListMsg: (
  service: ManageViewAssetTokenService
) => InternalHandler<GetDisabledViewAssetTokenListMsg> = (service) => {
  return (_, msg) => {
    return service.getDisabledViewAssetTokenList(msg.vaultId);
  };
};

const handleDisableViewAssetTokenMsg: (
  service: ManageViewAssetTokenService
) => InternalHandler<DisableViewAssetTokenMsg> = (service) => {
  return (_, msg) => {
    return service.disableViewAssetToken(msg.vaultId, msg.token);
  };
};

const handleGetAllDisabledViewAssetTokenMsg: (
  service: ManageViewAssetTokenService
) => InternalHandler<GetAllDisabledViewAssetTokenMsg> = (service) => {
  return () => {
    return service.getAllDisabledViewAssetTokenList();
  };
};
