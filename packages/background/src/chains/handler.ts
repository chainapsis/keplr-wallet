import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { ChainsService } from "./service";
import {
  GetChainInfosMsg,
  GetChainInfosWithoutEndpointsMsg,
  RemoveSuggestedChainInfoMsg,
  SuggestChainInfoMsg,
} from "./messages";
import { ChainInfo } from "@keplr-wallet/types";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const getHandler: (service: ChainsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosMsg:
        return handleGetChainInfosMsg(service)(env, msg as GetChainInfosMsg);
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
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetChainInfosMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosMsg> = (service) => {
  return async () => {
    const chainInfos = await service.getChainInfos();
    return {
      chainInfos,
    };
  };
};

const handleGetChainInfosWithoutEndpointsMsg: (
  service: ChainsService
) => InternalHandler<GetChainInfosWithoutEndpointsMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantGlobalPermission(
      env,
      "/permissions/grant/get-chain-infos",
      "get-chain-infos",
      msg.origin
    );

    const chainInfos = await service.getChainInfosWithoutEndpoints();
    return {
      chainInfos,
    };
  };
};

const handleSuggestChainInfoMsg: (
  service: ChainsService
) => InternalHandler<SuggestChainInfoMsg> = (service) => {
  return async (env, msg) => {
    if (await service.hasChainInfo(msg.chainInfo.chainId)) {
      // If suggested chain info is already registered, just return.
      return;
    }

    const chainInfo = msg.chainInfo as Writeable<ChainInfo>;
    // And, always handle it as beta.
    chainInfo.beta = true;

    await service.suggestChainInfo(env, chainInfo, msg.origin);
  };
};

const handleRemoveSuggestedChainInfoMsg: (
  service: ChainsService
) => InternalHandler<RemoveSuggestedChainInfoMsg> = (service) => {
  return async (_, msg) => {
    await service.removeChainInfo(msg.chainId);
    return await service.getChainInfos();
  };
};
