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
import { ChainsService } from "../chains";
import { ChainInfo } from "@keplr-wallet/types";
import { VaultService } from "../vault";

const DISABLED_VIEW_ASSET_TOKEN_MAP_KEY = "disabledViewAssetTokenMap";

export class ManageViewAssetTokenService {
  @observable
  protected disabledViewAssetTokenMap: Map<string, Map<string, Set<string>>> =
    new Map();

  constructor(
    protected readonly kvStore: KVStore,
    public readonly keyRingService: KeyRingService,
    protected readonly vaultService: VaultService,
    public readonly chainsUIService: ChainsUIService,
    protected chainsService: ChainsService
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

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
    this.chainsUIService.addChainUIEnabledChangedHandler(
      this.onChainUIEnabledChanged
    );
    this.vaultService.addVaultRemovedHandler(this.onVaultRemoved);
  }

  protected readonly onVaultRemoved = (type: string, id: string) => {
    if (type === "keyRing" && this.disabledViewAssetTokenMap.has(id)) {
      runInAction(() => {
        this.disabledViewAssetTokenMap.delete(id);
      });
    }
  };

  protected readonly onChainUIEnabledChanged = (
    vaultId: string,
    chainIdentifiers: ReadonlyArray<string>
  ) => {
    const targetVaultDisabledChainMap =
      this.disabledViewAssetTokenMap.get(vaultId);
    if (!targetVaultDisabledChainMap) {
      return;
    }

    const shouldBeDeletedChainIdentifiers = [];

    for (const chainIdentifier of targetVaultDisabledChainMap.keys()) {
      if (!chainIdentifiers.includes(chainIdentifier)) {
        shouldBeDeletedChainIdentifiers.push(chainIdentifier);
      }
    }

    for (const chainIdentifier of shouldBeDeletedChainIdentifiers) {
      targetVaultDisabledChainMap.delete(chainIdentifier);
    }

    runInAction(() => {
      this.disabledViewAssetTokenMap.set(vaultId, targetVaultDisabledChainMap);
    });
  };

  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    //이상하긴 하지만 ChainsUIService과 비슷하게 처리 하도록 구현
    //해서 다른 vault에서 체인을 삭제하면 전체 vault에서 삭제됨
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;
    const vaultIds = this.disabledViewAssetTokenMap.keys();
    runInAction(() => {
      for (const vaultId of vaultIds) {
        this.disabledViewAssetTokenMap.get(vaultId)?.delete(chainIdentifier);
      }
    });
  };

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
      return res;
    }
  );

  getAllDisabledViewAssetTokenList = computedFn(
    (): Record<string, Record<string, string[]>> => {
      const res = this.convertFromNestedObservableToJs(
        this.disabledViewAssetTokenMap
      );

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

    if (!coinSet) {
      coinSet = new Set<string>();
    }
    coinSet.add(token.coinMinimalDenom);
    previousMap?.set(chainIdentifier, coinSet);

    this.disabledViewAssetTokenMap.set(vaultId, previousMap);

    const res = this.convertFromNestedObservableToJs(
      this.disabledViewAssetTokenMap
    );

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
