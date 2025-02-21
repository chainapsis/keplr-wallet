import { makeObservable, observable, runInAction } from "mobx";
import { ChainStore } from "../chain";
import {
  DisableViewAssetTokenMsg,
  GetAllDisabledViewAssetTokenMsg,
  ViewAssetToken,
} from "@keplr-wallet/background";
import { KeyRingStore } from "@keplr-wallet/stores-core";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export class ManageViewAssetTokenConfig {
  @observable.ref
  protected viewAssetTokenMap: ReadonlyMap<
    string,
    ReadonlyMap<string, ReadonlySet<string>>
  > = new Map();

  constructor(
    protected readonly requester: MessageRequester,
    protected readonly chainStore: ChainStore,
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    await this.refreshViewAssetToken();
  }

  protected async refreshViewAssetToken() {
    const msg = new GetAllDisabledViewAssetTokenMsg();
    const disabledViewAssetTokenMap = await this.requester.sendMessage(
      BACKGROUND_PORT,
      msg
    );

    runInAction(() => {
      const map = new Map<string, ReadonlyMap<string, ReadonlySet<string>>>();

      for (const [key, value] of Object.entries(disabledViewAssetTokenMap)) {
        if (value) {
          map.set(
            key,
            new Map(
              Object.entries(value).map(([chainIdentifier, coinArray]) => [
                chainIdentifier,
                new Set(coinArray),
              ])
            )
          );
        }
      }
      this.viewAssetTokenMap = map;
    });
  }

  getViewAssetTokenMapByVaultId(
    vaultId: string
  ): ReadonlyMap<string, ReadonlySet<string>> {
    return this.viewAssetTokenMap.get(vaultId) ?? new Map();
  }

  async disableViewAssetToken(vaultId: string, token: ViewAssetToken) {
    const msg = new DisableViewAssetTokenMsg(vaultId, token);
    const res = await this.requester.sendMessage(BACKGROUND_PORT, msg);

    runInAction(() => {
      const newTokenMap = new Map(this.viewAssetTokenMap);
      const newTokens = res[vaultId];
      if (newTokens) {
        newTokenMap.set(
          vaultId,
          new Map(
            Object.entries(newTokens).map(([chainIdentifier, coinArray]) => [
              chainIdentifier,
              new Set(coinArray),
            ])
          )
        );
      }
      this.viewAssetTokenMap = newTokenMap;
    });
  }

  makeViewAssetTokenKey(token: ViewAssetToken) {
    return `${ChainIdHelper.parse(token.chainId).identifier}/${
      token.coinMinimalDenom
    }`;
  }
}
