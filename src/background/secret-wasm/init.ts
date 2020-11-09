import { MessageManager } from "../../common/message";
import { GetPubkeyMsg, ReqeustEncryptMsg, RequestDecryptMsg } from "./messages";
import { SecretWasmKeeper } from "./keeper";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(
  messageManager: MessageManager,
  keeper: SecretWasmKeeper
): void {
  messageManager.registerMessage(GetPubkeyMsg);
  messageManager.registerMessage(ReqeustEncryptMsg);
  messageManager.registerMessage(RequestDecryptMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
