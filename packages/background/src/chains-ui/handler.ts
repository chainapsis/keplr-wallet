import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { ChainsUIService } from "./service";
import {
  GetEnabledChainIdentifiersMsg,
  ToggleChainsMsg,
  EnableChainsMsg,
  DisableChainsMsg,
  GetVaultsByEnabledChainMsg,
} from "./messages";

export const getHandler: (service: ChainsUIService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetEnabledChainIdentifiersMsg:
        return handleGetEnabledChainIdentifiersMsg(service)(
          env,
          msg as GetEnabledChainIdentifiersMsg
        );
      case ToggleChainsMsg:
        return handleToggleChainsMsg(service)(env, msg as ToggleChainsMsg);
      case EnableChainsMsg:
        return handleEnableChainsMsg(service)(env, msg as EnableChainsMsg);
      case DisableChainsMsg:
        return handleDisableChainsMsg(service)(env, msg as DisableChainsMsg);
      case GetVaultsByEnabledChainMsg:
        return handleGetVaultsByEnabledChainMsg(service)(
          env,
          msg as GetVaultsByEnabledChainMsg
        );
      default:
        throw new KeplrError("chains", 110, "Unknown msg type");
    }
  };
};

const handleGetEnabledChainIdentifiersMsg: (
  service: ChainsUIService
) => InternalHandler<GetEnabledChainIdentifiersMsg> = (service) => {
  return (_, msg) => {
    return service.enabledChainIdentifiersForVault(msg.vaultId) as string[];
  };
};

const handleToggleChainsMsg: (
  service: ChainsUIService
) => InternalHandler<ToggleChainsMsg> = (service) => {
  return (_, msg) => {
    service.toggleChain(msg.vaultId, ...msg.chainIds);
    return service.enabledChainIdentifiersForVault(msg.vaultId) as string[];
  };
};

const handleEnableChainsMsg: (
  service: ChainsUIService
) => InternalHandler<EnableChainsMsg> = (service) => {
  return (_, msg) => {
    service.enableChain(msg.vaultId, ...msg.chainIds);
    return service.enabledChainIdentifiersForVault(msg.vaultId) as string[];
  };
};

const handleDisableChainsMsg: (
  service: ChainsUIService
) => InternalHandler<DisableChainsMsg> = (service) => {
  return (_, msg) => {
    service.disableChain(msg.vaultId, ...msg.chainIds);
    return service.enabledChainIdentifiersForVault(msg.vaultId) as string[];
  };
};

const handleGetVaultsByEnabledChainMsg: (
  service: ChainsUIService
) => InternalHandler<GetVaultsByEnabledChainMsg> = (service) => {
  return (_, msg) => {
    return service.getVaultsByEnabledChain(msg.chainId) as string[];
  };
};
