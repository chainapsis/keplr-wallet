import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { GetTokenScansMsg } from "./messages";
import { TokenScanService } from "./service";

export const getHandler: (service: TokenScanService) => Handler = (
  service: TokenScanService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetTokenScansMsg:
        return handleGetTokenScansMsg(service)(env, msg as GetTokenScansMsg);
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
