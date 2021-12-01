import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { UIService } from "./service";
import { OpenSendUIMsg } from "./messages";

export const getHandler: (service: UIService) => Handler = (
  service: UIService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case OpenSendUIMsg:
        return handleOpenSendUIMsg(service)(env, msg as OpenSendUIMsg);
    }
  };
};

const handleOpenSendUIMsg: (
  service: UIService
) => InternalHandler<OpenSendUIMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.openSendUI(env, msg.chainId, msg.options);
  };
};
