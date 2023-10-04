import { ChainsService } from "../chains";
import {
  Bech32Address,
  ChainIdHelper,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
import { BackgroundTxService } from "../tx";
import {
  action,
  autorun,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { IBCHistory, RecentSendHistory } from "./types";
import { Buffer } from "buffer/";
import { ChainInfo } from "@keplr-wallet/types";

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

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainsService: ChainsService,
    protected readonly txService: BackgroundTxService
  ) {
    makeObservable(this);
  }

  async init(): Promise<void> {
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
      this.trackIBCPacketForwardingRecursive(history.id);
    }

    this.chainsService.addChainRemovedHandler(this.onChainRemoved);
  }

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
      | undefined
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config.bech32PrefixAccAddr
    );

    const destinationChainInfo =
      this.chainsService.getChainInfoOrThrow(destinationChainId);
    Bech32Address.validate(
      recipient,
      destinationChainInfo.bech32Config.bech32PrefixAccAddr
    );

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
        txHash
      );

      this.trackIBCPacketForwardingRecursive(id);
    }

    return txHash;
  }

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
    swapReceiver: string[]
  ): Promise<Uint8Array> {
    const sourceChainInfo =
      this.chainsService.getChainInfoOrThrow(sourceChainId);
    Bech32Address.validate(
      sender,
      sourceChainInfo.bech32Config.bech32PrefixAccAddr
    );

    this.chainsService.getChainInfoOrThrow(destinationChainId);

    const txHash = await this.txService.sendTx(sourceChainId, tx, mode, {
      silent,
    });

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
      txHash
    );

    this.trackIBCPacketForwardingRecursive(id);

    return txHash;
  }

  trackIBCPacketForwardingRecursive(id: string) {
    const history = this.getRecentIBCHistory(id);
    if (!history) {
      return;
    }

    const needRewind = (() => {
      if (!history.txFulfilled) {
        return false;
      }

      if (history.ibcHistory.length === 0) {
        return false;
      }

      return history.ibcHistory.find((h) => h.error != null) != null;
    })();

    if (needRewind) {
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
          txTracer
            .traceTx({
              "acknowledge_packet.packet_src_port": targetChannel.portId,
              "acknowledge_packet.packet_src_channel": targetChannel.channelId,
              "acknowledge_packet.packet_sequence": targetChannel.sequence,
            })
            .then(() => {
              runInAction(() => {
                targetChannel.rewound = true;
              });
              this.trackIBCPacketForwardingRecursive(id);
            });
        }
      }
    } else if (!history.txFulfilled) {
      const chainId = history.chainId;
      const chainInfo = this.chainsService.getChainInfo(chainId);
      const txHash = Buffer.from(history.txHash, "hex");

      if (chainInfo) {
        const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
        txTracer.traceTx(txHash).then((tx) => {
          txTracer.close();

          runInAction(() => {
            history.txFulfilled = true;
            if (tx.code != null && tx.code !== 0) {
              history.txError = tx.log || tx.raw_log || "Unknown error";

              // TODO: In this case, it is not currently displayed in the UI. So, delete it for now.
              //       어차피 tx 자체의 실패는 notification으로 알 수 있기 때문에 여기서 지우더라도 유저는 실패를 인지할 수 있다.
              this.removeRecentIBCHistory(id);
            } else {
              if ("swapReceiver" in history) {
                const resAmount = this.getIBCSwapResAmountFromTx(
                  tx,
                  history.swapReceiver[0]
                );

                history.resAmount.push(resAmount);
              }

              if (history.ibcHistory.length > 0) {
                const firstChannel = history.ibcHistory[0];

                firstChannel.sequence = this.getIBCPacketSequenceFromTx(
                  tx,
                  firstChannel.portId,
                  firstChannel.channelId
                );

                this.trackIBCPacketForwardingRecursive(id);
              }
            }
          });
        });
      }
    } else if (history.ibcHistory.length > 0) {
      const targetChannelIndex = history.ibcHistory.findIndex((history) => {
        return !history.completed;
      });
      const targetChannel =
        targetChannelIndex >= 0
          ? history.ibcHistory[targetChannelIndex]
          : undefined;
      const nextChannel =
        targetChannelIndex >= 0 &&
        targetChannelIndex + 1 < history.ibcHistory.length
          ? history.ibcHistory[targetChannelIndex + 1]
          : undefined;

      if (targetChannel && targetChannel.sequence) {
        const chainInfo = this.chainsService.getChainInfo(
          targetChannel.counterpartyChainId
        );
        if (chainInfo) {
          const queryEvents: any = {
            "recv_packet.packet_src_port": targetChannel.portId,
            "recv_packet.packet_src_channel": targetChannel.channelId,
            "recv_packet.packet_sequence": targetChannel.sequence,
          };

          const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
          txTracer.traceTx(queryEvents).then((res) => {
            txTracer.close();

            if (!res) {
              return;
            }

            const txs = res.txs || [res];
            if (txs && Array.isArray(txs)) {
              runInAction(() => {
                targetChannel.completed = true;

                for (const tx of txs) {
                  try {
                    const ack = this.getIBCWriteAcknowledgementAckFromTx(
                      tx,
                      targetChannel.portId,
                      targetChannel.channelId,
                      targetChannel.sequence!
                    );

                    if (ack && ack.length > 0) {
                      const str = Buffer.from(ack);
                      try {
                        const decoded = JSON.parse(str.toString());
                        if (decoded.error) {
                          // XXX: {key: 'packet_ack', value: '{"error":"ABCI code: 6: error handling packet: see events for details"}'}
                          //      오류가 있을 경우 이딴식으로 오류가 나오기 때문에 뭐 유저에게 보여줄 방법이 없다...
                          targetChannel.error = "Packet processing failed";
                          this.trackIBCPacketForwardingRecursive(id);
                          break;
                        }
                      } catch (e) {
                        // decode가 실패한 경우 사실 방법이 없다.
                        // 일단 packet이 성공했다고 치고 진행한다.
                        console.log(e);
                      }
                    }

                    // Because a tx can contain multiple messages, it's hard to know exactly which event we want.
                    // But logically, the events closest to the recv_packet event is the events we want.
                    const index = this.getIBCRecvPacketIndexFromTx(
                      tx,
                      targetChannel.portId,
                      targetChannel.channelId,
                      targetChannel.sequence!
                    );

                    if ("swapReceiver" in history) {
                      const res: {
                        amount: string;
                        denom: string;
                      }[] = this.getIBCSwapResAmountFromTx(
                        tx,
                        history.swapReceiver[targetChannelIndex + 1],
                        index
                      );

                      history.resAmount.push(res);
                    }

                    if (nextChannel) {
                      nextChannel.sequence = this.getIBCPacketSequenceFromTx(
                        tx,
                        nextChannel.portId,
                        nextChannel.channelId,
                        index
                      );
                      this.trackIBCPacketForwardingRecursive(id);
                      break;
                    }
                  } catch {
                    // noop
                  }
                }
              });
            }
          });
        }
      }
    }
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
    txHash: Uint8Array
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
      txHash: Buffer.from(txHash).toString("hex"),
    };

    this.recentIBCHistoryMap.set(id, history);

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
    txHash: Uint8Array
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
      txHash: Buffer.from(txHash).toString("hex"),
    };

    this.recentIBCHistoryMap.set(id, history);

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
      throw new Error("Invalid tx");
    }

    const index = events.indexOf(packetEvent);
    if (index < 0) {
      throw new Error("Invalid tx");
    }

    return index;
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
