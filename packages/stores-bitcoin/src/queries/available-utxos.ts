import { ChainGetter, QuerySharedContext } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import {
  ObservableQueryBitcoinUTXOs,
  ObservableQueryBitcoinUTXOsImpl,
} from "./utxos";
import {
  ObservableQueryBitcoinAddressTxs,
  ObservableQueryBitcoinAddressTxsImpl,
} from "./address-txs";
import { UTXO } from "./types";
import { Dec } from "@keplr-wallet/unit";

const uncommercialSatoshiThreshold = 10000;

// TODO: add inscription, runes query
export class ObservableQueryBitcoinAvailableUTXOsImpl {
  constructor(
    protected readonly queryBitcoinUTXOsImpl: DeepReadonly<ObservableQueryBitcoinUTXOsImpl>,
    protected readonly queryBitcoinAddressTxsImpl: DeepReadonly<ObservableQueryBitcoinAddressTxsImpl>
  ) {}

  get availableUTXOs(): UTXO[] | undefined {
    const utxos = this.queryBitcoinUTXOsImpl.UTXOs;
    const txs = this.queryBitcoinAddressTxsImpl.txs;

    if (!utxos || !txs) {
      return;
    }

    const unspendableUTXOs = new Set<string>();
    for (const tx of txs) {
      for (const vin of tx.vin) {
        if (vin.is_coinbase) {
          continue;
        }

        unspendableUTXOs.add(`${vin.txid}:${vin.vout}`);
      }
    }

    return utxos.filter((utxo) => {
      if (unspendableUTXOs.has(`${utxo.txid}:${utxo.vout}`)) {
        return false;
      }

      return utxo.status.confirmed && utxo.value > uncommercialSatoshiThreshold;
    });
  }

  get availableUTXOValues(): Dec | undefined {
    const utxos = this.availableUTXOs;
    if (!utxos) {
      return;
    }

    return utxos.reduce(
      (acc, utxo) => acc.add(new Dec(utxo.value)),
      new Dec(0)
    );
  }
}

export class ObservableQueryBitcoinAvailableUTXOs {
  protected map: Map<string, ObservableQueryBitcoinAvailableUTXOsImpl> =
    new Map();

  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly queryBitcoinUTXOs: DeepReadonly<ObservableQueryBitcoinUTXOs>,
    protected readonly queryBitcoinAddressTxs: DeepReadonly<ObservableQueryBitcoinAddressTxs>
  ) {}

  getAvailableUTXOs(
    chainId: string,
    chainGetter: ChainGetter,
    address: string
  ): ObservableQueryBitcoinAvailableUTXOsImpl | undefined {
    const key = `${chainId}/${address}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const utxos = this.queryBitcoinUTXOs.getUTXOs(
      chainId,
      chainGetter,
      address
    );
    const txs = this.queryBitcoinAddressTxs.getTxs(
      chainId,
      chainGetter,
      address
    );

    if (!utxos || !txs) {
      return;
    }

    const impl = new ObservableQueryBitcoinAvailableUTXOsImpl(utxos, txs);
    this.map.set(key, impl);

    return impl;
  }
}
