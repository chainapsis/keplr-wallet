import { ChainsService } from "../chains";
import {
  Bech32Address,
  ChainIdHelper,
  TendermintTxTracer,
  WsReadyState,
} from "@keplr-wallet/cosmos";
import { BackgroundTxService, Notification } from "../tx";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore, retry } from "@keplr-wallet/common";
import {
  IBCHistory,
  IBCSwapMinimalTrackingData,
  RecentSendHistory,
  SkipHistory,
  SwapProvider,
  SwapV2History,
  SwapV2RouteStepStatus,
  SwapV2TxStatus,
  SwapV2TxStatusResponse,
} from "./types";
import { Buffer } from "buffer/";
import {
  AppCurrency,
  ChainInfo,
  EthTxReceipt,
  EthTxStatus,
} from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { id } from "@ethersproject/hash";
import { EventBusPublisher } from "@keplr-wallet/common";
import { TxExecutionEvent } from "../tx-executor/types";
import {
  requestSkipTxTrack,
  requestSwapV2TxStatus,
  requestEthTxReceipt,
  requestSkipTxStatus,
  requestEthTxTrace,
} from "./api";

const SWAP_API_ENDPOINT = process.env["KEPLR_API_ENDPOINT"] ?? "";

export class RecentSendHistoryService {
  // Key: {chain_identifier}/{type}
  @observable
  protected readonly recentSendHistoryMap: Map<string, RecentSendHistory[]> =
    new Map();

  @observable
  protected recentIBCHistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentIBCHistoryMap: Map<string, IBCHistory> = new Map();

  @observable
  protected recentSkipHistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentSkipHistoryMap: Map<string, SkipHistory> = new Map();

  @observable
  protected recentSwapV2HistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentSwapV2HistoryMap: Map<string, SwapV2History> =
    new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly txService: BackgroundTxService,
    protected readonly notification: Notification,
    protected readonly publisher: EventBusPublisher<TxExecutionEvent>
  ) {
    makeObservable(this);
  }

  // ============================================================================
  // Init – load & persist histories
  // ============================================================================

  async init(): Promise<void> {
    await this.initRecentSendHistory();
    await this.initRecentIBCHistory();
    await this.initRecentSkipHistory();
    await this.initRecentSwapV2History();

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

  protected async initRecentSendHistory(): Promise<void> {
    const recentSendHistoryMapSaved = await this.kvStore.get<
      Record<string, RecentSendHistory[]>
    >("recentSendHistoryMap");
    if (recentSendHistoryMapSaved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(recentSendHistoryMapSaved)) {
          this.recentSendHistoryMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentSendHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, RecentSendHistory[]>>(
        "recentSendHistoryMap",
        obj
      );
    });
  }

  protected async initRecentIBCHistory(): Promise<void> {
    // 밑의 storage의 key들이 ibc transfer를 포함하는데
    // 이 이유는 이전에 transfer history만 지원되었을때
    // key를 그렇게 정했었기 때문이다
    // 이전 버전과의 호환성을 위해서 key는 그대로 냅뒀다.
    const recentIBCHistorySeqSaved = await this.kvStore.get<number>(
      "recentIBCTransferHistorySeq"
    );
    if (recentIBCHistorySeqSaved) {
      runInAction(() => {
        this.recentIBCHistorySeq = recentIBCHistorySeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCHistorySeq);
      this.kvStore.set<number>("recentIBCTransferHistorySeq", js);
    });

    const recentIBCHistoryMapSaved = await this.kvStore.get<
      Record<string, IBCHistory>
    >("recentIBCTransferHistoryMap");
    if (recentIBCHistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentIBCHistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          // There is no guarantee that the order of the object is same as the order of the last saved.
          // So we need to sort them.
          // id is increased by 1 for each.
          // So we can sort by id.
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentIBCHistoryMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, IBCHistory>>(
        "recentIBCTransferHistoryMap",
        obj
      );
    });

    for (const history of this.getRecentIBCHistories()) {
      this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
        this.trackIBCPacketForwardingRecursiveInternal(
          history.id,
          onFulfill,
          onClose,
          onError
        );
      });
    }
  }

  protected async initRecentSkipHistory(): Promise<void> {
    // Load skip history sequence from the storage
    const recentSkipHistorySeqSaved = await this.kvStore.get<number>(
      "recentSkipHistorySeq"
    );

    if (recentSkipHistorySeqSaved) {
      // Set the loaded sequence to the observable
      runInAction(() => {
        this.recentSkipHistorySeq = recentSkipHistorySeqSaved;
      });
    }

    // Save the sequence to the storage when the sequence is changed
    autorun(() => {
      const js = toJS(this.recentSkipHistorySeq);
      this.kvStore.set<number>("recentSkipHistorySeq", js);
    });

    // Load skip history from the storage
    const recentSkipHistoryMapSaved = await this.kvStore.get<
      Record<string, SkipHistory>
    >("recentSkipHistoryMap");
    if (recentSkipHistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentSkipHistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentSkipHistoryMap.set(key, value);
        }
      });
    }

    // Save the skip history to the storage when the skip history is changed
    autorun(() => {
      const js = toJS(this.recentSkipHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, SkipHistory>>(
        "recentSkipHistoryMap",
        obj
      );
    });

    // Track the recent skip history
    for (const history of this.getRecentSkipHistories()) {
      this.trackSkipSwapRecursive(history.id);
    }
  }

  protected async initRecentSwapV2History(): Promise<void> {
    const recentSwapV2HistorySeqSaved = await this.kvStore.get<number>(
      "recentSwapV2HistorySeq"
    );
    if (recentSwapV2HistorySeqSaved) {
      runInAction(() => {
        this.recentSwapV2HistorySeq = recentSwapV2HistorySeqSaved;
      });
    }

    // Save the swap v2 history sequence to the storage when the swap v2 history sequence is changed
    autorun(() => {
      const js = toJS(this.recentSwapV2HistorySeq);
      this.kvStore.set<number>("recentSwapV2HistorySeq", js);
    });

    // Load swap v2 history from the storage
    const recentSwapV2HistoryMapSaved = await this.kvStore.get<
      Record<string, SwapV2History>
    >("recentSwapV2HistoryMap");
    if (recentSwapV2HistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentSwapV2HistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentSwapV2HistoryMap.set(key, value);
        }
      });
    }

    // Save the swap v2 history to the storage when the swap v2 history is changed
    autorun(() => {
      const js = toJS(this.recentSwapV2HistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, SwapV2History>>(
        "recentSwapV2HistoryMap",
        obj
      );
    });

    for (const history of this.getRecentSwapV2Histories()) {
      this.trackSwapV2Recursive(history.id);

      if (history.additionalTrackingData && !history.additionalTrackDone) {
        this.trackSwapV2AdditionalRecursive(history.id);
      }
    }
  }

  // ============================================================================
  // Send tx and record
  // ============================================================================

  async sendTxAndRecord(
    type: string,
    sourceChainId: string,
    destinationChainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    silent: boolean,
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[]
      | undefined,
    notificationInfo: {
      currencies: AppCurrency[];
    },
    shouldLegacyTrack: boolean = false
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    const destinationChainInfo =
      this.chainsService.getChainInfoOrThrow(destinationChainId);
    if (recipient.startsWith("0x")) {
      if (!recipient.match(/^0x[0-9A-Fa-f]*$/) || recipient.length !== 42) {
        throw new Error("Recipient address is not valid hex address");
      }
    } else {
      Bech32Address.validate(
        recipient,
        destinationChainInfo.bech32Config?.bech32PrefixAccAddr
      );
    }

    const txHash = await this.txService.sendTx(sourceChainId, tx, mode, {
      silent,
      onFulfill: (tx) => {
        if (tx.code == null || tx.code === 0) {
          this.addRecentSendHistory(destinationChainId, type, {
            sender,
            recipient,
            amount,
            memo,
            ibcChannels,
          });

          if (tx.hash) {
            if (shouldLegacyTrack) {
              // no wait
              setTimeout(() => {
                requestSkipTxTrack({
                  endpoint: SWAP_API_ENDPOINT,
                  chainId: sourceChainId,
                  txHash: Buffer.from(tx.hash).toString("hex"),
                })
                  .then((result) => {
                    console.log(
                      `Skip tx track result: ${JSON.stringify(result)}`
                    );
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }, 2000);
            }
          }
        }
      },
    });

    if (ibcChannels && ibcChannels.length > 0) {
      const id = this.addRecentIBCTransferHistory(
        sourceChainId,
        destinationChainId,
        sender,
        recipient,
        amount,
        memo,
        ibcChannels,
        notificationInfo,
        txHash
      );

      this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
        this.trackIBCPacketForwardingRecursiveInternal(
          id,
          onFulfill,
          onClose,
          onError
        );
      });
    }

    return txHash;
  }

  getRecentSendHistories(chainId: string, type: string): RecentSendHistory[] {
    const key = `${ChainIdHelper.parse(chainId).identifier}/${type}`;
    return (this.recentSendHistoryMap.get(key) ?? []).slice(0, 20);
  }

  @action
  addRecentSendHistory(
    chainId: string,
    type: string,
    history: Omit<RecentSendHistory, "timestamp">
  ) {
    const key = `${ChainIdHelper.parse(chainId).identifier}/${type}`;

    let histories = this.recentSendHistoryMap.get(key) ?? [];
    histories.unshift({
      timestamp: Date.now(),
      ...history,
    });
    histories = histories.slice(0, 20);

    this.recentSendHistoryMap.set(key, histories);
  }

  // ============================================================================
  // Send tx and record IBC swap/transfer
  // ============================================================================

  async sendTxAndRecordIBCSwap(
    swapType: "amount-in" | "amount-out",
    sourceChainId: string,
    destinationChainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    silent: boolean,
    sender: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    destinationAsset: {
      chainId: string;
      denom: string;
    },
    swapChannelIndex: number,
    swapReceiver: string[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    shouldLegacyTrack: boolean = false
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config?.bech32PrefixAccAddr
    );

    this.chainsService.getChainInfoOrThrow(destinationChainId);

    const txHash = await this.txService.sendTx(sourceChainId, tx, mode, {
      silent,
      onFulfill: (tx) => {
        if (tx.code == null || tx.code === 0) {
          if (tx.hash) {
            if (shouldLegacyTrack) {
              setTimeout(() => {
                // no wait
                requestSkipTxTrack({
                  endpoint: SWAP_API_ENDPOINT,
                  chainId: sourceChainId,
                  txHash: Buffer.from(tx.hash).toString("hex"),
                })
                  .then((result) => {
                    console.log(
                      `Skip tx track result: ${JSON.stringify(result)}`
                    );
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }, 2000);
            }
          }
        }
      },
    });

    if (shouldLegacyTrack) {
      const id = this.addRecentIBCSwapHistory(
        swapType,
        sourceChainId,
        destinationChainId,
        sender,
        amount,
        memo,
        ibcChannels,
        destinationAsset,
        swapChannelIndex,
        swapReceiver,
        notificationInfo,
        txHash
      );

      this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
        this.trackIBCPacketForwardingRecursiveInternal(
          id,
          onFulfill,
          onClose,
          onError
        );
      });
    }

    return txHash;
  }

  @action
  addRecentIBCTransferHistory(
    chainId: string,
    destinationChainId: string,
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array,
    backgroundExecutionId?: string
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: IBCHistory = {
      id,
      chainId,
      destinationChainId,
      timestamp: Date.now(),
      sender,
      recipient,
      amount,
      memo,

      ibcHistory: ibcChannels.map((channel) => {
        return {
          portId: channel.portId,
          channelId: channel.channelId,
          counterpartyChainId: channel.counterpartyChainId,

          completed: false,
        };
      }),
      notificationInfo,
      txHash: Buffer.from(txHash).toString("hex"),
      backgroundExecutionId: backgroundExecutionId,
    };

    this.recentIBCHistoryMap.set(id, history);

    return id;
  }

  addRecentIBCTransferHistoryWithTracking(
    chainId: string,
    destinationChainId: string,
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array,
    backgroundExecutionId?: string
  ): string {
    const id = this.addRecentIBCTransferHistory(
      chainId,
      destinationChainId,
      sender,
      recipient,
      amount,
      memo,
      ibcChannels,
      notificationInfo,
      txHash,
      backgroundExecutionId
    );

    this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
      this.trackIBCPacketForwardingRecursiveInternal(
        id,
        onFulfill,
        onClose,
        onError
      );
    });

    return id;
  }

  @action
  addRecentIBCSwapHistory(
    swapType: "amount-in" | "amount-out",
    chainId: string,
    destinationChainId: string,
    sender: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    destinationAsset: {
      chainId: string;
      denom: string;
    },
    swapChannelIndex: number,
    swapReceiver: string[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array,
    backgroundExecutionId?: string
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: IBCHistory = {
      id,
      swapType,
      chainId,
      destinationChainId,
      timestamp: Date.now(),
      sender,
      amount,
      memo,

      ibcHistory: ibcChannels.map((channel) => {
        return {
          portId: channel.portId,
          channelId: channel.channelId,
          counterpartyChainId: channel.counterpartyChainId,

          completed: false,
        };
      }),
      destinationAsset,
      swapChannelIndex,
      swapReceiver,
      resAmount: [],
      notificationInfo,
      txHash: Buffer.from(txHash).toString("hex"),
      backgroundExecutionId: backgroundExecutionId,
    };

    this.recentIBCHistoryMap.set(id, history);

    return id;
  }

  addRecentIBCSwapHistoryWithTracking(
    swapType: "amount-in" | "amount-out",
    chainId: string,
    destinationChainId: string,
    sender: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    memo: string,
    ibcChannels:
      | {
          portId: string;
          channelId: string;
          counterpartyChainId: string;
        }[],
    destinationAsset: {
      chainId: string;
      denom: string;
    },
    swapChannelIndex: number,
    swapReceiver: string[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    txHash: Uint8Array,
    backgroundExecutionId?: string
  ): string {
    const id = this.addRecentIBCSwapHistory(
      swapType,
      chainId,
      destinationChainId,
      sender,
      amount,
      memo,
      ibcChannels,
      destinationAsset,
      swapChannelIndex,
      swapReceiver,
      notificationInfo,
      txHash,
      backgroundExecutionId
    );

    this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
      this.trackIBCPacketForwardingRecursiveInternal(
        id,
        onFulfill,
        onClose,
        onError
      );
    });

    return id;
  }

  getRecentIBCHistory(id: string): IBCHistory | undefined {
    return this.recentIBCHistoryMap.get(id);
  }

  getRecentIBCHistories(): IBCHistory[] {
    return Array.from(this.recentIBCHistoryMap.values()).filter((history) => {
      if (!this.chainsService.hasChainInfo(history.chainId)) {
        return false;
      }

      if (!this.chainsService.hasChainInfo(history.destinationChainId)) {
        return false;
      }

      if (
        history.ibcHistory.some((history) => {
          return !this.chainsService.hasChainInfo(history.counterpartyChainId);
        })
      ) {
        return false;
      }

      return true;
    });
  }

  @action
  removeRecentIBCHistory(id: string): boolean {
    return this.recentIBCHistoryMap.delete(id);
  }

  @action
  clearAllRecentIBCHistory(): void {
    this.recentIBCHistoryMap.clear();
  }

  // ============================================================================
  // Common functions for history tracking (IBC, Skip, Swap V2)
  // ============================================================================

  trackIBCPacketForwardingRecursive(
    trackHandler: (
      onFulfill: () => void,
      onClose: () => void,
      onError: () => void
    ) => void
  ): void {
    retry(
      () => {
        return new Promise<void>((resolve, reject) => {
          trackHandler(
            () => {
              resolve();
            },
            () => {
              // reject if ws closed before fulfilled
              // 하지만 로직상 fulfill 되기 전에 ws가 닫히는게 되기 때문에
              // delay를 좀 준다.
              // 현재 trackIBCPacketForwardingRecursiveInternal에 ws close 이후에는 동기적인 로직밖에 없으므로
              // 문제될게 없다.
              setTimeout(() => {
                reject();
              }, 500);
            },
            () => {
              // reject if ws error occurred before fulfilled
              reject();
            }
          );
        });
      },
      {
        maxRetries: 10,
        waitMsAfterError: 10 * 1000, // 10sec
        maxWaitMsAfterError: 5 * 60 * 1000, // 5min
      }
    );
  }

  // ibc packet forwarding을 위한 recursive function이면서
  // 실패시 retry를 수행하기 위해서 분리되어 있음
  // trackIBCPacketForwardingRecursive도 참고
  // trackIBCPacketForwardingRecursive의 주석을 보면 알겠지만
  // tx tracer가 close된 이후에는 동기적인 로직만 있어야함.
  protected trackIBCPacketForwardingRecursiveInternal = (
    id: string,
    onFulfill: () => void,
    onClose: () => void,
    onError: () => void
  ): void => {
    const history = this.getRecentIBCHistory(id);
    if (!history) {
      onFulfill();
      return;
    }

    if (!history.txFulfilled) {
      this.trackIBCTxFulfillment({
        chainId: history.chainId,
        txHash: history.txHash,
        ibcHistory: history.ibcHistory,
        swapReceiver:
          "swapReceiver" in history ? history.swapReceiver : undefined,
        onTxFulfilled: (_tx, hopUpdate, firstHopResAmount) => {
          runInAction(() => {
            history.txFulfilled = true;
            if ("swapReceiver" in history && firstHopResAmount) {
              history.resAmount.push(firstHopResAmount);
            }
            if (hopUpdate) {
              const target = history.ibcHistory[hopUpdate.index];
              if (target) {
                target.sequence = hopUpdate.sequence;
                target.dstChannelId = hopUpdate.dstChannelId;
              }
            }
          });
          this.trackIBCPacketForwardingRecursive(
            (onFulfill, onClose, onError) => {
              this.trackIBCPacketForwardingRecursiveInternal(
                id,
                onFulfill,
                onClose,
                onError
              );
            }
          );
        },
        onTxError: () => {
          this.removeRecentIBCHistory(id);
        },
        onFulfill: onFulfill,
        onClose: onClose,
        onError: onError,
      });
      return;
    }

    const needRewind = (() => {
      if (history.ibcHistory.length === 0) {
        return false;
      }

      return history.ibcHistory.find((h) => h.error != null) != null;
    })();

    if (needRewind) {
      if (history.ibcHistory.find((h) => h.rewoundButNextRewindingBlocked)) {
        onFulfill();
        return;
      }
      const isTimeoutPacket = history.packetTimeout || false;
      const lastRewoundChannelIndex = history.ibcHistory.findIndex((h) => {
        if (h.rewound) {
          return true;
        }
      });
      const targetChannel = (() => {
        if (lastRewoundChannelIndex >= 0) {
          if (lastRewoundChannelIndex === 0) {
            return undefined;
          }

          return history.ibcHistory[lastRewoundChannelIndex - 1];
        }
        return history.ibcHistory.find((h) => h.error != null);
      })();
      const isSwapTargetChannel =
        targetChannel &&
        "swapChannelIndex" in history &&
        history.ibcHistory.indexOf(targetChannel) ===
          history.swapChannelIndex + 1;

      if (targetChannel && targetChannel.sequence) {
        const prevChainInfo = (() => {
          const targetChannelIndex = history.ibcHistory.findIndex(
            (h) => h === targetChannel
          );
          if (targetChannelIndex < 0) {
            return undefined;
          }
          if (targetChannelIndex === 0) {
            return this.chainsService.getChainInfo(history.chainId);
          }
          return this.chainsService.getChainInfo(
            history.ibcHistory[targetChannelIndex - 1].counterpartyChainId
          );
        })();
        if (prevChainInfo) {
          const txTracer = new TendermintTxTracer(
            prevChainInfo.rpc,
            "/websocket"
          );
          txTracer.addEventListener("close", onClose);
          txTracer.addEventListener("error", onError);
          txTracer
            .traceTx(
              isTimeoutPacket
                ? {
                    // "timeout_packet.packet_src_port": targetChannel.portId,
                    "timeout_packet.packet_src_channel":
                      targetChannel.channelId,
                    "timeout_packet.packet_sequence": targetChannel.sequence,
                  }
                : {
                    // "acknowledge_packet.packet_src_port": targetChannel.portId,
                    "acknowledge_packet.packet_src_channel":
                      targetChannel.channelId,
                    "acknowledge_packet.packet_sequence":
                      targetChannel.sequence,
                  }
            )
            .then((res: any) => {
              txTracer.close();

              if (!res) {
                return;
              }

              runInAction(() => {
                if (isSwapTargetChannel) {
                  const txs = res.txs
                    ? res.txs.map((res: any) => res.tx_result || res)
                    : [res.tx_result || res];
                  if (txs && Array.isArray(txs)) {
                    for (const tx of txs) {
                      if (targetChannel.sequence && "swapReceiver" in history) {
                        const index = isTimeoutPacket
                          ? this.getIBCTimeoutPacketIndexFromTx(
                              tx,
                              targetChannel.portId,
                              targetChannel.channelId,
                              targetChannel.sequence
                            )
                          : this.getIBCAcknowledgementPacketIndexFromTx(
                              tx,
                              targetChannel.portId,
                              targetChannel.channelId,
                              targetChannel.sequence
                            );
                        if (index >= 0) {
                          // 좀 빡치게 timeout packet은 refund 로직이 실행되고 나서 "timeout_packet" event가 발생한다.
                          const refunded = isTimeoutPacket
                            ? this.getIBCSwapResAmountFromTx(
                                tx,
                                history.swapReceiver[
                                  history.swapChannelIndex + 1
                                ],
                                (() => {
                                  const i =
                                    this.getLastIBCTimeoutPacketBeforeIndexFromTx(
                                      tx,
                                      index
                                    );

                                  if (i < 0) {
                                    return 0;
                                  }
                                  return i;
                                })(),
                                index
                              )
                            : this.getIBCSwapResAmountFromTx(
                                tx,
                                history.swapReceiver[
                                  history.swapChannelIndex + 1
                                ],
                                index
                              );
                          history.swapRefundInfo = {
                            chainId: prevChainInfo.chainId,
                            amount: refunded,
                          };

                          targetChannel.rewoundButNextRewindingBlocked = true;
                          break;
                        }
                      }
                    }
                  }
                }
                targetChannel.rewound = true;
              });
              onFulfill();
              this.trackIBCPacketForwardingRecursive(
                (onFulfill, onClose, onError) => {
                  this.trackIBCPacketForwardingRecursiveInternal(
                    id,
                    onFulfill,
                    onClose,
                    onError
                  );
                }
              );
            });
        }
      }
      return;
    }

    const targetChannelIndex = history.ibcHistory.findIndex((history) => {
      return !history.completed;
    });
    const targetChannel =
      targetChannelIndex >= 0
        ? history.ibcHistory[targetChannelIndex]
        : undefined;
    if (targetChannel && targetChannel.sequence) {
      const closables: {
        readyState: WsReadyState;
        close: () => void;
      }[] = [];

      const closeClosables = () => {
        closables.forEach((closable) => {
          if (
            closable.readyState === WsReadyState.OPEN ||
            closable.readyState === WsReadyState.CONNECTING
          ) {
            closable.close();
          }
        });
      };

      let _onFulfillOnce = false;
      const onFulfillOnce = () => {
        if (!_onFulfillOnce) {
          _onFulfillOnce = true;
          closeClosables();
          onFulfill();
        }
      };

      let _onCloseOnce = false;
      const onCloseOnce = () => {
        if (!_onCloseOnce) {
          _onCloseOnce = true;
          closeClosables();
          onClose();
        }
      };

      let _onErrorOnce = false;
      const onErrorOnce = () => {
        if (!_onErrorOnce) {
          _onErrorOnce = true;
          closeClosables();
          onError();
        }
      };

      const registerClosable = (closable: {
        readyState: WsReadyState;
        close: () => void;
      }) => closables.push(closable);

      let hopFailed = false;

      const hopTracer = this.trackIBCHopRecvPacket({
        ibcHistory: history.ibcHistory,
        targetChannelIndex,
        swapReceiver:
          "swapReceiver" in history ? history.swapReceiver : undefined,
        onHopCompleted: (resAmount, tx) => {
          runInAction(() => {
            if (resAmount && "resAmount" in history) {
              history.resAmount.push(resAmount);
            }
          });

          const sequence = targetChannel.sequence;
          if (!sequence) {
            hopFailed = true;
            onFulfillOnce();
            return;
          }

          if (!tx) {
            return;
          }

          const txs = tx.txs
            ? tx.txs.map((res: any) => res.tx_result || res)
            : [tx.tx_result || tx];

          for (const txItem of txs) {
            try {
              const ack = this.getIBCWriteAcknowledgementAckFromTx(
                txItem,
                targetChannel.portId,
                targetChannel.channelId,
                sequence
              );

              if (ack && ack.length > 0) {
                const str = Buffer.from(ack);
                try {
                  const decoded = JSON.parse(str.toString());
                  if (decoded.error) {
                    // XXX: {key: 'packet_ack', value: '{"error":"ABCI code: 6: error handling packet: see events for details"}'}
                    //      오류가 있을 경우 이딴식으로 오류가 나오기 때문에 뭐 유저에게 보여줄 방법이 없다...
                    runInAction(() => {
                      targetChannel.error = "Packet processing failed";
                    });
                    hopFailed = true;
                    onFulfillOnce();
                    this.trackIBCPacketForwardingRecursive(
                      (onFulfill, onClose, onError) => {
                        this.trackIBCPacketForwardingRecursiveInternal(
                          id,
                          onFulfill,
                          onClose,
                          onError
                        );
                      }
                    );
                    return;
                  }
                } catch (e) {
                  // decode가 실패한 경우 사실 방법이 없다.
                  // 일단 packet이 성공했다고 치고 진행한다.
                  console.log(e);
                }
              }
            } catch {
              // noop
            }

            const index = this.getIBCRecvPacketIndexFromTx(
              txItem,
              targetChannel.portId,
              targetChannel.channelId,
              sequence
            );

            if (index >= 0) {
              break;
            }
          }
        },
        onAllCompleted: () => {
          if (hopFailed) {
            return;
          }

          if (history.backgroundExecutionId) {
            this.publisher.publish({
              type: "executable",
              executionId: history.backgroundExecutionId,
              executableChainIds: getExecutableChainIdsFromIBCHistory(history),
            });
          }

          const notificationInfo = history.notificationInfo;
          if (notificationInfo && !history.notified) {
            runInAction(() => {
              history.notified = true;
            });

            const chainInfo = this.chainsService.getChainInfo(
              history.destinationChainId
            );
            if (chainInfo) {
              if ("swapType" in history) {
                if (history.resAmount.length > 0) {
                  const amount =
                    history.resAmount[history.resAmount.length - 1];
                  const assetsText = amount
                    .map((amt) => {
                      const currency = notificationInfo.currencies.find(
                        (cur) => cur.coinMinimalDenom === amt.denom
                      );
                      if (!currency) {
                        return undefined;
                      }
                      return new CoinPretty(currency, amt.amount)
                        .hideIBCMetadata(true)
                        .shrink(true)
                        .maxDecimals(6)
                        .inequalitySymbol(true)
                        .trim(true)
                        .toString();
                    })
                    .filter((text): text is string => Boolean(text));
                  if (assetsText.length > 0) {
                    // Notify user
                    this.notification.create({
                      iconRelativeUrl: "assets/logo-256.png",
                      title: "IBC Swap Succeeded",
                      message: `${assetsText.join(", ")} received on ${
                        chainInfo.chainName
                      }`,
                    });
                  }
                }
              } else {
                const assetsText = history.amount
                  .map((amt) => {
                    const currency = notificationInfo.currencies.find(
                      (cur) => cur.coinMinimalDenom === amt.denom
                    );
                    if (!currency) {
                      return undefined;
                    }
                    return new CoinPretty(currency, amt.amount)
                      .hideIBCMetadata(true)
                      .shrink(true)
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .trim(true)
                      .toString();
                  })
                  .filter((text): text is string => Boolean(text));
                if (assetsText.length > 0) {
                  // Notify user
                  this.notification.create({
                    iconRelativeUrl: "assets/logo-256.png",
                    title: "IBC Transfer Succeeded",
                    message: `${assetsText.join(", ")} sent to ${
                      chainInfo.chainName
                    }`,
                  });
                }
              }
            }
          }
          onFulfillOnce();
        },
        onContinue: () => {
          if (hopFailed) {
            return;
          }

          if (history.backgroundExecutionId) {
            this.publisher.publish({
              type: "executable",
              executionId: history.backgroundExecutionId,
              executableChainIds: getExecutableChainIdsFromIBCHistory(history),
            });
          }

          onFulfillOnce();
          this.trackIBCPacketForwardingRecursive(
            (onFulfill, onClose, onError) => {
              this.trackIBCPacketForwardingRecursiveInternal(
                id,
                onFulfill,
                onClose,
                onError
              );
            }
          );
        },
        onFulfill: onFulfillOnce,
        onClose: onCloseOnce,
        onError: onErrorOnce,
      });

      if (hopTracer) {
        registerClosable(hopTracer);
      }

      let prevChainId: string = "";
      if (targetChannelIndex > 0) {
        prevChainId =
          history.ibcHistory[targetChannelIndex - 1].counterpartyChainId;
      } else {
        prevChainId = history.chainId;
      }
      if (prevChainId) {
        const prevChainInfo = this.chainsService.getChainInfo(prevChainId);
        if (prevChainInfo) {
          const queryEvents: any = {
            // acknowledge_packet과는 다르게 timeout_packet은 이전의 체인의 이벤트로부터만 알 수 있다.
            // 방법이 없기 때문에 여기서 이전의 체인으로부터 subscribe를 해서 이벤트를 받아야 한다.
            // 하지만 이 경우 ibc error tracking 로직에서 이것과 똑같은 subscription을 한번 더 하게 된다.
            // 이미 로직이 많이 복잡하기 때문에 로직을 덜 복잡하게 하기 위해서 이러한 비효율성(?)을 감수한다.
            // "timeout_packet.packet_src_port": targetChannel.portId,
            "timeout_packet.packet_src_channel": targetChannel.channelId,
            "timeout_packet.packet_sequence": targetChannel.sequence,
          };

          const txTracer = new TendermintTxTracer(
            prevChainInfo.rpc,
            "/websocket"
          );
          registerClosable(txTracer);
          txTracer.addEventListener("close", onCloseOnce);
          txTracer.addEventListener("error", onErrorOnce);
          txTracer.traceTx(queryEvents).then((res) => {
            txTracer.close();

            if (!res) {
              return;
            }

            // 이 event가 발생한 시점에서 이미 timeout packet은 받은 상태이고
            // 이 경우 따로 정보를 얻을 필요는 없으므로 이후에 res를 쓰지는 않는다.
            // 위에 res null check는 사실 필요 없지만 혹시나 해서 넣어둔다.
            runInAction(() => {
              targetChannel.error = "Packet timeout";
              history.packetTimeout = true;
              hopFailed = true;
              onFulfillOnce();
              this.trackIBCPacketForwardingRecursive(
                (onFulfill, onClose, onError) => {
                  this.trackIBCPacketForwardingRecursiveInternal(
                    id,
                    onFulfill,
                    onClose,
                    onError
                  );
                }
              );
            });
          });
        }
      }
    }
  };

  protected checkAndTrackSwapTxFulfilledRecursive = (params: {
    chainId: string;
    txHash: string;
    onSuccess: () => void;
    onPending: () => void;
    onFailed: () => void;
    onError: () => void;
  }): void => {
    const { chainId, txHash, onSuccess, onPending, onFailed, onError } = params;
    const chainInfo = this.chainsService.getChainInfo(chainId);
    if (!chainInfo) {
      onFailed();
      return;
    }

    this.resolveTxExecutionStatus(chainInfo, chainId, txHash)
      .then((status) => {
        switch (status) {
          case "success":
            onSuccess();
            break;
          case "pending":
            onPending();
            break;
          case "failed":
            onFailed();
            break;
          default:
            onError();
            break;
        }
      })
      .catch(() => {
        onError();
      });
  };

  protected async resolveTxExecutionStatus(
    chainInfo: ChainInfo,
    chainId: string,
    txHash: string
  ): Promise<"success" | "failed" | "pending" | "error"> {
    if (this.chainsService.isEvmChain(chainId)) {
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        return Promise.resolve("error");
      }

      const res = await requestEthTxReceipt({
        rpc: evmInfo.rpc,
        txHash,
        origin,
      });

      if (res.data.error) {
        return "error";
      }

      const txReceipt = res.data.result;
      if (!txReceipt) {
        return "pending";
      }
      if (txReceipt.status === EthTxStatus.Success) {
        return "success";
      }

      return "failed";
    }

    const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
    txTracer.addEventListener("error", () => {
      txTracer.close();
    });

    return txTracer
      .traceTx(Buffer.from(txHash.replace("0x", ""), "hex"))
      .then((res: any) => {
        txTracer.close();

        const txResult = Array.isArray(res.txs)
          ? res.txs && res.txs.length > 0
            ? res.txs[0].tx_result
            : undefined
          : res;

        if (!txResult) {
          return "pending";
        }
        if (typeof txResult.code !== "number") {
          return "error";
        }
        return txResult.code === 0 ? "success" : "failed";
      })
      .catch(() => {
        txTracer.close();
        return "error";
      });
  }

  protected trackDestinationAssetAmount(params: {
    chainId: string;
    txHash: string;
    recipient: string;
    targetDenom: string;
    onResult: (resAmount: { amount: string; denom: string }[]) => void;
    onRefund?: (
      refundInfo: {
        chainId: string;
        amount: { amount: string; denom: string }[];
      },
      error?: string
    ) => void;
    onFulfill: () => void;
  }) {
    const {
      chainId,
      txHash,
      recipient,
      targetDenom,
      onResult,
      onRefund,
      onFulfill,
    } = params;

    const chainInfo = this.chainsService.getChainInfo(chainId);
    if (!chainInfo) {
      onFulfill();
      return;
    }

    if (this.chainsService.isEvmChain(chainId)) {
      this.traceEVMTransactionResult({
        chainId,
        txHash,
        recipient,
        targetDenom,
        onResult: (result) => {
          if (result.resAmount) {
            onResult(result.resAmount);
          }
          if (result.refundInfo && onRefund) {
            onRefund(result.refundInfo, result.error);
          }
        },
        onFulfill,
      });
      return;
    }

    this.traceCosmosTransactionResult({
      chainInfo,
      txHash,
      recipient,
      onResult,
      onFulfill,
    });
  }

  protected traceCosmosTransactionResult(params: {
    chainInfo: ChainInfo;
    txHash: string;
    recipient: string;
    onResult: (resAmount: { amount: string; denom: string }[]) => void;
    onFulfill: () => void;
  }) {
    const { chainInfo, txHash, recipient, onResult, onFulfill } = params;
    const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
    txTracer.addEventListener("error", () => onFulfill());
    txTracer
      .queryTx({
        "tx.hash": txHash,
      })
      .then((res: any) => {
        txTracer.close();

        if (!res) {
          return;
        }
        const txs = res.txs
          ? res.txs.map((r: any) => r.tx_result || r)
          : [res.tx_result || res];
        for (const tx of txs) {
          const resAmount = this.getIBCSwapResAmountFromTx(tx, recipient);
          onResult(resAmount);
          return;
        }
      })
      .finally(() => {
        onFulfill();
      });
  }

  protected traceEVMTransactionResult(params: {
    chainId: string;
    txHash: string;
    recipient: string;
    targetDenom: string;
    onResult: (result: {
      success: boolean;
      resAmount?: { amount: string; denom: string }[];
      refundInfo?: {
        chainId: string;
        amount: { amount: string; denom: string }[];
      };
      error?: string;
    }) => void;
    onFulfill: () => void;
  }): void {
    const { chainId, txHash, recipient, targetDenom, onResult, onFulfill } =
      params;

    const chainInfo = this.chainsService.getChainInfo(chainId);
    if (!chainInfo) {
      onResult({ success: false });
      onFulfill();
      return;
    }

    if (!this.chainsService.isEvmChain(chainId)) {
      onResult({ success: false, error: "Not an EVM chain" });
      onFulfill();
      return;
    }

    const evmInfo = chainInfo.evm;
    if (!evmInfo) {
      onResult({ success: false });
      onFulfill();
      return;
    }

    requestEthTxReceipt({
      rpc: evmInfo.rpc,
      txHash,
      origin,
    })
      .then((res) => {
        const txReceipt = res.data.result;
        if (!txReceipt) {
          onResult({ success: false });
          return;
        }

        requestEthTxTrace({
          rpc: evmInfo.rpc,
          txHash,
          origin,
        }).then((traceRes) => {
          let isFoundFromCall = false;
          const foundResAmount: { amount: string; denom: string }[] = [];

          if (traceRes.data.result) {
            const searchForTransfers = (calls: any) => {
              for (const call of calls) {
                if (
                  call.type === "CALL" &&
                  call.to?.toLowerCase() === recipient.toLowerCase()
                ) {
                  const isERC20Transfer = call.input?.startsWith("0xa9059cbb");
                  const value = BigInt(
                    isERC20Transfer
                      ? `0x${call.input.substring(74)}`
                      : call.value || "0x0"
                  );

                  foundResAmount.push({
                    amount: value.toString(10),
                    denom: targetDenom,
                  });
                  isFoundFromCall = true;
                }

                if (call.calls && call.calls.length > 0) {
                  searchForTransfers(call.calls);
                }
              }
            };

            searchForTransfers(traceRes.data.result.calls || []);
          }

          if (isFoundFromCall) {
            onResult({ success: true, resAmount: foundResAmount });
            return;
          }

          // fallback to logs if debug_traceTransaction fails
          this.parseEVMTxReceiptLogs({
            txReceipt,
            recipient,
            targetChainId: chainId,
            targetDenom,
            onResult,
          });
        });
      })
      .finally(() => {
        onFulfill();
      });
  }

  protected parseEVMTxReceiptLogs(params: {
    txReceipt: EthTxReceipt;
    recipient: string;
    targetChainId: string;
    targetDenom: string;
    onResult: (result: {
      success: boolean;
      resAmount?: { amount: string; denom: string }[];
      refundInfo?: {
        chainId: string;
        amount: { amount: string; denom: string }[];
      };
      error?: string;
    }) => void;
  }): void {
    const { txReceipt, recipient, targetChainId, targetDenom, onResult } =
      params;

    const logs = txReceipt.logs;
    const transferTopic = id("Transfer(address,address,uint256)");
    const withdrawTopic = id("Withdrawal(address,uint256)");
    const hyperlaneReceiveTopic = id(
      "ReceivedTransferRemote(uint32,bytes32,uint256)"
    );

    for (const log of logs) {
      if (log.topics[0] === transferTopic) {
        const to = "0x" + log.topics[2].slice(26);
        if (to.toLowerCase() === recipient.toLowerCase()) {
          const expectedAssetDenom = targetDenom.replace("erc20:", "");
          const amount = BigInt(log.data).toString(10);

          if (log.address.toLowerCase() === expectedAssetDenom.toLowerCase()) {
            onResult({
              success: true,
              resAmount: [{ amount, denom: targetDenom }],
            });
          } else {
            console.log("refunded", log.address);
            // Transfer 토픽인 경우엔 ERC20의 tranfer 호출일텐데
            // 받을 토큰의 컨트랙트가 아닌 다른 컨트랙트에서 호출된 경우는 Swap을 실패한 것으로 추측
            // 고로 실제로 받은 토큰의 컨트랙트 주소로 환불 정보에 저장한다.
            onResult({
              success: false,
              error: "Swap failed",
              refundInfo: {
                chainId: targetChainId,
                amount: [
                  {
                    amount,
                    denom: `erc20:${log.address.toLowerCase()}`,
                  },
                ],
              },
            });
          }
          return;
        }
      } else if (log.topics[0] === withdrawTopic) {
        const to = "0x" + log.topics[1].slice(26);
        if (to.toLowerCase() === txReceipt.to?.toLowerCase()) {
          const amount = BigInt(log.data).toString(10);
          onResult({
            success: true,
            resAmount: [{ amount, denom: targetDenom }],
          });
          return;
        }
      } else if (log.topics[0] === hyperlaneReceiveTopic) {
        const to = "0x" + log.topics[2].slice(26);
        if (to.toLowerCase() === recipient.toLowerCase()) {
          const amount = BigInt(log.data).toString(10);
          // Hyperlane을 통해 Forma로 TIA를 받는 경우 토큰 수량이 decimal 6으로 기록되는데,
          // Forma에서는 decimal 18이기 때문에 12자리 만큼 0을 붙여준다.
          onResult({
            success: true,
            resAmount: [
              {
                amount:
                  targetDenom === "forma-native"
                    ? `${amount}000000000000`
                    : amount,
                denom: targetDenom,
              },
            ],
          });
          return;
        }
      }
    }

    // 결과를 찾지 못한 경우
    onResult({ success: false });
  }

  // ============================================================================
  // Skip swap history
  // ============================================================================

  @action
  recordTxWithSkipSwap(
    sourceChainId: string,
    destinationChainId: string,
    destinationAsset: {
      chainId: string;
      denom: string;
      expectedAmount: string;
    },
    simpleRoute: {
      isOnlyEvm: boolean;
      chainId: string;
      receiver: string;
    }[],
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    routeDurationSeconds: number = 0,
    txHash: string,
    isOnlyUseBridge?: boolean
  ): string {
    const id = (this.recentIBCHistorySeq++).toString();

    const history: SkipHistory = {
      id,
      chainId: sourceChainId,
      destinationChainId: destinationChainId,
      destinationAsset,
      simpleRoute,
      sender,
      recipient,
      amount,
      notificationInfo,
      routeDurationSeconds: routeDurationSeconds,
      txHash,
      routeIndex: -1,
      resAmount: [],
      timestamp: Date.now(),
      isOnlyUseBridge,
    };

    this.recentSkipHistoryMap.set(id, history);
    this.trackSkipSwapRecursive(id);

    return id;
  }

  getRecentSkipHistory(id: string): SkipHistory | undefined {
    return this.recentSkipHistoryMap.get(id);
  }

  getRecentSkipHistories(): SkipHistory[] {
    return Array.from(this.recentSkipHistoryMap.values()).filter((history) => {
      if (!this.chainsService.hasChainInfo(history.chainId)) {
        return false;
      }

      if (!this.chainsService.hasChainInfo(history.destinationChainId)) {
        return false;
      }

      if (
        history.simpleRoute.some((route) => {
          return !this.chainsService.hasChainInfo(route.chainId);
        })
      ) {
        return false;
      }

      return true;
    });
  }

  trackSkipSwapRecursive(id: string): void {
    const history = this.getRecentSkipHistory(id);
    if (!history) {
      return;
    }

    // check tx fulfilled and update history
    retry(
      () => {
        return new Promise<void>((txFulfilledResolve, txFulfilledReject) => {
          this.checkAndTrackSwapTxFulfilledRecursive({
            chainId: history.chainId,
            txHash: history.txHash,
            onSuccess: () => {
              this.requestSkipTxTrackInternal({
                chainId: history.chainId,
                txHash: history.txHash,
                onRemoveHistory: () => this.removeRecentSkipHistory(id),
                onFulfill: (keepTracking: boolean) => {
                  txFulfilledResolve();

                  if (!keepTracking) {
                    return;
                  }

                  retry(
                    () => {
                      return new Promise<void>((resolve, reject) => {
                        this.checkAndUpdateSkipSwapHistoryRecursive(
                          id,
                          resolve,
                          reject
                        );
                      });
                    },
                    {
                      maxRetries: 50,
                      waitMsAfterError: 500,
                      maxWaitMsAfterError: 15000,
                    }
                  );
                },
              });
            },
            onPending: txFulfilledReject,
            onFailed: () => {
              this.removeRecentSkipHistory(id);
              txFulfilledResolve();
            },
            onError: () => {
              txFulfilledResolve();
            },
          });
        });
      },
      {
        maxRetries: 50,
        waitMsAfterError: 500,
        maxWaitMsAfterError: 15000,
      }
    );
  }

  protected requestSkipTxTrackInternal(params: {
    chainId: string;
    txHash: string;
    onFulfill: (keepTracking: boolean) => void;
    onRemoveHistory: () => void;
  }) {
    const { chainId, txHash, onFulfill, onRemoveHistory } = params;
    const chainIdForApi = this.chainsService.isEvmChain(chainId)
      ? chainId.replace("eip155:", "")
      : chainId;

    setTimeout(() => {
      requestSkipTxTrack({
        endpoint: SWAP_API_ENDPOINT,
        chainId: chainIdForApi,
        txHash,
      })
        .then((result) => {
          console.log(`Skip tx track result: ${JSON.stringify(result)}`);
          onFulfill(true);
        })
        .catch((e) => {
          console.log(e);
          onRemoveHistory();
          onFulfill(false);
        });
    }, 2000);
  }

  protected checkAndUpdateSkipSwapHistoryRecursive = (
    id: string,
    onFulfill: () => void,
    onError: () => void
  ): void => {
    const history = this.getRecentSkipHistory(id);
    if (!history) {
      onFulfill();
      return;
    }

    const { txHash, chainId, trackStatus, trackDone, routeIndex, simpleRoute } =
      history;

    // 실행이 필요한지 판별
    const needRun = (() => {
      // 1) 상태가 COMPLETED인데 아직 다음 라우트가 남아 있는 경우
      if (
        trackStatus?.includes("COMPLETED") &&
        routeIndex !== simpleRoute.length - 1
      ) {
        return true;
      }
      // 2) status가 없거나, track이 완료되지 않은 경우
      if (!trackStatus || !trackDone) {
        return true;
      }
      return false;
    })();

    // 더 이상 진행할 필요가 없다면 종료
    if (!needRun) {
      onFulfill();
      return;
    }

    requestSkipTxStatus({
      endpoint: SWAP_API_ENDPOINT,
      chainId: chainId.replace("eip155:", ""),
      txHash,
    })
      .then((res) => {
        const {
          state,
          error,
          transfer_sequence,
          next_blocking_transfer,
          transfer_asset_release,
        } = res.data;

        // 상태 갱신
        history.trackStatus = state;

        // 트래킹이 불확실하거나 미완료 상태에 해당하면 에러 처리 후 재시도
        if (
          [
            "STATE_SUBMITTED",
            "STATE_RECEIVED",
            "STATE_COMPLETED",
            "STATE_UNKNOWN",
          ].includes(state)
        ) {
          onError();
          return;
        }

        // 정상적인 트래킹 진행으로 가정
        history.trackError = undefined;

        const currentRouteIndex =
          history.routeIndex < 0 ? 0 : history.routeIndex;
        let nextRouteIndex = currentRouteIndex;
        let errorMsg: string | undefined = error?.message;

        // 언락된 자산 정보가 있으면 저장
        if (transfer_asset_release) {
          history.transferAssetRelease = transfer_asset_release;
        }

        // 다음 blocking transfer의 인덱스
        const nextBlockingTransferIndex =
          next_blocking_transfer?.transfer_sequence_index ??
          transfer_sequence.length - 1;
        const transfer = transfer_sequence[nextBlockingTransferIndex];

        // -------------------------
        // 어떤 타입의 transfer인지 확인하여 targetChainId / errorMsg / receiveTxHash 결정 (if-else 체인)
        // -------------------------
        let targetChainId: string | undefined;
        let receiveTxHash: string | undefined;

        if (transfer) {
          if ("ibc_transfer" in transfer) {
            const {
              state: ibcState,
              from_chain_id,
              to_chain_id,
              packet_txs,
            } = transfer.ibc_transfer;
            switch (ibcState) {
              case "TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg =
                  packet_txs.error?.message ?? "Unknown IBC transfer error";
                break;
              case "TRANSFER_FAILURE":
                targetChainId = to_chain_id;
                errorMsg = packet_txs.error?.message ?? "IBC transfer failed";
                break;
              case "TRANSFER_PENDING":
              case "TRANSFER_RECEIVED":
                targetChainId = from_chain_id;
                break;
              case "TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash = packet_txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("axelar_transfer" in transfer) {
            const {
              state: axelarState,
              from_chain_id,
              to_chain_id,
            } = transfer.axelar_transfer;
            switch (axelarState) {
              case "AXELAR_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Axelar transfer error";
                break;
              case "AXELAR_TRANSFER_FAILURE":
                targetChainId = to_chain_id;
                errorMsg = "Axelar transfer failed";
                break;
              case "AXELAR_TRANSFER_PENDING_CONFIRMATION":
              case "AXELAR_TRANSFER_PENDING_RECEIPT":
                targetChainId = to_chain_id;
                break;
              case "AXELAR_TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash =
                  "contract_call_with_token_txs" in transfer.axelar_transfer.txs
                    ? transfer.axelar_transfer.txs.contract_call_with_token_txs
                        .execute_tx?.tx_hash
                    : transfer.axelar_transfer.txs.send_token_txs.execute_tx
                        ?.tx_hash;
                break;
            }
          } else if ("cctp_transfer" in transfer) {
            const {
              state: cctpState,
              from_chain_id,
              to_chain_id,
            } = transfer.cctp_transfer;
            switch (cctpState) {
              case "CCTP_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown CCTP transfer error";
                break;
              case "CCTP_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "CCTP_TRANSFER_CONFIRMED":
              case "CCTP_TRANSFER_PENDING_CONFIRMATION":
                targetChainId = to_chain_id;
                break;
              case "CCTP_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                receiveTxHash = transfer.cctp_transfer.txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("hyperlane_transfer" in transfer) {
            const {
              state: hyperState,
              from_chain_id,
              to_chain_id,
            } = transfer.hyperlane_transfer;
            switch (hyperState) {
              case "HYPERLANE_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Hyperlane transfer error";
                break;
              case "HYPERLANE_TRANSFER_FAILED":
                targetChainId = to_chain_id;
                errorMsg = "Hyperlane transfer failed";
                break;
              case "HYPERLANE_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "HYPERLANE_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.hyperlane_transfer.txs.receive_tx?.tx_hash;
                break;
            }
          } else if ("op_init_transfer" in transfer) {
            const {
              state: opState,
              from_chain_id,
              to_chain_id,
            } = transfer.op_init_transfer;
            switch (opState) {
              case "OPINIT_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown OP_INIT transfer error";
                break;
              case "OPINIT_TRANSFER_RECEIVED":
                targetChainId = from_chain_id;
                break;
              case "OPINIT_TRANSFER_SENT":
                targetChainId = to_chain_id;
                break;
            }
          } else if ("go_fast_transfer" in transfer) {
            const {
              state: gofastState,
              from_chain_id,
              to_chain_id,
            } = transfer.go_fast_transfer;
            switch (gofastState) {
              case "GO_FAST_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown GoFast transfer error";
                break;
              case "GO_FAST_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "GO_FAST_TRANSFER_TIMEOUT":
                targetChainId = from_chain_id;
                errorMsg = "GoFast transfer timeout";
                break;
              case "GO_FAST_POST_ACTION_FAILED":
                targetChainId = from_chain_id;
                errorMsg = "GoFast post action failed";
                break;
              case "GO_FAST_TRANSFER_REFUNDED":
                targetChainId = to_chain_id;
                errorMsg = "GoFast transfer refunded";
                break;
              case "GO_FAST_TRANSFER_FILLED":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.go_fast_transfer.txs.order_filled_tx?.tx_hash;
                break;
            }
          } else if ("stargate_transfer" in transfer) {
            const {
              state: sgState,
              from_chain_id,
              to_chain_id,
            } = transfer.stargate_transfer;
            switch (sgState) {
              case "STARGATE_TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Stargate transfer error";
                break;
              case "STARGATE_TRANSFER_FAILED":
                targetChainId = to_chain_id;
                errorMsg = "Stargate transfer failed";
                break;
              case "STARGATE_TRANSFER_SENT":
                targetChainId = from_chain_id;
                break;
              case "STARGATE_TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                break;
            }
          } else if ("eureka_transfer" in transfer) {
            const {
              state: eurekaState,
              from_chain_id,
              to_chain_id,
            } = transfer.eureka_transfer;
            switch (eurekaState) {
              case "TRANSFER_UNKNOWN":
                targetChainId = from_chain_id;
                errorMsg = "Unknown Eureka transfer error";
                break;
              case "TRANSFER_PENDING":
                targetChainId = from_chain_id;
                break;
              case "TRANSFER_RECEIVED":
                targetChainId = to_chain_id;
                break;
              case "TRANSFER_SUCCESS":
                targetChainId = to_chain_id;
                receiveTxHash =
                  transfer.eureka_transfer.packet_txs.receive_tx?.tx_hash;
                break;
              case "TRANSFER_FAILURE":
                targetChainId = from_chain_id;
                errorMsg = "Eureka transfer failed";
                break;
            }
          }
        } else {
          // 아마 EVM 체인 위에서만 발생하는 경우 transfer가 없는 것으로 처리되는 것 같음
          targetChainId = history.destinationChainId;
          receiveTxHash = history.txHash;
        }

        // -------------------------
        // 찾은 targetChainId로 다음 라우트 인덱스를 갱신
        // -------------------------
        if (targetChainId) {
          for (let i = currentRouteIndex; i < simpleRoute.length; i++) {
            const routeChain = simpleRoute[i].chainId.replace("eip155:", "");
            if (
              routeChain.toLocaleLowerCase() ===
              targetChainId.toLocaleLowerCase()
            ) {
              nextRouteIndex = i;
              break;
            }
          }

          // 찾지못하더라도 optimistic하게 다음 트라이로 이동
        }

        // 에러 메시지 갱신
        history.trackError = errorMsg;
        // 최종 routeIndex 갱신
        history.routeIndex = nextRouteIndex;

        // state에 따라 트래킹 완료/재시도 결정
        switch (state) {
          case "STATE_ABANDONED":
          case "STATE_COMPLETED_ERROR":
          case "STATE_COMPLETED_SUCCESS":
            // 성공 상태인데 라우트가 남았다면 마지막 라우트로 이동
            if (
              state === "STATE_COMPLETED_SUCCESS" &&
              nextRouteIndex !== simpleRoute.length - 1
            ) {
              history.routeIndex = simpleRoute.length - 1;
            }

            if (receiveTxHash) {
              this.trackSkipDestinationAssetAmount(
                id,
                receiveTxHash,
                onFulfill
              );
            } else {
              history.trackDone = true;
              onFulfill();
            }
            break;

          case "STATE_PENDING":
          case "STATE_PENDING_ERROR":
            // 아직 트래킹 중이거나 에러 상태 전파 중 => 재시도
            onError();
            break;
        }
      })
      .catch((e) => {
        console.error(e);
        onError();
      });
  };

  protected trackSkipDestinationAssetAmount(
    historyId: string,
    txHash: string,
    onFulfill: () => void
  ) {
    const history = this.getRecentSkipHistory(historyId);
    if (!history) {
      onFulfill();
      return;
    }

    const chainInfo = this.chainsService.getChainInfo(
      history.destinationChainId
    );
    if (!chainInfo) {
      onFulfill();
      return;
    }

    this.trackDestinationAssetAmount({
      chainId: history.destinationChainId,
      txHash,
      recipient: history.recipient,
      targetDenom: history.destinationAsset.denom,
      onResult: (resAmount) => {
        runInAction(() => {
          history.resAmount.push(resAmount);
          history.trackDone = true;
        });
      },
      onRefund: (refundInfo, error) => {
        runInAction(() => {
          history.trackError = error;
          history.swapRefundInfo = refundInfo;
          history.trackDone = true;
        });
      },
      onFulfill: () => {
        // ensure completion even if no result parsed
        runInAction(() => {
          history.trackDone = true;
        });
        onFulfill();
      },
    });
  }

  @action
  removeRecentSkipHistory(id: string): boolean {
    return this.recentSkipHistoryMap.delete(id);
  }

  @action
  clearAllRecentSkipHistory(): void {
    this.recentSkipHistoryMap.clear();
  }

  // ============================================================================
  // Swap V2 history
  // ============================================================================

  @action
  recordTxWithSwapV2(
    fromChainId: string,
    toChainId: string,
    provider: SwapProvider,
    destinationAsset: {
      chainId: string;
      denom: string;
      expectedAmount: string;
    },
    simpleRoute: {
      isOnlyEvm: boolean;
      chainId: string;
      receiver: string;
    }[],
    sender: string,
    recipient: string,
    amount: {
      amount: string;
      denom: string;
    }[],
    notificationInfo: {
      currencies: AppCurrency[];
    },
    routeDurationSeconds: number = 0,
    txHash: string,
    isOnlyUseBridge?: boolean,
    backgroundExecutionId?: string
  ): string {
    const id = (this.recentSwapV2HistorySeq++).toString();

    const history: SwapV2History = {
      id,
      fromChainId,
      toChainId,
      provider,
      timestamp: Date.now(),
      sender,
      recipient,
      amount,
      notificationInfo,
      routeDurationSeconds,
      txHash,
      isOnlyUseBridge,
      status: SwapV2TxStatus.IN_PROGRESS,
      simpleRoute,
      routeIndex: -1,
      destinationAsset,
      resAmount: [],
      assetLocationInfo: undefined,
      notified: undefined,
      backgroundExecutionId,
    };

    this.recentSwapV2HistoryMap.set(id, history);
    this.trackSwapV2Recursive(id);

    return id;
  }

  trackSwapV2Recursive(id: string): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return;
    }

    retry(
      () => {
        return new Promise<void>((txFulfilledResolve, txFulfilledReject) => {
          this.checkAndTrackSwapTxFulfilledRecursive({
            chainId: history.fromChainId,
            txHash: history.txHash,
            onSuccess: () => {
              txFulfilledResolve();

              retry(
                () => {
                  return new Promise<void>((resolve, reject) => {
                    this.checkAndUpdateSwapV2HistoryRecursive(
                      id,
                      resolve,
                      reject
                    );
                  });
                },
                {
                  maxRetries: 60,
                  waitMsAfterError: 1000,
                  maxWaitMsAfterError: 45000,
                }
              );
            },
            onPending: txFulfilledReject,
            onFailed: () => {
              this.removeRecentSwapV2History(id);
              txFulfilledResolve();
            },
            onError: txFulfilledResolve,
          });
        });
      },
      {
        maxRetries: 60,
        waitMsAfterError: 1000,
        maxWaitMsAfterError: 45000,
      }
    );
  }

  protected checkAndUpdateSwapV2HistoryRecursive(
    id: string,
    onFulfill: () => void,
    onError: () => void
  ): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      onFulfill();
      return;
    }

    // if already tracked, fulfill
    if (history.trackDone) {
      onFulfill();
      return;
    }

    const { txHash, fromChainId, toChainId, provider } = history;

    const normalizeChainId = (chainId: string): string => {
      return chainId.replace("eip155:", "");
    };

    requestSwapV2TxStatus({
      endpoint: "https://keplr-api-dev.keplr.app", // TODO: change to production URL
      fromChainId: normalizeChainId(fromChainId),
      toChainId: normalizeChainId(toChainId),
      provider,
      txHash,
    })
      .then((res) => {
        this.processSwapV2StatusResponse(id, res.data, onFulfill, onError);
      })
      .catch((e) => {
        console.error("SwapV2 status tracking error:", e);
        onError();
      });
  }

  @action
  protected processSwapV2StatusResponse(
    id: string,
    response: SwapV2TxStatusResponse,
    onFulfill: () => void,
    onError: () => void
  ): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      onFulfill();
      return;
    }

    const { status, steps, asset_location } = response;
    const { simpleRoute } = history;
    const prevRouteIndex = history.routeIndex;

    history.status = status;
    history.trackError = undefined;

    // This might be the state where tracking has just started,
    // so handle the error and retry
    if (!steps || steps.length === 0) {
      if (status === SwapV2TxStatus.IN_PROGRESS) {
        onError();
      } else {
        // CHECK: what if partial success?
        history.trackDone = true;
        onFulfill();
      }
      return;
    }

    // find current step (not success first, otherwise last step)
    const currentStep =
      steps.find((s) => s.status !== SwapV2RouteStepStatus.SUCCESS) ??
      steps[steps.length - 1];

    // NOTE: The lengths of simpleRoute and steps may differ.
    let updatedRouteIndex = Math.max(0, history.routeIndex);
    if (currentStep.chain_id) {
      const normalizedStepChainId = currentStep.chain_id.toLowerCase();
      for (let i = 0; i < simpleRoute.length; i++) {
        const routeChainId = simpleRoute[i].chainId
          .replace("eip155:", "")
          .toLowerCase();
        if (routeChainId === normalizedStepChainId) {
          updatedRouteIndex = i;
          break;
        }
      }
    }

    const publishExecutableChains = (chainIds?: string[]) => {
      if (!history.backgroundExecutionId) {
        return;
      }
      const executableChainIds =
        chainIds ?? getExecutableChainIdsFromSwapV2History(history);
      this.publisher.publish({
        type: "executable",
        executionId: history.backgroundExecutionId,
        executableChainIds,
      });
    };

    switch (status) {
      case SwapV2TxStatus.IN_PROGRESS:
        // publish executable chains if routeIndex increased
        if (updatedRouteIndex > prevRouteIndex) {
          history.routeIndex = updatedRouteIndex;
          publishExecutableChains();
        }
        // Continue polling
        onError();
        break;

      case SwapV2TxStatus.SUCCESS:
      case SwapV2TxStatus.PARTIAL_SUCCESS:
      case SwapV2TxStatus.FAILED:
        // If current step is still in progress, retry a few more times before finalizing
        if (currentStep.status === SwapV2RouteStepStatus.IN_PROGRESS) {
          const maxRetries = 3;
          const retryCount = history.finalizationRetryCount ?? 0;

          if (retryCount < maxRetries) {
            history.finalizationRetryCount = retryCount + 1;
            onError();
            break;
          }
          // Max retries reached, fall through to finalize
        }

        let executableChainIdsToPublish: string[] | undefined;

        // NOTE: 현재 asset_location은 skip의 interchain operation인 경우에만 주어지는 값이다.
        if (asset_location) {
          const chainId = asset_location.chain_id;
          const evmLikeChainId = Number(chainId);
          const isEVMChainId =
            !Number.isNaN(evmLikeChainId) && evmLikeChainId > 0;
          const chainIdInKeplr = isEVMChainId ? `eip155:${chainId}` : chainId;
          const denomInKeplr = isEVMChainId
            ? `erc20:${asset_location.denom}`
            : asset_location.denom;

          // destination chain에 destination denom으로 도착했으면 완전 성공이므로
          // assetLocationInfo를 설정하지 않음
          const isDestinationReached =
            chainIdInKeplr === history.toChainId &&
            denomInKeplr.toLowerCase() ===
              history.destinationAsset.denom.toLowerCase();
          if (isDestinationReached) {
            history.routeIndex = simpleRoute.length - 1;
            executableChainIdsToPublish =
              getExecutableChainIdsFromSwapV2History(history, true);
            history.resAmount.push([
              {
                amount: asset_location.amount,
                denom: denomInKeplr,
              },
            ]);
          } else {
            /*
              Determine the type of asset location:
                - "intermediate": SUCCESS 상태이지만 asset_location이 최종 목적지가 아닌 경우
                  (예: base USDC -> osmosis OSMO 스왑 시, noble USDC가 먼저 도착하고
                  이후 noble USDC -> osmosis OSMO로 ibc swap하는 transaction이 필요한 경우)
                  이 경우 추가 transaction을 실행하거나 현재 받은 자산을 그대로 둘 수 있음
                - "refund": PARTIAL_SUCCESS/FAILED 상태로 자산이 중간에서 릴리즈된 경우
                  backgroundExecutionId가 있으면 멀티 transaction 케이스이고 추가 transaction이 필요할 수 있음
            */
            const assetLocationType: "refund" | "intermediate" =
              status === SwapV2TxStatus.SUCCESS && history.backgroundExecutionId
                ? "intermediate"
                : "refund";

            history.assetLocationInfo = {
              chainId: chainIdInKeplr,
              amount: [
                {
                  amount: asset_location.amount,
                  denom: denomInKeplr,
                },
              ],
              type: assetLocationType,
            };

            // asset location chain까지 routeIndex가 이동해야 하는지 확인
            const assetLocationChainIndex = simpleRoute.findIndex(
              (route) => route.chainId === chainIdInKeplr
            );
            if (
              assetLocationChainIndex !== -1 &&
              assetLocationChainIndex > updatedRouteIndex
            ) {
              history.routeIndex = assetLocationChainIndex;
            }
            executableChainIdsToPublish =
              getExecutableChainIdsFromSwapV2History(history);
          }
        } else if (status === SwapV2TxStatus.SUCCESS) {
          // For SUCCESS without asset_location, move routeIndex to end
          history.routeIndex = simpleRoute.length - 1;
          executableChainIdsToPublish = getExecutableChainIdsFromSwapV2History(
            history,
            true
          );
        }

        // Publish executable chains
        publishExecutableChains(executableChainIdsToPublish);

        // assetLocationInfo가 있으면 해당 위치, 없으면 최종 destination 사용
        const targetChainId = history.toChainId;
        const targetDenom = history.destinationAsset.denom;

        // 해당 위치의 tx_hash를 찾아서 자산 추적, 없을 수도 있다.
        const targetTxHash = (() => {
          const targetChainIdNormalized = targetChainId
            .replace("eip155:", "")
            .toLowerCase();
          const targetStep = steps.find((s) => {
            const stepChainId = s.chain_id?.toLowerCase();
            return stepChainId === targetChainIdNormalized && s.tx_hash;
          });
          return targetStep?.tx_hash ?? currentStep.tx_hash;
        })();

        // 이미 resAmount가 있거나 assetLocationInfo가 있으면 추가 트래킹 불필요
        const skipAssetTracking =
          history.resAmount.length > 0 || history.assetLocationInfo;
        if (!skipAssetTracking && targetTxHash) {
          this.trackSwapV2ReleasedAssetAmount(
            id,
            targetTxHash,
            targetChainId,
            targetDenom,
            onFulfill
          );
          break;
        }

        history.trackDone = true;
        onFulfill();
        break;
    }
  }

  /**
   * Track released asset amount from tx receipt.
   * - SUCCESS: destination asset 추적
   * - FAILED/PARTIAL_SUCCESS + assetLocationInfo: refund된 자산 추적
   */
  protected trackSwapV2ReleasedAssetAmount(
    historyId: string,
    txHash: string,
    targetChainId: string,
    targetDenom: string,
    onFulfill: () => void
  ) {
    const history = this.getRecentSwapV2History(historyId);
    if (!history) {
      onFulfill();
      return;
    }

    const chainInfo = this.chainsService.getChainInfo(targetChainId);
    if (!chainInfo) {
      onFulfill();
      return;
    }

    this.trackDestinationAssetAmount({
      chainId: targetChainId,
      txHash,
      recipient: history.recipient,
      targetDenom,
      onResult: (resAmount) => {
        runInAction(() => {
          history.resAmount.push(resAmount);
          history.trackDone = true;
        });
      },
      onRefund: (refundInfo, error) => {
        runInAction(() => {
          history.trackError = error;
          history.assetLocationInfo = {
            ...refundInfo,
            type: "refund",
          };
          history.trackDone = true;
        });
      },
      onFulfill: () => {
        runInAction(() => {
          history.trackDone = true;
        });
        onFulfill();
      },
    });
  }

  getRecentSwapV2History(id: string): SwapV2History | undefined {
    return this.recentSwapV2HistoryMap.get(id);
  }

  getRecentSwapV2Histories(): SwapV2History[] {
    return Array.from(this.recentSwapV2HistoryMap.values()).filter(
      (history) => {
        if (!this.chainsService.hasChainInfo(history.fromChainId)) {
          return false;
        }

        if (!this.chainsService.hasChainInfo(history.toChainId)) {
          return false;
        }

        if (
          history.simpleRoute.some((route) => {
            return !this.chainsService.hasChainInfo(route.chainId);
          })
        ) {
          return false;
        }

        return true;
      }
    );
  }

  @action
  removeRecentSwapV2History(id: string): boolean {
    const history = this.getRecentSwapV2History(id);
    const removed = this.recentSwapV2HistoryMap.delete(id);

    if (removed && history?.backgroundExecutionId) {
      this.publisher.publish({
        type: "remove",
        executionId: history.backgroundExecutionId,
      });
    }

    return removed;
  }

  @action
  clearAllRecentSwapV2History(): void {
    const executionIds: string[] = [];
    for (const history of this.recentSwapV2HistoryMap.values()) {
      if (history.backgroundExecutionId) {
        executionIds.push(history.backgroundExecutionId);
      }
    }

    this.recentSwapV2HistoryMap.clear();

    for (const executionId of executionIds) {
      this.publisher.publish({
        type: "remove",
        executionId,
      });
    }
  }

  @action
  hideSwapV2History(id: string): boolean {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return false;
    }

    if (!history.backgroundExecutionId) {
      return false;
    }

    // only hide if multi tx case
    history.hidden = true;
    return true;
  }

  @action
  showSwapV2History(id: string): boolean {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return false;
    }
    history.hidden = false;
    return true;
  }

  @action
  setSwapV2HistoryError(id: string, error: string): boolean {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return false;
    }

    history.trackError = error;
    history.trackDone = true;
    return true;
  }

  @action
  clearSwapV2HistoryBackgroundExecutionId(id: string): boolean {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return false;
    }

    history.backgroundExecutionId = undefined;
    return true;
  }

  @action
  setSwapV2AdditionalTrackingData(
    id: string,
    data:
      | { type: "evm"; chainId: string; txHash: string }
      | {
          type: "cosmos-ibc";
          ibcSwapData: IBCSwapMinimalTrackingData;
          txHash: string;
        }
  ): boolean {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return false;
    }

    if (data.type === "cosmos-ibc") {
      history.additionalTrackingData = {
        type: "cosmos-ibc",
        chainId: data.ibcSwapData.chainId,
        swapReceiver: data.ibcSwapData.swapReceiver,
        txHash: data.txHash,
        txFulfilled: false,
        ibcHistory: data.ibcSwapData.ibcChannels.map((ch) => ({
          portId: ch.portId,
          channelId: ch.channelId,
          counterpartyChainId: ch.counterpartyChainId,
          completed: false,
        })),
      };
    } else {
      history.additionalTrackingData = data;
    }

    history.additionalTrackDone = false;
    history.additionalTrackError = undefined;

    this.trackSwapV2AdditionalRecursive(id);

    return true;
  }

  trackSwapV2AdditionalRecursive(id: string): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return;
    }

    // no additional tracking data
    if (!history.additionalTrackingData) {
      return;
    }

    // already done
    if (history.additionalTrackDone) {
      return;
    }

    if (history.additionalTrackingData.type === "evm") {
      this.trackSwapV2AdditionalEVM(id);
    } else if (history.additionalTrackingData.type === "cosmos-ibc") {
      this.trackIBCPacketForwardingRecursive((onFulfill, onClose, onError) => {
        this.trackSwapV2AdditionalCosmosIBCInternal(
          id,
          onFulfill,
          onClose,
          onError
        );
      });
    }
  }

  protected trackSwapV2AdditionalEVM(id: string): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      return;
    }

    if (history.additionalTrackingData?.type !== "evm") {
      return;
    }

    const txHash = history.additionalTrackingData.txHash;

    this.traceEVMTransactionResult({
      chainId: history.toChainId,
      txHash,
      recipient: history.recipient,
      targetDenom: history.destinationAsset.denom,
      onResult: (result) => {
        runInAction(() => {
          if (result.success && result.resAmount) {
            history.resAmount.push(result.resAmount);
            history.assetLocationInfo = undefined;
          } else if (result.refundInfo) {
            history.additionalTrackError = result.error;
            history.assetLocationInfo = {
              ...result.refundInfo,
              type: "refund",
            };
          }
          history.additionalTrackDone = true;
        });
      },
      onFulfill: () => {
        runInAction(() => {
          history.additionalTrackDone = true;
        });
      },
    });
  }

  protected trackSwapV2AdditionalCosmosIBCInternal(
    id: string,
    onFulfill: () => void,
    onClose: () => void,
    onError: () => void
  ): void {
    const history = this.getRecentSwapV2History(id);
    if (!history) {
      onFulfill();
      return;
    }

    if (history.additionalTrackDone) {
      onFulfill();
      return;
    }

    const existingTrackingData = history.additionalTrackingData;
    if (!existingTrackingData || existingTrackingData.type !== "cosmos-ibc") {
      onFulfill();
      return;
    }

    const trackingData = existingTrackingData;

    const { chainId, txHash, ibcHistory, swapReceiver, txFulfilled } =
      trackingData;

    // Step 1: tx가   완료되지 않았으면 tx 완료 대기
    if (!txFulfilled) {
      this.trackIBCTxFulfillment({
        chainId,
        txHash,
        ibcHistory,
        swapReceiver,
        onTxFulfilled: (_tx, hopUpdate, firstHopResAmount) => {
          runInAction(() => {
            trackingData.txFulfilled = true;

            if (firstHopResAmount) {
              history.resAmount.push(firstHopResAmount);
              history.routeIndex++;
            }
            if (hopUpdate) {
              const target = ibcHistory[hopUpdate.index];
              if (target) {
                target.sequence = hopUpdate.sequence;
                target.dstChannelId = hopUpdate.dstChannelId;
              }
            }
          });
          this.trackIBCPacketForwardingRecursive(
            (onFulfill, onClose, onError) => {
              this.trackSwapV2AdditionalCosmosIBCInternal(
                id,
                onFulfill,
                onClose,
                onError
              );
            }
          );
        },
        onTxError: (error) => {
          runInAction(() => {
            history.additionalTrackError = error;
            history.additionalTrackDone = true;
          });
        },
        onFulfill,
        onClose,
        onError,
      });
      return;
    }

    const targetChannelIndex = ibcHistory.findIndex((h) => !h.completed);
    if (targetChannelIndex < 0 || !ibcHistory[targetChannelIndex].sequence) {
      runInAction(() => {
        history.additionalTrackDone = true;
      });
      onFulfill();
      return;
    }

    this.trackIBCHopRecvPacket({
      ibcHistory,
      targetChannelIndex,
      swapReceiver,
      onHopCompleted: (resAmount) => {
        runInAction(() => {
          if (resAmount) {
            history.resAmount.push(resAmount);
          }
          history.routeIndex++;
        });
      },
      onAllCompleted: () => {
        runInAction(() => {
          history.additionalTrackDone = true;
          // CHECK: resAmount에 아무것도 안들어있을 수 있음
          // ex. noble USDC -> osmosis OSMO 스왑 시, ibc_transfer 메시지의 memo를 파싱해야 할 수도 있음...
          history.assetLocationInfo = undefined;
        });
        onFulfill();
      },
      onContinue: () => {
        onFulfill();
        this.trackIBCPacketForwardingRecursive(
          (onFulfill, onClose, onError) => {
            this.trackSwapV2AdditionalCosmosIBCInternal(
              id,
              onFulfill,
              onClose,
              onError
            );
          }
        );
      },
      onFulfill,
      onClose,
      onError,
    });
  }

  // ============================================================================
  // IBC Packet Tracking Core Functions
  // ============================================================================

  /**
   * IBC tx 완료 대기 및 첫 번째 hop sequence 추출
   */
  protected trackIBCTxFulfillment(params: {
    chainId: string;
    txHash: string;
    ibcHistory: {
      portId: string;
      channelId: string;
      sequence?: string;
      dstChannelId?: string;
    }[];
    swapReceiver?: string[];
    onTxFulfilled: (
      tx: any,
      hopUpdate:
        | {
            index: number;
            sequence?: string;
            dstChannelId?: string;
          }
        | undefined,
      firstHopResAmount?: { amount: string; denom: string }[]
    ) => void;
    onTxError: (error: string) => void;
    onFulfill: () => void;
    onClose: () => void;
    onError: () => void;
  }): void {
    const {
      chainId,
      txHash,
      ibcHistory,
      swapReceiver,
      onTxFulfilled,
      onTxError,
      onFulfill,
      onClose,
      onError,
    } = params;

    const chainInfo = this.chainsService.getChainInfo(chainId);
    if (!chainInfo) {
      onFulfill();
      return;
    }

    const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
    txTracer.addEventListener("close", onClose);
    txTracer.addEventListener("error", onError);

    txTracer.traceTx(Buffer.from(txHash, "hex")).then((tx) => {
      txTracer.close();

      if (tx.code != null && tx.code !== 0) {
        onTxError(tx.log || tx.raw_log || "Tx failed");
        onFulfill();
        return;
      }

      let resAmount: { amount: string; denom: string }[] | undefined;
      let hopUpdate:
        | {
            index: number;
            sequence?: string;
            dstChannelId?: string;
          }
        | undefined;

      if (swapReceiver && swapReceiver.length > 0) {
        resAmount = this.getIBCSwapResAmountFromTx(tx, swapReceiver[0]);
      }

      if (ibcHistory.length > 0) {
        const firstChannel = ibcHistory[0];

        firstChannel.sequence = this.getIBCPacketSequenceFromTx(
          tx,
          firstChannel.portId,
          firstChannel.channelId
        );
        firstChannel.dstChannelId = this.getDstChannelIdFromTx(
          tx,
          firstChannel.portId,
          firstChannel.channelId
        );

        hopUpdate = {
          index: 0,
          sequence: firstChannel.sequence,
          dstChannelId: firstChannel.dstChannelId,
        };
      }

      onTxFulfilled(tx, hopUpdate, resAmount);
      onFulfill();
    });
  }

  /**
   * IBC hop recv_packet 이벤트 감시 및 다음 hop 설정
   */
  protected trackIBCHopRecvPacket(params: {
    ibcHistory: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
      sequence?: string;
      dstChannelId?: string;
      completed: boolean;
      error?: string;
    }[];
    targetChannelIndex: number;
    swapReceiver?: string[];
    onHopCompleted: (
      resAmount?: { amount: string; denom: string }[],
      tx?: any
    ) => void;
    onAllCompleted: () => void;
    onContinue: () => void;
    onFulfill: () => void;
    onClose: () => void;
    onError: () => void;
  }): TendermintTxTracer | undefined {
    const {
      ibcHistory,
      targetChannelIndex,
      swapReceiver,
      onHopCompleted,
      onAllCompleted,
      onContinue,
      onFulfill,
      onClose,
      onError,
    } = params;

    const targetChannel = ibcHistory[targetChannelIndex];
    const nextChannel =
      targetChannelIndex + 1 < ibcHistory.length
        ? ibcHistory[targetChannelIndex + 1]
        : undefined;

    if (!targetChannel || !targetChannel.sequence) {
      onAllCompleted();
      return;
    }
    const sequence = targetChannel.sequence;

    const counterpartyChainInfo = this.chainsService.getChainInfo(
      targetChannel.counterpartyChainId
    );

    if (!counterpartyChainInfo) {
      onFulfill();
      return;
    }

    const txTracer = new TendermintTxTracer(
      counterpartyChainInfo.rpc,
      "/websocket"
    );
    txTracer.addEventListener("close", onClose);
    txTracer.addEventListener("error", onError);

    // recv_packet 이벤트 감시 (dstChannelId가 있으면 사용, 없으면 src_channel 사용)
    const queryEvents: Record<string, string> = targetChannel.dstChannelId
      ? {
          "recv_packet.packet_dst_channel": targetChannel.dstChannelId,
          "recv_packet.packet_sequence": sequence,
        }
      : {
          "recv_packet.packet_src_channel": targetChannel.channelId,
          "recv_packet.packet_sequence": sequence,
        };

    txTracer.traceTx(queryEvents).then((res) => {
      txTracer.close();

      if (!res) {
        onError();
        return;
      }

      const txs = res.txs
        ? res.txs.map((t: any) => t.tx_result || t)
        : [res.tx_result || res];

      const matchedTx = txs.find((tx: any) => {
        const idx = this.getIBCRecvPacketIndexFromTx(
          tx,
          targetChannel.portId,
          targetChannel.channelId,
          sequence
        );
        return idx >= 0;
      });

      const tx = matchedTx || txs[0];

      targetChannel.completed = true;

      let resAmount: { amount: string; denom: string }[] | undefined;
      const receiverIndex = targetChannelIndex + 1;

      if (tx && swapReceiver && receiverIndex < swapReceiver.length) {
        const index = this.getIBCRecvPacketIndexFromTx(
          tx,
          targetChannel.portId,
          targetChannel.channelId,
          sequence
        );

        if (index >= 0) {
          resAmount = this.getIBCSwapResAmountFromTx(
            tx,
            swapReceiver[receiverIndex],
            index
          );
        }
      }

      onHopCompleted(resAmount, tx);

      if (nextChannel && tx) {
        // 다음 hop 설정
        const index = this.getIBCRecvPacketIndexFromTx(
          tx,
          targetChannel.portId,
          targetChannel.channelId,
          sequence
        );

        if (index >= 0) {
          nextChannel.sequence = this.getIBCPacketSequenceFromTx(
            tx,
            nextChannel.portId,
            nextChannel.channelId,
            index
          );
          nextChannel.dstChannelId = this.getDstChannelIdFromTx(
            tx,
            nextChannel.portId,
            nextChannel.channelId,
            index
          );
        }

        onContinue();
      } else {
        onAllCompleted();
      }
    });

    return txTracer;
  }

  protected getIBCWriteAcknowledgementAckFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): Uint8Array | undefined {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "write_acknowledgement") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return;
    }

    let isBase64 = false;
    const ackAttr = packetEvent.attributes.find((attr: { key: string }) => {
      const r = compareStringWithBase64OrPlain(attr.key, "packet_ack");
      isBase64 = r[1];
      return r[0];
    });

    if (ackAttr) {
      if (isBase64) {
        return Buffer.from(ackAttr.value, "base64");
      } else {
        return Buffer.from(ackAttr.value);
      }
    }

    return;
  }

  protected getIBCSwapResAmountFromTx(
    tx: any,
    receiver: string,
    startEventsIndex: number = 0,
    endEventsIndex: number = -1
  ): {
    amount: string;
    denom: string;
  }[] {
    // Skip의 contract에서 편리하게 쓸 events를 발생시켜주지 않는 것 같다.
    // 그래서 엄밀하게 여기서 멀 하기가 힘들다.
    // 적당한 추론으로 99%의 케이스에서는 문제가 없는 방법을 시도한다...
    const events = tx.events.slice(
      startEventsIndex,
      endEventsIndex >= 0 ? endEventsIndex : undefined
    ) as {
      type: string;
      attributes: {
        key: string;
        value: string;
      }[];
    }[];

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    // 일단 마지막으로 받은 events가 tx의 결과에 가장 가까이 있을 것이다...
    // 단순하게 그냥 마지막 coin_received를 찾는다.
    const receiveEvent = events.reverse().find((event) => {
      if (event.type === "coin_received") {
        const attr = event.attributes.find((attr) => {
          return (
            compareStringWithBase64OrPlain(attr.key, "receiver")[0] &&
            compareStringWithBase64OrPlain(attr.value, receiver)[0]
          );
        });

        if (attr) {
          return true;
        }
      }

      return false;
    });

    if (receiveEvent) {
      let isBase64 = false;
      const amountAttr = receiveEvent.attributes.find((attr) => {
        const c = compareStringWithBase64OrPlain(attr.key, "amount");
        isBase64 = c[1];
        return c[0];
      });
      if (amountAttr) {
        const amount = isBase64
          ? Buffer.from(amountAttr.value, "base64").toString()
          : amountAttr.value;
        const split = amount.split(/^([0-9]+)(\s)*([a-zA-Z][a-zA-Z0-9/-]*)$/);

        // 이 if 문을 만족 못하면 이미 망한건데... 머 따로 오류 처리할 마땅한 방법이 없으니 일단 패스...
        if (split.length === 5) {
          const amount = split[1];
          const denom = split[3];
          return [
            {
              denom,
              amount,
            },
          ];
        }
      }
    }

    return [];
  }

  protected getIBCAcknowledgementPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "acknowledge_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getIBCTimeoutPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "timeout_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getLastIBCTimeoutPacketBeforeIndexFromTx(
    tx: any,
    index: number
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }
    const reversedIndex = events
      .slice(0, index)
      .reverse()
      .findIndex((event) => {
        if (event.type === "timeout_packet") {
          return true;
        }
      });

    if (reversedIndex >= 0) {
      return index - reversedIndex - 1;
    }
    return -1;
  }

  protected getIBCRecvPacketIndexFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    sequence: string
  ): number {
    const events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    const packetEvent = events.find((event: any) => {
      if (event.type !== "recv_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          return compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          )[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      let isBase64 = false;
      const sequenceAttr = event.attributes.find((attr: { key: string }) => {
        const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
        isBase64 = c[1];
        return c[0];
      });
      if (!sequenceAttr) {
        return false;
      }

      if (isBase64) {
        return (
          Buffer.from(sourcePortAttr.value, "base64").toString() ===
            sourcePortId &&
          Buffer.from(sourceChannelAttr.value, "base64").toString() ===
            sourceChannelId &&
          Buffer.from(sequenceAttr.value, "base64").toString() === sequence
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId &&
          sequenceAttr.value === sequence
        );
      }
    });
    if (!packetEvent) {
      return -1;
    }

    return events.indexOf(packetEvent);
  }

  protected getIBCPacketSequenceFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    startingEventIndex = 0
  ): string {
    let events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    events = events.slice(startingEventIndex);

    const packetEvent = events.find((event: any) => {
      if (event.type !== "send_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      let isBase64 = false;
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      if (isBase64) {
        return (
          sourcePortAttr.value ===
            Buffer.from(sourcePortId).toString("base64") &&
          sourceChannelAttr.value ===
            Buffer.from(sourceChannelId).toString("base64")
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId
        );
      }
    });

    let isBase64 = false;
    if (packetEvent) {
      const sequenceAttr = packetEvent.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(attr.key, "packet_sequence");
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sequenceAttr) {
        throw new Error("Invalid tx");
      }

      if (isBase64) {
        return Buffer.from(sequenceAttr.value, "base64").toString();
      } else {
        return sequenceAttr.value;
      }
    }

    throw new Error("Invalid tx");
  }

  protected getDstChannelIdFromTx(
    tx: any,
    sourcePortId: string,
    sourceChannelId: string,
    startingEventIndex = 0
  ): string {
    let events = tx.events;
    if (!events) {
      throw new Error("Invalid tx");
    }
    if (!Array.isArray(events)) {
      throw new Error("Invalid tx");
    }

    // In injective, events from tendermint rpc is not encoded as base64.
    // I don't know that this is the difference from tendermint version, or just custom from injective.
    const compareStringWithBase64OrPlain = (
      target: string,
      value: string
    ): [boolean, boolean] => {
      if (target === value) {
        return [true, false];
      }

      if (target === Buffer.from(value).toString("base64")) {
        return [true, true];
      }

      return [false, false];
    };

    events = events.slice(startingEventIndex);

    const packetEvent = events.find((event: any) => {
      if (event.type !== "send_packet") {
        return false;
      }
      const sourcePortAttr = event.attributes.find((attr: { key: string }) => {
        return compareStringWithBase64OrPlain(attr.key, "packet_src_port")[0];
      });
      if (!sourcePortAttr) {
        return false;
      }
      let isBase64 = false;
      const sourceChannelAttr = event.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_src_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!sourceChannelAttr) {
        return false;
      }
      if (isBase64) {
        return (
          sourcePortAttr.value ===
            Buffer.from(sourcePortId).toString("base64") &&
          sourceChannelAttr.value ===
            Buffer.from(sourceChannelId).toString("base64")
        );
      } else {
        return (
          sourcePortAttr.value === sourcePortId &&
          sourceChannelAttr.value === sourceChannelId
        );
      }
    });

    let isBase64 = false;
    if (packetEvent) {
      const dstChannelIdAttr = packetEvent.attributes.find(
        (attr: { key: string }) => {
          const c = compareStringWithBase64OrPlain(
            attr.key,
            "packet_dst_channel"
          );
          isBase64 = c[1];
          return c[0];
        }
      );
      if (!dstChannelIdAttr) {
        throw new Error("Invalid tx");
      }

      if (isBase64) {
        return Buffer.from(dstChannelIdAttr.value, "base64").toString();
      } else {
        return dstChannelIdAttr.value;
      }
    }

    throw new Error("Invalid tx");
  }

  // ============================================================================
  // Chain removed handler
  // ============================================================================
  protected readonly onChainRemoved = (chainInfo: ChainInfo) => {
    const chainIdentifier = ChainIdHelper.parse(chainInfo.chainId).identifier;

    runInAction(() => {
      const removingIds: string[] = [];
      for (const history of this.recentIBCHistoryMap.values()) {
        if (
          ChainIdHelper.parse(history.chainId).identifier === chainIdentifier
        ) {
          removingIds.push(history.id);
          continue;
        }

        if (
          ChainIdHelper.parse(history.destinationChainId).identifier ===
          chainIdentifier
        ) {
          removingIds.push(history.id);
          continue;
        }

        if (
          history.ibcHistory.some((history) => {
            return (
              ChainIdHelper.parse(history.counterpartyChainId).identifier ===
              chainIdentifier
            );
          })
        ) {
          removingIds.push(history.id);
          continue;
        }
      }

      for (const id of removingIds) {
        this.recentIBCHistoryMap.delete(id);
      }
    });
  };
}

// ============================================================================
// Get executable chain ids from history
// ============================================================================
function getExecutableChainIdsFromIBCHistory(history: IBCHistory): string[] {
  const chainIds: string[] = [history.chainId];

  for (const channel of history.ibcHistory) {
    if (channel.completed) {
      chainIds.push(channel.counterpartyChainId);
      if (channel.dstChannelId) {
        chainIds.push(channel.dstChannelId);
      }
    } else {
      break;
    }
  }

  return chainIds;
}

function getExecutableChainIdsFromSwapV2History(
  history: SwapV2History,
  includeAllChainIds: boolean = false
): string[] {
  const chainIds: string[] = [];

  const endIndex = includeAllChainIds
    ? history.simpleRoute.length
    : Math.max(0, history.routeIndex + 1);

  for (let i = 0; i < endIndex; i++) {
    chainIds.push(history.simpleRoute[i].chainId);
  }

  if (
    history.assetLocationInfo &&
    history.assetLocationInfo.type === "intermediate"
  ) {
    chainIds.push(history.assetLocationInfo.chainId);
  }

  return chainIds;
}
