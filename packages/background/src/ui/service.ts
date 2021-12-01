import { delay, inject, singleton } from "tsyringe";
import { InteractionService } from "../interaction";
import { Env } from "@keplr-wallet/router";
import { PermissionService } from "../permission";
import { KeplrSendUIOptions } from "@keplr-wallet/types";
import { OpenSendUIMsg } from "./messages";
import { Buffer } from "buffer/";

@singleton()
export class UIService {
  constructor(
    @inject(delay(() => InteractionService))
    protected readonly interactionService: InteractionService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService
  ) {}

  async openSendUI(
    env: Env,
    chainId: string,
    options?: KeplrSendUIOptions
  ): Promise<string> {
    let queryString = `?detached=true&chainId=${chainId}`;

    if (options) {
      if (options.defaultRecipient) {
        queryString += `&defaultRecipient=${options.defaultRecipient}`;
      }
      if (options.defaultAmount) {
        queryString += `&defaultAmount=${options.defaultAmount}`;
      }
      if (options.defaultDenom) {
        queryString += `&defaultDenom=${options.defaultDenom}`;
      }
      if (options.defaultMemo) {
        queryString += `&defaultMemo=${options.defaultMemo}`;
      }
    }

    const result = (await this.interactionService.waitApprove(
      env,
      `/send${queryString}`,
      OpenSendUIMsg.type(),
      {}
    )) as {
      txHash: string;
    };

    if (
      !result ||
      !result.txHash ||
      Buffer.from(result.txHash, "hex").length !== 32
    ) {
      throw new Error(`Empty or invalid tx hash: ${result?.txHash}`);
    }

    return result.txHash;
  }
}
