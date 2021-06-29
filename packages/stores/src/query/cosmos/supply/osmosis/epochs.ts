import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { Epochs } from "./types";
import { computed, observable } from "mobx";

export class ObservableQueryOsmosisEpochsInner {
  constructor(
    protected readonly identifier: string,
    protected readonly queryEpochs: ObservableQueryOsmosisEpochs
  ) {}

  @computed
  get epoch(): Epochs["epochs"][0] | undefined {
    return this.queryEpochs.response?.data.epochs.find(
      (epoch) => epoch.identifier === this.identifier
    );
  }

  @computed
  get duration(): number {
    if (!this.epoch) {
      return 0;
    }

    // Actually, the date type of golang protobuf is returned by the unit of seconds.
    return parseInt(this.epoch.duration.replace("s", ""));
  }

  @computed
  get startTime(): Date {
    if (!this.epoch) {
      return new Date(0);
    }

    return new Date(this.epoch.current_epoch_start_time);
  }

  @computed
  get endTime(): Date {
    const startTime = this.startTime;
    if (!this.duration) {
      return startTime;
    }

    return new Date(startTime.getTime() + this.duration * 1000);
  }
}

export class ObservableQueryOsmosisEpochs extends ObservableChainQuery<Epochs> {
  @observable.shallow
  protected map: Map<string, ObservableQueryOsmosisEpochsInner> = new Map();

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/epochs/v1beta1/epochs");
  }

  getEpoch(identifier: string) {
    if (!this.map.has(identifier)) {
      const inner = new ObservableQueryOsmosisEpochsInner(identifier, this);
      this.map.set(identifier, inner);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(identifier)!;
  }
}
