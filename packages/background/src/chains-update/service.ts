import { KVStore } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { ChainsUIService } from "../chains-ui";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

/**
 * 체인 정보에 대한 업데이트 스케줄을 관리한다.
 */
export class ChainsUpdateService {
  protected readonly lastUpdateStartTimeMap = new Map<string, number>();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService
  ) {}

  async init(): Promise<void> {
    // noop

    // must not wait
    this.startUpdateLoop();

    this.chainsService.addChainSuggestedHandler((chainInfo) => {
      this.updateChainInfo(chainInfo.chainId).catch((e) => {
        console.log(e);
      });
    });
  }

  protected startUpdateLoop() {
    // Should not wait
    this.startUpdateChainInfosLoop();
    // Should not wait
    this.startUpdateEnabledChainInfosLoop();
  }

  protected async startUpdateChainInfosLoop(): Promise<void> {
    while (true) {
      // 6시간마다 모든 chain info를 업데이트한다.
      // init()에서 먼저 모든 chain info에 대한 업데이트를 실행하도록 하는게 의도이다.
      // 그러므로 delay를 나중에 준다.
      const chainInfos = this.chainsService.getChainInfos();
      for (const chainInfo of chainInfos) {
        // No need to wait
        this.updateChainInfo(chainInfo.chainId).catch((e) => {
          console.log(e);
        });
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 6 * 60 * 60 * 1000);
      });
    }
  }

  protected async startUpdateEnabledChainInfosLoop(): Promise<void> {
    while (true) {
      // 한시간마다 enabled된 chain info를 업데이트한다.
      // init()에서 먼저 모든 chain info에 대한 업데이트를 실행하도록 하는게 의도이다.
      // 이미 모든 chain info에 대한 업데이트가 이루어졌으므로 얘는 바로 실행될 필요가 없기 때문에
      // delay를 먼저 준다.
      await new Promise((resolve) => {
        setTimeout(resolve, 60 * 60 * 1000);
      });
      const chainIdentifiers = this.chainsUIService.allEnabledChainIdentifiers;
      for (const chainIdentifier of chainIdentifiers) {
        // No need to wait
        this.updateChainInfo(chainIdentifier).catch((e) => {
          console.log(e);
        });
      }
    }
  }

  async tryUpdateEnabledChainInfos(): Promise<boolean> {
    let updated = false;

    const promises: Promise<void>[] = [];

    const chainIdentifiers = this.chainsUIService.allEnabledChainIdentifiers;
    for (const chainIdentifier of chainIdentifiers) {
      // No need to wait
      promises.push(
        (async () => {
          const u = await this.updateChainInfo(chainIdentifier);
          if (u) {
            updated = true;
          }
        })()
      );
    }

    await Promise.allSettled(promises);

    return updated;
  }

  protected async updateChainInfo(chainId: string): Promise<boolean> {
    const chainIdentifier = ChainIdHelper.parse(chainId).identifier;

    const lastUpdateStartTime =
      this.lastUpdateStartTimeMap.get(chainIdentifier);
    if (
      lastUpdateStartTime &&
      // 5분 안에 이미 업데이트가 시도되었으면 skip한다.
      Math.abs(Date.now() - lastUpdateStartTime) < 5 * 60 * 1000
    ) {
      return false;
    }
    this.lastUpdateStartTimeMap.set(chainIdentifier, Date.now());

    const chainInfo =
      this.chainsService.getChainInfoWithCoreTypes(chainIdentifier);
    if (!chainInfo) {
      return false;
    }

    let updated1 = false;
    if (!chainInfo.updateFromRepoDisabled) {
      try {
        updated1 = await this.chainsService.tryUpdateChainInfoFromRepo(
          chainIdentifier
        );
      } catch (e) {
        console.log(e);
        // Ignore error to proceed to tryUpdateChainInfoFromRpcOrRest if it fails.
      }
    }

    const updated2 = await this.chainsService.tryUpdateChainInfoFromRpcOrRest(
      chainIdentifier
    );

    return updated1 || updated2;
  }
}
