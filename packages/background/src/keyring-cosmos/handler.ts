import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { GetCosmosKeyMsg, GetCosmosKeysSettledMsg } from "./messages";
import { KeyRingCosmosService } from "./service";

export const getHandler: (service: KeyRingCosmosService) => Handler = (
  service: KeyRingCosmosService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetCosmosKeyMsg:
        return handleGetCosmosKeyMsg(service)(env, msg as GetCosmosKeyMsg);
      case GetCosmosKeysSettledMsg:
        return handleGetCosmosKeysSettledMsg(service)(
          env,
          msg as GetCosmosKeysSettledMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetCosmosKeyMsg: (
  service: KeyRingCosmosService
) => InternalHandler<GetCosmosKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.getKeySelected(env, msg.chainId);
  };
};

const handleGetCosmosKeysSettledMsg: (
  service: KeyRingCosmosService
) => InternalHandler<GetCosmosKeysSettledMsg> = (service) => {
  return async (env, msg) => {
    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getKeySelected(env, chainId))
    );
  };
};
