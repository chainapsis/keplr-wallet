import {
  chainsUIForegroundInit,
  ChainsUIForegroundService,
} from "@keplr-wallet/background";
import { Router } from "@keplr-wallet/router";

export class ChainsUIForegroundStore {
  constructor(
    protected readonly router: Router,
    protected readonly handler: (vaultId: string) => void
  ) {
    const service = new ChainsUIForegroundService(handler);
    chainsUIForegroundInit(router, service);
  }
}
