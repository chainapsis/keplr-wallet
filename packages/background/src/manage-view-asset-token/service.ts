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
import { ChainIdHelper } from "@keplr-wallet/cosmos";

const DISABLED_VIEW_ASSET_TOKEN_MAP_KEY = "disabledViewAssetTokenMap";

export class ManageViewAssetTokenService {
  @observable
  protected disabledViewAssetTokenMap = new Map<
    string,
    Map<string, ViewAssetToken>
  >();

  constructor(
    protected readonly kvStore: KVStore,
    public readonly keyRingService: KeyRingService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<
      Record<string, Record<string, ViewAssetToken>>
    >(DISABLED_VIEW_ASSET_TOKEN_MAP_KEY);

    if (saved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(saved)) {
          this.disabledViewAssetTokenMap.set(
            key,
            new Map(Object.entries(value))
          );
        }
      });
    }

    autorun(() => {
      this.kvStore.set(
        DISABLED_VIEW_ASSET_TOKEN_MAP_KEY,
        this.convertFromNestedObservableToJs(this.disabledViewAssetTokenMap)
      );
    });
  }

  getDisabledViewAssetTokenList = computedFn(
    (vaultId: string): Record<string, ViewAssetToken> => {
      if (!this.checkIsValidVaultId(vaultId)) {
        throw new Error("Invalid vault id");
      }

      const viewAssetTokenList = this.disabledViewAssetTokenMap.get(vaultId);
      if (!viewAssetTokenList) {
        runInAction(() => {
          this.disabledViewAssetTokenMap.set(vaultId, new Map());
        });
        return {};
      }

      const js = toJS(viewAssetTokenList);
      return Object.fromEntries(js.entries());
    }
  );

  getAllDisabledViewAssetTokenList = computedFn(
    (): Record<string, Record<string, ViewAssetToken>> => {
      return this.convertFromNestedObservableToJs(
        this.disabledViewAssetTokenMap
      );
    }
  );

  @action
  disableViewAssetToken(
    vaultId: string,
    token: ViewAssetToken
  ): Record<string, Record<string, ViewAssetToken>> {
    if (!this.checkIsValidVaultId(vaultId)) {
      throw new Error("Invalid vault id");
    }

    if (!this.disabledViewAssetTokenMap.has(vaultId)) {
      runInAction(() => {
        this.disabledViewAssetTokenMap.set(vaultId, new Map());
      });
    }

    const key = `${ChainIdHelper.parse(token.chainId).identifier}/${
      token.coinMinimalDenom
    }`;

    const previousMap =
      this.disabledViewAssetTokenMap.get(vaultId) ?? new Map();
    previousMap.set(key, token);

    this.disabledViewAssetTokenMap.set(vaultId, previousMap);

    return this.convertFromNestedObservableToJs(this.disabledViewAssetTokenMap);
  }

  protected convertFromNestedObservableToJs(
    data: Map<string, Map<string, ViewAssetToken>>
  ): Record<string, Record<string, ViewAssetToken>> {
    const js = toJS(data);
    return Object.fromEntries(
      Array.from(js.entries()).map(([key, value]) => [
        key,
        Object.fromEntries(value),
      ])
    );
  }

  protected checkIsValidVaultId(vaultId: string): boolean {
    return this.keyRingService
      .getKeyRingVaults()
      .some((vault) => vault.id === vaultId);
  }
}
