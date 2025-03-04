import { ChainGetter } from "@keplr-wallet/stores";
import { Keplr, SupportedPaymentType } from "@keplr-wallet/types";
import { action, makeObservable, observable } from "mobx";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BitcoinTxSizeEstimator } from "./tx-size-estimator";
import { SelectUTXOsParams, UTXO, UTXOSelection } from "./types";
import { DUST_RELAY_FEE_RATE, DUST_THRESHOLD } from "./constant";
import validate, { AddressInfo } from "bitcoin-address-validation";
import { getAddressInfo } from "bitcoin-address-validation";

export class BitcoinAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  /**
   * Select UTXOs for transaction targets
   * @param utxos UTXOs associated with the sender's address (must be of the same payment type - p2wpkh, p2tr)
   * @param recipients Recipients of the transaction with amount and address
   * @param changeAddress Address to receive change amount
   * @param feeRate Transaction fee rate in sat/vB
   * @param inscriptionUtxos UTXOs containing inscriptions (for Ordinals)
   * @param runesUtxos UTXOs containing Runes protocol data
   * @param dustRelayFeeRate Fee rate for dust outputs
   * @returns {selectedUtxos, recipients, fee, txSize} Selected UTXOs, recipients, transaction fee, and transaction size
   */
  selectUTXOs({
    utxos,
    recipients,
    changeAddress,
    feeRate,
    inscriptionUtxos,
    runesUtxos,
    dustRelayFeeRate = DUST_RELAY_FEE_RATE,
    noChange = false,
  }: SelectUTXOsParams): UTXOSelection | null {
    // Validate required inputs
    if (
      !utxos.length ||
      !recipients.length ||
      !changeAddress ||
      feeRate <= 0 ||
      dustRelayFeeRate <= 0
    ) {
      return null;
    }

    // check payment type and currency
    const paymentType = this.chainId.split(":")[2] as SupportedPaymentType;
    if (paymentType !== "native-segwit" && paymentType !== "taproot") {
      return null;
    }

    const currency = this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .getCurrencies("bitcoin")[0];

    if (!currency) return null;

    // exclude utxos containing inscriptions or runes
    const utxosToExclude = [...(inscriptionUtxos ?? []), ...(runesUtxos ?? [])];

    const utxosToExcludeIds = new Set();

    for (const utxo of utxosToExclude) {
      utxosToExcludeIds.add(`${utxo.txid}:${utxo.vout}`);
    }

    const filteredUtxos: UTXO[] = utxos.filter(
      (utxo) => !utxosToExcludeIds.has(`${utxo.txid}:${utxo.vout}`)
    );

    if (filteredUtxos.length === 0) return null;

    // validate recipients
    const validAddresses = recipients
      .map(
        (recipient) =>
          validate(recipient.address) && getAddressInfo(recipient.address)
      )
      .filter(Boolean) as AddressInfo[];

    // CHECK: approve no recipient?
    if (!validAddresses.length) {
      return null;
    }

    // count address type of recipients for output params
    const outputAddressTypeCounts = validAddresses.reduce(
      (acc, addressInfo) => {
        acc[addressInfo.type] = (acc[addressInfo.type] || 0) + 1;
        return acc;
      },
      {} as Record<AddressInfo["type"], number>
    );

    if (!noChange) {
      outputAddressTypeCounts[
        paymentType === "native-segwit" ? "p2wpkh" : "p2tr"
      ] =
        (outputAddressTypeCounts[
          paymentType === "native-segwit" ? "p2wpkh" : "p2tr"
        ] || 0) + 1;
    }

    const outputParams = Object.entries(outputAddressTypeCounts).reduce(
      (acc, [type, count]) => {
        acc[type + "_output_count"] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    // descending order
    const sortedUtxos = filteredUtxos.sort((a, b) => b.value - a.value);

    const targetAmount = recipients.reduce(
      (sum, recipient) => sum.add(new Int(recipient.amount)),
      new Int(0)
    );
    const txSizeEstimator = new BitcoinTxSizeEstimator();

    const selectedUtxos: UTXO[] = [];
    let selectedAmount = new Int(0);

    for (const candidate of sortedUtxos) {
      const txSize = txSizeEstimator.calcTxSize({
        input_count: selectedUtxos.length,
        input_script: paymentType === "native-segwit" ? "p2wpkh" : "p2tr",
        input_m: 1,
        input_n: 1,
        ...outputParams,
      });

      const fee = new Int(Math.ceil(txSize.txVBytes * feeRate));

      const txSizeWithCandidate = txSizeEstimator.calcTxSize({
        input_count: selectedUtxos.length + 1,
        input_script: paymentType === "native-segwit" ? "p2wpkh" : "p2tr",
        input_m: 1,
        input_n: 1,
        ...outputParams,
      });

      const newFee = new Int(Math.ceil(txSizeWithCandidate.txVBytes * feeRate));

      const candidateFeeContribution = newFee.sub(fee);

      if (candidateFeeContribution.lt(new Int(0)))
        throw new Error(`candidateFeeContribution < 0`);
      // Only consider inputs with more value than the fee they require
      if (new Int(candidate.value).gt(candidateFeeContribution)) {
        if (selectedAmount.add(new Int(candidate.value)).gt(targetAmount)) {
          const newSelectedAmount = selectedAmount.add(
            new Int(candidate.value)
          );
          const remainderValue = newSelectedAmount
            .sub(targetAmount)
            .sub(newFee);

          // TODO: change the logic
          if (noChange && remainderValue.lte(new Int(DUST_THRESHOLD))) {
            selectedUtxos.push(candidate);
            selectedAmount = newSelectedAmount;
          } else {
            selectedUtxos.push(candidate);
            selectedAmount = newSelectedAmount;
          }
        }
      }

      return {
        selectedUtxos,
        recipients,
        fee: new CoinPretty(currency, fee.toString()),
        txSize: txSize.txVBytes,
      };
    }

    return null;
  }

  @action
  buildPsbt() {
    // receive utxos
    // filter utxos by status and inscribed
    // select proper utxos for amount and fee
    // sign with dummy private key for accurate fee calculation
    // build psbt
    // return psbt
  }

  // TODO: make send tx with utxo including fee

  // TODO: sign and push tx (keplr interface 확장 필요)

  // TODO: track tx status (이거 좀 어려움)

  // static validate address
}
