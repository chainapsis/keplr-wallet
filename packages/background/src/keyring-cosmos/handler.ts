import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { GetCosmosKeyMsg } from "./messages";
import { KeyRingCosmosService } from "./service";

export const getHandler: (service: KeyRingCosmosService) => Handler = (
  service: KeyRingCosmosService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetCosmosKeyMsg:
        return handleGetCosmosKeyMsg(service)(env, msg as GetCosmosKeyMsg);
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
