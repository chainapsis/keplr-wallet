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

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosWithCoreTypesMsg:
        return handleGetInfosWithCoreTypesMsg(service)(
          env,
          msg as GetChainInfosWithCoreTypesMsg
        );
      case GetChainInfosWithoutEndpointsMsg:
        return handleGetChainInfosWithoutEndpointsMsg(service)(
          env,
          msg as GetChainInfosWithoutEndpointsMsg
        );
      case SuggestChainInfoMsg:
        return handleSuggestChainInfoMsg(service)(
          env,
          msg as SuggestChainInfoMsg
        );
      case RemoveSuggestedChainInfoMsg:
        return handleRemoveSuggestedChainInfoMsg(service)(
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
  service: ChainsService
) => InternalHandler<SuggestChainInfoMsg> = (service) => {
  return async (_, msg) => {
    if (service.getChainInfo(msg.chainInfo.chainId) != null) {
      // If suggested chain info is already registered, just return.
      return;
    }

    throw new Error("TODO");
    // const chainInfo = msg.chainInfo as Writeable<ChainInfo>;
    // // And, always handle it as beta.
    // chainInfo.beta = true;
    //
    // await service.addSuggestedChainInfo(env, chainInfo, msg.origin);
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
