import { BIP44HDPath, KeyRingService } from "../keyring";
import { Env } from "@keplr-wallet/router";
import { PermissionService } from "../permission";
import { ChainsService } from "../chains";
import { KVStore } from "@keplr-wallet/common";
import { autorun, makeObservable, observable, runInAction } from "mobx";
import { GenesisHash } from "@keplr-wallet/types";

export class PermissionInteractiveService {
  @observable
  protected lastOpenRegisterPageTimestamp: number = 0;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly permissionService: PermissionService,
    protected readonly keyRingService: KeyRingService,
    protected readonly chainsService: ChainsService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const lastOpenRegisterPageTimestamp = await this.kvStore.get<number>(
      "last_open_register_page_timestamp"
    );
    if (lastOpenRegisterPageTimestamp) {
      runInAction(() => {
        this.lastOpenRegisterPageTimestamp = lastOpenRegisterPageTimestamp;
      });
    }
    autorun(() => {
      this.kvStore.set(
        "last_open_register_page_timestamp",
        this.lastOpenRegisterPageTimestamp
      );
    });
  }

  async ensureKeyRingNotEmpty(env: Env): Promise<void> {
    // extension일때
    if (typeof browser !== "undefined") {
      // 외부 웹페이지에서 요청이 오면, keyring가 비어있으면 register 페이지를 띄워준다.
      // 원래는 UI 쪽에서 처리했는데 그렇게 하면 외부 웹페이지가 api를 병렬적으로 여러번 호출하면
      // register 페이지가 많이 뜨게 된다.
      // 그래서 여기서 처리하도록 변경함.
      // register 페이지가 많이 뜨는 문제는 단순히 30초에 한번만 register 페이지를 띄워주도록 해서 해결...
      if (!env.isInternalMsg && this.keyRingService.keyRingStatus === "empty") {
        if (Date.now() - this.lastOpenRegisterPageTimestamp > 1000 * 30) {
          runInAction(() => {
            this.lastOpenRegisterPageTimestamp = Date.now();
          });

          await browser.tabs.create({
            url: "/register.html#",
          });
        }
        throw new Error("Users need to create their accounts first");
      }
    }
  }

  async ensureKeyRingLedgerAppConnected(
    env: Env,
    app: "Ethereum" | "Starknet" | "Bitcoin" | "Bitcoin Test"
  ): Promise<void> {
    if (typeof browser !== "undefined") {
      const selectedKeyInfo = this.keyRingService.getKeyInfo(
        this.keyRingService.selectedVaultId
      );
      if (selectedKeyInfo == null) {
        throw new Error("Key info is not found");
      }

      const isNanoLedger =
        selectedKeyInfo.insensitive["keyRingType"] === "ledger";
      const isLedgerAppNotConnected = selectedKeyInfo.insensitive[app] == null;
      const bip44Path = selectedKeyInfo.insensitive["bip44Path"];
      if (
        !env.isInternalMsg &&
        isNanoLedger &&
        isLedgerAppNotConnected &&
        typeof bip44Path === "object"
      ) {
        if (Date.now() - this.lastOpenRegisterPageTimestamp > 1000 * 30) {
          runInAction(() => {
            this.lastOpenRegisterPageTimestamp = Date.now();
          });

          const { account, change, addressIndex } = bip44Path as BIP44HDPath;

          await browser.tabs.create({
            url: `/register.html#?route=connect-ledger&ledgerApp=${app}&vaultId=${this.keyRingService.selectedVaultId}&account=${account}&change=${change}&addressIndex=${addressIndex}`,
          });
        }
      }
    }
  }

  async ensureEnabled(
    env: Env,
    chainIds: string[],
    origin: string
  ): Promise<void> {
    await this.ensureKeyRingNotEmpty(env);

    await this.keyRingService.ensureUnlockInteractive(env);

    return await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      chainIds,
      origin
    );
  }

  async ensureEnabledForEVM(env: Env, origin: string): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    await this.ensureKeyRingLedgerAppConnected(env, "Ethereum");

    const currentChainIdForEVM =
      this.permissionService.getCurrentChainIdForEVM(origin) ??
      (() => {
        const chainInfos = this.chainsService.getChainInfos();
        // If currentChainId is not saved, Make Ethereum current chain.
        const ethereumChainId = chainInfos.find(
          (chainInfo) =>
            chainInfo.evm !== undefined && chainInfo.chainId === "eip155:1"
        )?.chainId;

        if (!ethereumChainId) {
          throw new Error("The Ethereum chain info is not found");
        }

        return ethereumChainId;
      })();

    await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      [currentChainIdForEVM],
      origin,
      {
        isForEVM: true,
      }
    );
  }

  async ensureEnabledForStarknet(env: Env, origin: string): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    await this.ensureKeyRingLedgerAppConnected(env, "Starknet");

    const currentChainIdForStarknet =
      this.permissionService.getCurrentChainIdForStarknet(origin) ??
      "starknet:SN_MAIN";

    await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      [currentChainIdForStarknet],
      origin,
      {
        isForStarknet: true,
      }
    );
  }

  async ensureEnabledForBitcoin(env: Env, origin: string): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    const currentBaseChainIdForBitcoin =
      this.permissionService.getCurrentBaseChainIdForBitcoin(origin) ??
      `bip122:${GenesisHash.MAINNET}`;

    const isTestnet = !currentBaseChainIdForBitcoin.includes(
      GenesisHash.MAINNET
    );

    await this.ensureKeyRingLedgerAppConnected(
      env,
      isTestnet ? "Bitcoin Test" : "Bitcoin"
    );

    await this.permissionService.checkOrGrantBasicAccessPermission(
      env,
      currentBaseChainIdForBitcoin,
      origin,
      {
        isForBitcoin: true,
      }
    );
  }

  disable(chainIds: string[], origin: string) {
    // Delete permissions granted to origin.
    // If chain ids are specified, only the permissions granted to each chain id are deleted (In this case, permissions such as getChainInfosWithoutEndpoints() are not deleted).
    // Else, remove all permissions granted to origin (In this case, permissions that are not assigned to each chain, such as getChainInfosWithoutEndpoints(), are also deleted).
    if (chainIds.length > 0) {
      for (const chainId of chainIds) {
        this.permissionService.removeAllTypePermissionToChainId(chainId, [
          origin,
        ]);
      }
    } else {
      this.permissionService.removeAllTypePermission([origin]);
      this.permissionService.removeAllTypeGlobalPermission([origin]);
    }
  }

  isEnabled(env: Env, chainIds: string[], origin: string): boolean {
    return this.permissionService.hasBasicAccessPermission(
      env,
      chainIds,
      origin
    );
  }

  async checkOrGrantGetChainInfosWithoutEndpointsPermission(
    env: Env,
    origin: string
  ): Promise<void> {
    await this.keyRingService.ensureUnlockInteractive(env);

    return await this.permissionService.checkOrGrantGlobalPermission(
      env,
      "get-chain-infos",
      origin
    );
  }
}
