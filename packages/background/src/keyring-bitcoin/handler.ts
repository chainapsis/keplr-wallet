import {
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";

import { Env } from "@keplr-wallet/router";
import { KeyRingBitcoinService } from "./service";
import { PermissionInteractiveService } from "src/permission-interactive";
import { RequestSignBitcoinMessage } from "./messages";

export const getHandler: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  _service: KeyRingBitcoinService,
  _permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RequestSignBitcoinMessage:
        return handleRequestSignBitcoinMessage(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinMessage);
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleRequestSignBitcoinMessage: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinMessage> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    // TODO: implement
    return ["0x1234"];
  };
};
