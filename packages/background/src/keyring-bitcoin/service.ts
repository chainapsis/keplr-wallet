import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { AnalyticsService } from "../analytics";
import { PermissionService } from "../permission";
import { PermissionInteractiveService } from "../permission-interactive";
import { BackgroundTxService } from "src/tx";

export class KeyRingBitcoinService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly analyticsService: AnalyticsService,
    protected readonly permissionService: PermissionService,
    protected readonly permissionInteractiveService: PermissionInteractiveService,
    protected readonly backgroundTxService: BackgroundTxService
  ) {}

  async init() {
    // noop
  }
}
