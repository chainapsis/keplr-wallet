import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { ChainsService } from "./service";
import {
  GetChainInfosWithCoreTypesMsg,
  GetChainInfosWithoutEndpointsMsg,
  RemoveSuggestedChainInfoMsg,
  SuggestChainInfoMsg,
} from "./messages";
import { ChainInfo } from "@keplr-wallet/types";
import { getBasicAccessPermissionType, PermissionService } from "../permission";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const getHandler: (
  chainsService: ChainsService,
  permissionService: PermissionService
) => Handler = (chainsService, permissionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosWithCoreTypesMsg:
        return handleGetInfosWithCoreTypesMsg(chainsService)(
          env,
          msg as GetChainInfosWithCoreTypesMsg
        );
      case GetChainInfosWithoutEndpointsMsg:
        return handleGetChainInfosWithoutEndpointsMsg(chainsService)(
          env,
          msg as GetChainInfosWithoutEndpointsMsg
        );
      case SuggestChainInfoMsg:
        return handleSuggestChainInfoMsg(chainsService, permissionService)(
          env,
          msg as SuggestChainInfoMsg
        );
      case RemoveSuggestedChainInfoMsg:
        return handleRemoveSuggestedChainInfoMsg(chainsService)(
          env,
          msg as RemoveSuggestedChainInfoMsg
        );
      default:
        throw new KeplrError("chains", 110, "Unknown msg type");
    }
  };
};

const handleGetInfosWithCoreTypesMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosWithCoreTypesMsg> = (service) => {
  return () => {
    return {
      chainInfos: service.getChainInfosWithCoreTypes(),
    };
  };
};

const handleGetChainInfosWithoutEndpointsMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosWithoutEndpointsMsg> = (_service) => {
  return async (_env, _msg) => {
    throw new Error("TODO");
    // await service.permissionService.checkOrGrantGlobalPermission(
    //   env,
    //   "/permissions/grant/get-chain-infos",
    //   "get-chain-infos",
    //   msg.origin
    // );
    //
    // const chainInfos = await service.getChainInfosWithoutEndpoints();
    // return {
    //   chainInfos,
    // };
  };
};

const handleSuggestChainInfoMsg: (
  chainsService: ChainsService,
  permissionService: PermissionService
) => InternalHandler<SuggestChainInfoMsg> = (
  chainsService,
  permissionService
) => {
  return async (env, msg) => {
    if (chainsService.getChainInfo(msg.chainInfo.chainId) != null) {
      // If suggested chain info is already registered, just return.
      return;
    }

    const chainInfo = msg.chainInfo as Writeable<ChainInfo>;
    chainInfo.beta = true;

    await chainsService.suggestChainInfo(env, chainInfo, msg.origin);

    permissionService.addPermission(
      [chainInfo.chainId],
      getBasicAccessPermissionType(),
      [msg.origin]
    );
  };
};

const handleRemoveSuggestedChainInfoMsg: (
  service: ChainsService
) => InternalHandler<RemoveSuggestedChainInfoMsg> = (service) => {
  return (_, msg) => {
    service.removeSuggestedChainInfo(msg.chainId);
    return service.getChainInfosWithCoreTypes();
  };
};
