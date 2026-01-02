import { KVStore, isServiceWorker } from "@keplr-wallet/common";
import { ChainsService } from "../chains";
import { ChainsUIService } from "../chains-ui";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { autorun, makeObservable, observable, runInAction, toJS } from "mobx";

/**
 * 체인 정보에 대한 업데이트 스케줄을 관리한다.
 */
export class ChainsUpdateService {
  protected readonly lastUpdateStartTimeMap = new Map<string, number>();

  protected readonly windowsMap = new Map<number, boolean>();
  @observable
  protected onInitUpdateDate:
    | {
        date: Date;
      }
    | undefined = undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly disableUpdateLoop: boolean
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
    const saved = await this.kvStore.get<
      | {
          date: string;
        }
      | undefined
    >("onInitUpdateDate");
    if (saved) {
      runInAction(() => {
        this.onInitUpdateDate = {
          date: new Date(saved.date),
        };
      });
    } else {
      runInAction(() => {
        this.onInitUpdateDate = undefined;
      });
    }
    autorun(() => {
      const js = toJS(this.onInitUpdateDate);
      if (js) {
        this.kvStore.set("onInitUpdateDate", {
          ...js,
          date: js.date.toISOString(),
        });
      } else {
        this.kvStore.set("onInitUpdateDate", null);
      }
    });

    // must not wait
    if (!this.disableUpdateLoop) {
      this.startUpdateLoop();
    }

    this.chainsService.addChainSuggestedHandler((chainInfo) => {
      this.updateChainInfo(chainInfo.chainId).catch((e) => {
        console.log(e);
      });
    });

    this.chainsService.addChainRemovedHandler((chainInfo) => {
      this.updateChainInfo(chainInfo.chainId).catch((e) => {
        console.log(e);
      });
    });

    if (isServiceWorker()) {
      browser.windows.onCreated.addListener((window) => {
        if (window.id != null) {
          this.windowsMap.set(window.id, true);
        }
      });
      browser.windows.onRemoved.addListener((windowId) => {
        let exist = false;
        if (this.windowsMap.get(windowId)) {
          exist = true;
        }
        this.windowsMap.delete(windowId);

        if (this.windowsMap.size === 0 && !exist) {
          runInAction(() => {
            this.onInitUpdateDate = undefined;
          });
        }
      });
    }
  }

  protected startUpdateLoop() {
    // Should not wait
    this.startUpdateChainInfosLoop();
    // Should not wait
    this.startUpdateEnabledChainInfosLoop();
  }

  protected async startUpdateChainInfosLoop(): Promise<void> {
    let isFirst = true;
    while (true) {
      let skip = false;
      if (isFirst && isServiceWorker()) {
        // service worker는 여러 문제로 inactive 되었다가 다시 active될 수 있다.
        // 이 경우는 마지막으로 업데이트한 시간이 3시간을 넘지 않으면 초기 업데이트를 실행하지 않도록한다.
        // onInitUpdateDate는 웹브라우저 자체가 꺼지면 undefined가 되므로 웹브라우저를 껏다 켰을때는 이 로직을 무시하고 업데이트를 시도한다.
        if (this.onInitUpdateDate) {
          const diff = Date.now() - this.onInitUpdateDate.date.getTime();
          if (diff < 3 * 60 * 60 * 1000) {
            skip = true;
          }
        }
      }

      if (!skip) {
        if (isServiceWorker()) {
          runInAction(() => {
            this.onInitUpdateDate = {
              date: new Date(),
            };
          });
        }

        // 6시간마다 모든 chain info를 업데이트한다.
        // init()에서 먼저 모든 chain info에 대한 업데이트를 실행하도록 하는게 의도이다.
        // 그러므로 delay를 나중에 준다.
        const chainInfos = this.chainsService.getModularChainInfos();
        for (const chainInfo of chainInfos) {
          // No need to wait
          this.updateChainInfo(chainInfo.chainId).catch((e) => {
            console.log(e);
          });
        }
      }

      isFirst = false;
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

  async tryUpdateAllChainInfos(): Promise<boolean> {
    let updated = false;

    const promises: Promise<void>[] = [];

    const chainIdentifiers = this.chainsService
      .getModularChainInfos()
      .map((c) => c.chainId);
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
