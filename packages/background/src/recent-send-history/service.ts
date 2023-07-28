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
import { IBCTransferHistory, RecentSendHistory } from "./types";
import { Buffer } from "buffer/";
import { ChainInfo } from "@keplr-wallet/types";

export class RecentSendHistoryService {
  // Key: {chain_identifier}/{type}
  @observable
  protected readonly recentSendHistoryMap: Map<string, RecentSendHistory[]> =
    new Map();

  @observable
  protected recentIBCTransferHistorySeq: number = 0;
  // Key: id (sequence, it should be increased by 1 for each)
  @observable
  protected readonly recentIBCTransferHistoryMap: Map<
    string,
    IBCTransferHistory
  > = new Map();

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

    const recentIBCTransferHistorySeqSaved = await this.kvStore.get<number>(
      "recentIBCTransferHistorySeq"
    );
    if (recentIBCTransferHistorySeqSaved) {
      runInAction(() => {
        this.recentIBCTransferHistorySeq = recentIBCTransferHistorySeqSaved;
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCTransferHistorySeq);
      this.kvStore.set<number>("recentIBCTransferHistorySeq", js);
    });

    const recentIBCTransferHistoryMapSaved = await this.kvStore.get<
      Record<string, IBCTransferHistory>
    >("recentIBCTransferHistoryMap");
    if (recentIBCTransferHistoryMapSaved) {
      runInAction(() => {
        let entries = Object.entries(recentIBCTransferHistoryMapSaved);
        entries = entries.sort(([, a], [, b]) => {
          // There is no guarantee that the order of the object is same as the order of the last saved.
          // So we need to sort them.
          // id is increased by 1 for each.
          // So we can sort by id.
          return parseInt(a.id) - parseInt(b.id);
        });
        for (const [key, value] of entries) {
          this.recentIBCTransferHistoryMap.set(key, value);
        }
      });
    }
    autorun(() => {
      const js = toJS(this.recentIBCTransferHistoryMap);
      const obj = Object.fromEntries(js);
      this.kvStore.set<Record<string, IBCTransferHistory>>(
        "recentIBCTransferHistoryMap",
        obj
      );
    });

    for (const history of this.getRecentIBCTransferHistories()) {
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

  trackIBCPacketForwardingRecursive(id: string) {
    const history = this.getRecentIBCTransferHistory(id);
    if (!history) {
      return;
    }

    if (!history.txFulfilled) {
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
              this.removeRecentIBCTransferHistory(id);
            } else {
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
          if (nextChannel) {
            queryEvents["send_packet.packet_src_port"] = nextChannel.portId;
            queryEvents["send_packet.packet_src_channel"] =
              nextChannel.channelId;
          }

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

                if (nextChannel) {
                  for (const tx of txs) {
                    try {
                      // Because a tx can contain multiple messages, it's hard to know exactly which event we want.
                      // But logically, the send_packet event closest to the recv_packet event is the event we want.
                      const index = this.getIBCRecvPacketIndexFromTx(
                        tx,
                        targetChannel.portId,
                        targetChannel.channelId,
                        targetChannel.sequence!
                      );

                      nextChannel.sequence = this.getIBCPacketSequenceFromTx(
                        tx,
                        nextChannel.portId,
                        nextChannel.channelId,
                        index
                      );
                      this.trackIBCPacketForwardingRecursive(id);
                      break;
                    } catch {
                      // noop
                    }
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
    const id = (this.recentIBCTransferHistorySeq++).toString();

    const history: IBCTransferHistory = {
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

    this.recentIBCTransferHistoryMap.set(id, history);

    return id;
  }

  getRecentIBCTransferHistory(id: string): IBCTransferHistory | undefined {
    return this.recentIBCTransferHistoryMap.get(id);
  }

  getRecentIBCTransferHistories(): IBCTransferHistory[] {
    return Array.from(this.recentIBCTransferHistoryMap.values()).filter(
      (history) => {
        if (!this.chainsService.hasChainInfo(history.chainId)) {
          return false;
        }

        if (!this.chainsService.hasChainInfo(history.destinationChainId)) {
          return false;
        }

        if (
          history.ibcHistory.some((history) => {
            return !this.chainsService.hasChainInfo(
              history.counterpartyChainId
            );
          })
        ) {
          return false;
        }

        return true;
      }
    );
  }

  @action
  removeRecentIBCTransferHistory(id: string): boolean {
    return this.recentIBCTransferHistoryMap.delete(id);
  }

  @action
  clearAllRecentIBCTransferHistory(): void {
    this.recentIBCTransferHistoryMap.clear();
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
      for (const history of this.recentIBCTransferHistoryMap.values()) {
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
        this.recentIBCTransferHistoryMap.delete(id);
      }
    });
  };
}
