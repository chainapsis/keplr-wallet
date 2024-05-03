import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { ChainsService } from "./service";
import {
  GetNetworkMsg,
  GetChainInfosMsg,
  GetChainInfosWithoutEndpointsMsg,
  RemoveSuggestedChainInfoMsg,
  SuggestChainInfoMsg,
  ListNetworksMsg,
  AddNetworkAndSwitchMsg,
  SwitchNetworkByChainIdMsg,
  SetSelectedChainMsg,
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
      case SetSelectedChainMsg:
        return handleSetSelectedChainMsg(service)(
          env,
          msg as SetSelectedChainMsg
        );
      case AddNetworkAndSwitchMsg:
        return handleAddNetworkAndSwitch(service)(
          env,
          msg as AddNetworkAndSwitchMsg
        );
      case SwitchNetworkByChainIdMsg:
        return handleSwitchNetworkByChainId(service)(
          env,
          msg as SwitchNetworkByChainIdMsg
        );
      case RemoveSuggestedChainInfoMsg:
        return handleRemoveSuggestedChainInfoMsg(service)(
          env,
          msg as RemoveSuggestedChainInfoMsg
        );
      case GetNetworkMsg:
        return handleGetNetworkMsg(service)(env, msg as GetNetworkMsg);
      case ListNetworksMsg:
        return handleListNetworksMsg(service)(env, msg as ListNetworksMsg);
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

const handleSetSelectedChainMsg: (
  service: ChainsService
) => InternalHandler<SetSelectedChainMsg> = (service) => {
  return async (_, msg) => {
    service.setSelectedChain(msg.chainId);
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

const handleGetNetworkMsg: (
  service: ChainsService
) => InternalHandler<GetNetworkMsg> = (service) => {
  return async () => {
    const chainId = await service.getSelectedChain();
    const chainInfo = await service.getChainInfo(chainId);
    return service.getNetworkConfig(chainInfo);
  };
};

const handleListNetworksMsg: (
  service: ChainsService
) => InternalHandler<ListNetworksMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantGlobalPermission(
      env,
      "/permissions/grant/get-chain-infos",
      "get-chain-infos",
      msg.origin
    );

    return await service.getAllNetworks();
  };
};

const handleAddNetworkAndSwitch: (
  service: ChainsService
) => InternalHandler<AddNetworkAndSwitchMsg> = (service) => {
  return async (env, msg) => {
    if (await service.hasChainInfo(msg.network.chainId)) {
      // If suggested chain info is already registered, just return.
      return;
    }

    await service.addChainByNetwork(env, msg.network, msg.origin);
  };
};

const handleSwitchNetworkByChainId: (
  service: ChainsService
) => InternalHandler<SwitchNetworkByChainIdMsg> = (service) => {
  return async (env, msg) => {
    if (await service.hasChainInfo(msg.chainId)) {
      // If suggested chain info is registered then switch else just return.
      await service.switchChainByChainId(env, msg.chainId, msg.origin);
    }
  };
};
