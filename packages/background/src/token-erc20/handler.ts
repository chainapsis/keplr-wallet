import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { TokenERC20Service } from "./service";
import {
  GetAllERC20TokenInfosMsg,
  AddERC20TokenMsg,
  RemoveERC20TokenMsg,
  SuggestERC20TokenMsg,
} from "./messages";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: TokenERC20Service,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAllERC20TokenInfosMsg:
        return handleGetAllERC20TokenInfosMsg(service)(
          env,
          msg as GetAllERC20TokenInfosMsg
        );
      case SuggestERC20TokenMsg:
        return handleSuggestERC20TokenMsg(
          service,
          permissionInteractionService
        )(env, msg as SuggestERC20TokenMsg);
      case AddERC20TokenMsg:
        return handleAddERC20TokenMsg(service)(env, msg as AddERC20TokenMsg);
      case RemoveERC20TokenMsg:
        return handleRemoveERC20TokenMsg(service)(
          env,
          msg as RemoveERC20TokenMsg
        );
      default:
        throw new KeplrError("tokens", 120, "Unknown msg type");
    }
  };
};

const handleGetAllERC20TokenInfosMsg: (
  service: TokenERC20Service
) => InternalHandler<GetAllERC20TokenInfosMsg> = (service) => {
  return () => {
    return service.getAllERC20TokenInfos();
  };
};

const handleSuggestERC20TokenMsg: (
  service: TokenERC20Service,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SuggestERC20TokenMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );
    await service.suggestERC20Token(env, msg.chainId, msg.contractAddress);
  };
};

const handleAddERC20TokenMsg: (
  service: TokenERC20Service
) => InternalHandler<AddERC20TokenMsg> = (service) => {
  return async (_, msg) => {
    await service.setERC20Token(msg.chainId, msg.currency);
    return service.getAllERC20TokenInfos();
  };
};

const handleRemoveERC20TokenMsg: (
  service: TokenERC20Service
) => InternalHandler<RemoveERC20TokenMsg> = (service) => {
  return (_, msg) => {
    service.removeERC20Token(msg.chainId, msg.contractAddress);
    return service.getAllERC20TokenInfos();
  };
};
