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

export class RecentSendHistoryService {
  // Key: {chain_identifier}/{type}
  @observable
  protected readonly recentSendHistoryMap: Map<string, RecentSendHistory[]> =
    new Map();

  // Key: id
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

    const recentIBCTransferHistoryMapSaved = await this.kvStore.get<
      Record<string, IBCTransferHistory>
    >("recentIBCTransferHistoryMap");
    if (recentIBCTransferHistoryMapSaved) {
      runInAction(() => {
        for (const [key, value] of Object.entries(
          recentIBCTransferHistoryMapSaved
        )) {
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

      this.trackIBCPacketForwardingRecersive(id);
    }

    return txHash;
  }

  trackIBCPacketForwardingRecersive(id: string) {
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
            }

            if (history.ibcHistory.length > 0) {
              const firstChannel = history.ibcHistory[0];

              const events = tx.events;
              if (!events) {
                throw new Error("Invalid tx");
              }
              if (!Array.isArray(events)) {
                throw new Error("Invalid tx");
              }

              const packetEvent = events.find((event) => {
                if (event.type !== "send_packet") {
                  return false;
                }
                const sourcePortAttr = event.attributes.find(
                  (attr: { key: string }) => {
                    return (
                      attr.key ===
                      Buffer.from("packet_src_port").toString("base64")
                    );
                  }
                );
                if (!sourcePortAttr) {
                  return false;
                }
                const sourceChannelAttr = event.attributes.find(
                  (attr: { key: string }) => {
                    return (
                      attr.key ===
                      Buffer.from("packet_src_channel").toString("base64")
                    );
                  }
                );
                if (!sourceChannelAttr) {
                  return false;
                }
                return (
                  sourcePortAttr.value ===
                    Buffer.from(firstChannel.portId).toString("base64") &&
                  sourceChannelAttr.value ===
                    Buffer.from(firstChannel.channelId).toString("base64")
                );
              });

              if (packetEvent) {
                const sequenceAttr = packetEvent.attributes.find(
                  (attr: { key: string }) => {
                    return (
                      attr.key ===
                      Buffer.from("packet_sequence").toString("base64")
                    );
                  }
                );
                if (!sequenceAttr) {
                  return;
                }

                firstChannel.sequence = Buffer.from(
                  sequenceAttr.value,
                  "base64"
                ).toString();

                this.trackIBCPacketForwardingRecersive(id);
              }
            }
          });
        });
      }
    } else if (history.ibcHistory.length > 0) {
      const targetChannel = history.ibcHistory.find((history) => {
        return !history.completed;
      });

      if (targetChannel && targetChannel.sequence) {
        const chainInfo = this.chainsService.getChainInfo(
          targetChannel.counterpartyChainId
        );
        if (chainInfo) {
          const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
          txTracer
            .traceTx({
              "recv_packet.packet_src_port": targetChannel.portId,
              "recv_packet.packet_src_channel": targetChannel.channelId,
              "recv_packet.packet_sequence": targetChannel.sequence,
            })
            .then((tx) => {
              txTracer.close();

              runInAction(() => {
                if (tx.code != null && tx.code !== 0) {
                  targetChannel.completed = true;

                  this.trackIBCPacketForwardingRecersive(id);
                }
              });
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
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const id = Buffer.from(bytes).toString("hex");

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

  @action
  removeRecentIBCTransferHistory(id: string): boolean {
    return this.recentIBCTransferHistoryMap.delete(id);
  }
}
