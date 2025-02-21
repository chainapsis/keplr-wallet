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
import { ChainsUIService } from "../chains-ui";

const DISABLED_VIEW_ASSET_TOKEN_MAP_KEY = "disabledViewAssetTokenMap";

export class ManageViewAssetTokenService {
  @observable
  protected disabledViewAssetTokenMap: Map<string, Map<string, Set<string>>> =
    new Map();

  constructor(
    protected readonly kvStore: KVStore,
    public readonly keyRingService: KeyRingService,
    public readonly chainsUIService: ChainsUIService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<
      Record<string, Record<string, string[]>>
    >(DISABLED_VIEW_ASSET_TOKEN_MAP_KEY);
    if (saved) {
      runInAction(() => {
        for (const [vaultId, chainRecord] of Object.entries(saved)) {
          const chainMap: Map<string, Set<string>> = new Map();
          for (const [chainIdentifier, coinArray] of Object.entries(
            chainRecord
          )) {
            chainMap.set(chainIdentifier, new Set(coinArray));
          }
          this.disabledViewAssetTokenMap.set(vaultId, chainMap);
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
    (vaultId: string): Record<string, string[]> => {
      if (!this.checkIsValidVaultId(vaultId)) {
        throw new Error("Invalid vault id");
      }
      const chainMap: Map<string, Set<string>> | undefined =
        this.disabledViewAssetTokenMap.get(vaultId);
      if (!chainMap) {
        runInAction(() => {
          this.disabledViewAssetTokenMap.set(vaultId, new Map());
        });
        return {};
      }
      const js = toJS(chainMap);
      const res = Object.fromEntries(
        Array.from(js.entries()).map(([chainIdentifier, coinSet]) => [
          chainIdentifier,
          Array.from(coinSet),
        ])
      );
      console.log(res);
      return res;
    }
  );

  getAllDisabledViewAssetTokenList = computedFn(
    (): Record<string, Record<string, string[]>> => {
      console.log(
        "[service] getAllDisabledViewAssetTokenList",
        this.disabledViewAssetTokenMap
      );
      const res = this.convertFromNestedObservableToJs(
        this.disabledViewAssetTokenMap
      );

      console.log("[service] getAllDisabledViewAssetTokenList @@", res);
      return res;
    }
  );

  @action
  disableViewAssetToken(
    vaultId: string,
    token: ViewAssetToken
  ): Record<string, Record<string, string[]>> {
    if (!this.checkIsValidVaultId(vaultId)) {
      throw new Error("Invalid vault id");
    }

    console.log("[service] disableViewAssetToken", vaultId, token);

    if (!this.disabledViewAssetTokenMap.has(vaultId)) {
      runInAction(() => {
        this.disabledViewAssetTokenMap.set(
          vaultId,
          new Map<string, Set<string>>()
        );
      });
    }

    const chainIdentifier: string = ChainIdHelper.parse(
      token.chainId
    ).identifier;

    const previousMap =
      this.disabledViewAssetTokenMap.get(vaultId) ||
      new Map<string, Set<string>>();
    let coinSet: Set<string> | undefined = previousMap?.get(chainIdentifier);

    console.log(
      "[service] disableViewAssetToken",
      vaultId,
      token,
      previousMap,
      coinSet
    );

    if (!coinSet) {
      coinSet = new Set<string>();
    }
    coinSet.add(token.coinMinimalDenom);
    previousMap?.set(chainIdentifier, coinSet);

    console.log(
      "[service] disableViewAssetToken",
      vaultId,
      token,
      previousMap,
      coinSet,
      this.disabledViewAssetTokenMap
    );

    this.disabledViewAssetTokenMap.set(vaultId, previousMap);

    const res = this.convertFromNestedObservableToJs(
      this.disabledViewAssetTokenMap
    );

    console.log("[service] disableViewAssetToken", res);
    return res;
  }

  protected convertFromNestedObservableToJs(
    data: Map<string, Map<string, Set<string>>>
  ): Record<string, Record<string, string[]>> {
    const js = toJS(data);
    return Object.fromEntries(
      Array.from(js.entries()).map(([vaultId, chainMap]) => [
        vaultId,
        Object.fromEntries(
          Array.from(chainMap.entries()).map(([chainIdentifier, coinSet]) => [
            chainIdentifier,
            Array.from(coinSet),
          ])
        ),
      ])
    );
  }

  protected checkIsValidVaultId(vaultId: string): boolean {
    return this.keyRingService
      .getKeyRingVaults()
      .some((vault) => vault.id === vaultId);
  }
}
