import { ChainsService } from "../chains";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingService } from "../keyring-v2";
import { ChainsUIService } from "../chains-ui";
import { makeObservable, observable, runInAction } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { Dec } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export type TokenScan = {
  chainId: string;
  infos: {
    bech32Address: string;
    assets: {
      currency: AppCurrency;
      amount: string;
    }[];
  }[];
};

export class TokenScanService {
  @observable
  protected vaultToMap = new Map<string, TokenScan[]>();

  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly keyRingService: KeyRingService,
    protected readonly keyRingCosmosService: KeyRingCosmosService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    // TODO
    // TODO: key가 삭제되었을때 해당하는 정보 지우는 핸들러 만들기

    this.chainsService.addChainSuggestedHandler(async (chainInfo) => {
      await this.scanWithAllVaults(chainInfo.chainId);
    });
  }

  protected async scanWithAllVaults(chainId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const vaultIds = this.keyRingService
      .getKeyInfos()
      .map((keyInfo) => keyInfo.id)
      .sort((a, b) => {
        // 현재 선택된 계정에게 우선권을 준다.
        const aIsSelected = this.keyRingService.selectedVaultId === a;
        const bIsSelected = this.keyRingService.selectedVaultId === b;

        if (aIsSelected) {
          return -1;
        }
        if (bIsSelected) {
          return 1;
        }
        return 0;
      });
    for (const vaultId of vaultIds) {
      // 얘는 계정 수를 예상하기 힘드니까 그냥 순차적으로 한다...
      await this.scan(vaultId, chainId);
    }
  }

  protected async scan(vaultId: string, chainId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const tokenScan = await this.calculateTokenScan(vaultId, chainId);

    if (tokenScan) {
      if (this.chainsUIService.isEnabled(vaultId, tokenScan.chainId)) {
        return;
      }

      runInAction(() => {
        let prevTokenScans = this.vaultToMap.get(vaultId) ?? [];

        const chainIdentifier = ChainIdHelper.parse(
          tokenScan.chainId
        ).identifier;
        prevTokenScans = prevTokenScans.filter((scan) => {
          const prevChainIdentifier = ChainIdHelper.parse(
            scan.chainId
          ).identifier;
          return chainIdentifier !== prevChainIdentifier;
        });

        prevTokenScans.push(tokenScan);

        this.vaultToMap.set(vaultId, prevTokenScans);
      });
    }
  }

  protected async scanAll(vaultId: string): Promise<void> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const chainInfos = this.chainsService
      .getChainInfos()
      .filter(
        (chainInfo) =>
          !this.chainsUIService.isEnabled(vaultId, chainInfo.chainId)
      );

    const tokenScans: TokenScan[] = [];
    const promises: Promise<void>[] = [];
    for (const chainInfo of chainInfos) {
      promises.push(
        (async () => {
          const tokenScan = await this.calculateTokenScan(
            vaultId,
            chainInfo.chainId
          );

          if (tokenScan) {
            tokenScans.push(tokenScan);
          }
        })()
      );
    }

    // ignore error
    await Promise.allSettled(promises);

    if (tokenScans.length > 0) {
      runInAction(() => {
        let prevTokenScans = this.vaultToMap.get(vaultId) ?? [];

        for (const tokenScan of tokenScans) {
          const chainIdentifier = ChainIdHelper.parse(
            tokenScan.chainId
          ).identifier;
          prevTokenScans = prevTokenScans.filter((scan) => {
            const prevChainIdentifier = ChainIdHelper.parse(
              scan.chainId
            ).identifier;
            return chainIdentifier !== prevChainIdentifier;
          });

          prevTokenScans.push(tokenScan);
        }

        prevTokenScans = prevTokenScans.filter((scan) => {
          return !this.chainsUIService.isEnabled(vaultId, scan.chainId);
        });

        this.vaultToMap.set(vaultId, prevTokenScans);
      });
    }
  }

  protected async calculateTokenScan(
    vaultId: string,
    chainId: string
  ): Promise<TokenScan | undefined> {
    if (this.keyRingService.keyRingStatus !== "unlocked") {
      return;
    }

    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);

    if (this.chainsUIService.isEnabled(vaultId, chainId)) {
      return;
    }

    const tokenScan: TokenScan = {
      chainId,
      infos: [],
    };

    const bech32Addresses: string[] = await (async () => {
      if (
        this.keyRingService.needMnemonicKeyCoinTypeFinalize(vaultId, chainId)
      ) {
        return (
          await this.keyRingCosmosService.computeNotFinalizedMnemonicKeyAddresses(
            vaultId,
            chainId
          )
        ).map((addr) => addr.bech32Address);
      } else {
        return [
          (await this.keyRingCosmosService.getKey(chainId, vaultId))
            .bech32Address,
        ];
      }
    })();

    for (const bech32Address of bech32Addresses) {
      const res = await simpleFetch<{
        balances: { denom: string; amount: string }[];
      }>(
        chainInfo.rest,
        `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`
      );

      if (res.status === 200) {
        const assets: TokenScan["infos"][number]["assets"] = [];

        const balances = res.data?.balances ?? [];
        for (const bal of balances) {
          const currency = chainInfo.currencies.find(
            (cur) => cur.coinMinimalDenom === bal.denom
          );
          if (currency) {
            // validate
            if (typeof bal.amount !== "string") {
              throw new Error("Invalid amount");
            }
            new Dec(bal.amount);
            // validate

            assets.push({
              currency,
              amount: bal.amount,
            });
          }
        }

        if (assets.length > 0) {
          tokenScan.infos.push({
            bech32Address,
            assets,
          });
        }
      }
    }

    if (tokenScan.infos.length > 0) {
      return tokenScan;
    }
    return undefined;
  }
}
