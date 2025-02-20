import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { ViewAssetToken } from "./types";
import { KeyRingService } from "../keyring";
import { computedFn } from "mobx-utils";

const DISABLED_VIEW_ASSET_TOKEN_MAP_KEY = "disabledViewAssetTokenMap";

export class ManageViewAssetTokenService {
  @observable
  protected disabledViewAssetTokenMap = new Map<string, ViewAssetToken[]>();

  constructor(
    protected readonly kvStore: KVStore,
    public readonly keyRingService: KeyRingService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<Record<string, ViewAssetToken[]>>(
      DISABLED_VIEW_ASSET_TOKEN_MAP_KEY
    );
    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.disabledViewAssetTokenMap.set(key, value);
        }
      });
    }

    autorun(() => {
      const js = toJS(this.disabledViewAssetTokenMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set(DISABLED_VIEW_ASSET_TOKEN_MAP_KEY, obj);
    });
  }

  getDisabledViewAssetTokenList = computedFn(
    (vaultId: string): ViewAssetToken[] => {
      return this.disabledViewAssetTokenMap.get(vaultId) ?? [];
    }
  );

  getAllDisabledViewAssetTokenList = computedFn(
    (): Map<string, ViewAssetToken[]> => {
      return this.disabledViewAssetTokenMap;
    }
  );

  @action
  disableViewAssetToken(vaultId: string, token: ViewAssetToken): void {
    const previous = this.getDisabledViewAssetTokenList(vaultId);
    const vault = this.keyRingService
      .getKeyRingVaults()
      .find((vault) => vault.id === vaultId);

    if (!vault) {
      throw new Error("Vault not found");
    }

    this.disabledViewAssetTokenMap.set(vaultId, [...previous, token]);
  }
}
