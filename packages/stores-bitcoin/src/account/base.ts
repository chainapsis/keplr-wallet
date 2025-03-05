import { ChainGetter } from "@keplr-wallet/stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  Keplr,
} from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { simpleFetch } from "@keplr-wallet/simple-fetch";
import { action, makeObservable, observable } from "mobx";
import validate, {
  AddressInfo,
  Network,
  getAddressInfo,
} from "bitcoin-address-validation";
import { Psbt, networks, address } from "bitcoinjs-lib";
import { BitcoinTxSizeEstimator } from "./tx-size-estimator";
import {
  BuildPsbtParams,
  SelectUTXOsParams,
  UTXO,
  UTXOSelection,
} from "./types";
import { DUST_RELAY_FEE_RATE, DUST_THRESHOLD } from "./constant";

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
   * @param feeRate Transaction fee rate in sat/vB
   * @param inscriptionUtxos UTXOs containing inscriptions (for Ordinals)
   * @param runesUtxos UTXOs containing Runes protocol data
   * @param dustRelayFeeRate Fee rate for dust outputs
   * @param changeAddress Address to receive change amount
   * @returns {selectedUtxos, recipients, estimatedFee, txSize} Selected UTXOs, recipients, transaction fee, and transaction size
   */
  selectUTXOs({
    utxos,
    recipients,
    feeRate,
    inscriptionUtxos = [],
    runesUtxos = [],
    dustRelayFeeRate = DUST_RELAY_FEE_RATE,
    changeAddress,
  }: SelectUTXOsParams): UTXOSelection | null {
    // 1. Basic validation
    if (
      !utxos.length ||
      !recipients.length ||
      feeRate <= 0 ||
      dustRelayFeeRate <= 0
    ) {
      return null;
    }

    // 2. Get network config
    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (
      !network ||
      (paymentType !== "native-segwit" && paymentType !== "taproot")
    ) {
      return null;
    }

    const currency = this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .getCurrencies("bitcoin")[0];
    if (!currency) return null;

    // 3. Filter and sort UTXOs
    const utxosToExclude = new Set<string>();
    for (const utxo of inscriptionUtxos) {
      utxosToExclude.add(`${utxo.txid}:${utxo.vout}`);
    }
    for (const utxo of runesUtxos) {
      utxosToExclude.add(`${utxo.txid}:${utxo.vout}`);
    }
    const sortedUtxos = utxos
      .filter((utxo) => !utxosToExclude.has(`${utxo.txid}:${utxo.vout}`))
      .sort((a, b) => b.value - a.value);

    if (sortedUtxos.length === 0) return null;

    // 4. Validate addresses
    const addressesToValidate: string[] = [];
    for (const recipient of recipients) {
      addressesToValidate.push(recipient.address);
    }
    if (changeAddress) {
      addressesToValidate.push(changeAddress);
    }

    const validAddresses = addressesToValidate
      .map((address) =>
        validate(address, network as unknown as Network, {
          castTestnetTo: network === "signet" ? Network.signet : undefined,
        })
          ? getAddressInfo(address, {
              castTestnetTo: network === "signet" ? Network.signet : undefined,
            })
          : null
      )
      .filter(Boolean) as AddressInfo[];

    if (!validAddresses.length) return null;

    // 5. Calculate output parameters
    const outputParams = validAddresses.reduce((acc, addressInfo) => {
      const key = `${addressInfo.type}_output_count`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 6. Calculate target amount
    const targetAmount = recipients.reduce(
      (sum, recipient) => sum.add(new Dec(recipient.amount)),
      new Dec(0)
    );

    // 7. Select UTXOs
    const txSizeEstimator = new BitcoinTxSizeEstimator();
    const selectedUtxos: UTXO[] = [];
    let selectedAmount = new Dec(0);
    let currentIndex = 0;

    for (const candidate of sortedUtxos) {
      // Calculate fees for current UTXOs selection
      const txSize = txSizeEstimator.calcTxSize({
        input_count: selectedUtxos.length,
        input_script: paymentType === "native-segwit" ? "p2wpkh" : "p2tr",
        input_m: 1,
        input_n: 1,
        ...outputParams,
      });

      const calculateFee = (size: number) => new Dec(Math.ceil(size * feeRate));
      const fee = calculateFee(txSize.txVBytes);

      // Calculate fees for new UTXOs selection with candidate
      const txSizeWithCandidate = txSizeEstimator.calcTxSize({
        input_count: selectedUtxos.length + 1, // +1 for candidate
        input_script: paymentType === "native-segwit" ? "p2wpkh" : "p2tr",
        input_m: 1,
        input_n: 1,
        ...outputParams,
      });

      const feeWithCandidate = calculateFee(txSizeWithCandidate.txVBytes);

      // Calculate candidate's fee contribution
      const candidateFeeContribution = feeWithCandidate.sub(fee);

      // Throw error if candidate's value is less than its fee contribution
      // as UTXOs are sorted by value in descending order, this should never happen
      if (!new Dec(candidate.value).gt(candidateFeeContribution))
        throw new Error("Candidate's value is less than its fee contribution");

      // Calculate new selected amount and target amount with fee
      const newSelectedAmount = selectedAmount.add(new Dec(candidate.value));
      const targetAmountWithFee = targetAmount.add(fee);

      // If new selected amount exceeds target amount with fee, handle excess amount
      if (newSelectedAmount.gte(targetAmountWithFee)) {
        const remainderValue = newSelectedAmount.sub(targetAmountWithFee);
        // Handle change address case
        if (changeAddress) {
          // If remainder value is less than dust threshold,
          // additional fee is required for dust output
          if (remainderValue.lte(new Dec(DUST_THRESHOLD))) {
            const changeAddressInfo = getAddressInfo(changeAddress, {
              castTestnetTo: network === "signet" ? Network.signet : undefined,
            });

            const outputSizeMap = {
              p2wpkh: txSizeEstimator.P2WPKH_OUT_SIZE,
              p2tr: txSizeEstimator.P2TR_OUT_SIZE,
              p2pkh: txSizeEstimator.P2PKH_OUT_SIZE,
            };

            const outputSize =
              outputSizeMap[
                changeAddressInfo.type as keyof typeof outputSizeMap
              ];
            if (!outputSize) throw new Error("Invalid change address type");

            // output fee with change address is already included in the target amount with fee,
            // so just calculate additional fee for dust relay
            const additionalFee = new Dec(DUST_RELAY_FEE_RATE * outputSize);
            const targetAmountWithFeeAndAdditionalFee =
              targetAmountWithFee.add(additionalFee);

            // add candidate to selected utxos
            selectedUtxos.push(candidate);
            selectedAmount = newSelectedAmount;

            // If the additional fee affects the selected amount to be less than target amount,
            // do not return selected utxos and continue to next candidate
            if (selectedAmount.lt(targetAmountWithFeeAndAdditionalFee)) {
              continue;
            }
          }
        } else {
          // No change address case
          // remainder value is less than or equal to dust threshold,
          // discard remainder value and add candidate to selected utxos
          if (remainderValue.lte(new Dec(DUST_THRESHOLD))) {
            selectedUtxos.push(candidate);
            selectedAmount = newSelectedAmount;
          } else {
            // Try to find a smaller UTXO that would result in a dust output
            let foundBetterUtxo = false;

            // Look ahead for better UTXO combinations
            for (let i = currentIndex + 1; i < sortedUtxos.length; i++) {
              const nextUtxo = sortedUtxos[i];
              const nextUtxoValue = new Dec(nextUtxo.value);

              // Skip if next UTXO's value is too small to contribute meaningfully
              if (nextUtxoValue.lt(candidateFeeContribution)) {
                continue;
              }

              // Calculate new amount with next UTXO
              const nextAmount = selectedAmount.add(nextUtxoValue);
              const nextRemainder = nextAmount.sub(targetAmountWithFee);

              // If this UTXO would result in a dust output, it's a better choice
              if (nextRemainder.lte(new Dec(DUST_THRESHOLD))) {
                selectedUtxos.push(nextUtxo);
                selectedAmount = nextAmount;
                foundBetterUtxo = true;
                break;
              }

              // If we've gone too far and the amount is too small, stop searching
              if (nextAmount.lt(targetAmountWithFee)) {
                break;
              }
            }

            // If we didn't find a better UTXO, continue with current selection
            if (!foundBetterUtxo) {
              selectedUtxos.push(candidate);
              selectedAmount = newSelectedAmount;
            }
          }
        }

        // target amount is reached, return selected UTXOs
        // dust output is considered as selected amount should be greater than target amount with fee + dust relay fee
        return {
          selectedUtxos,
          recipients,
          estimatedFee: new CoinPretty(currency, fee),
          vsize: txSize.txVBytes,
          hasChange: selectedAmount.gt(targetAmountWithFee),
        };
      }

      selectedUtxos.push(candidate);
      selectedAmount = newSelectedAmount;
      currentIndex++;
    }

    // not reached target amount, return null
    return null;
  }

  /**
   * Build PSBT for transaction
   * @param utxos UTXOs to be used for the transaction
   * @param senderAddress Address of the sender
   * @param xonlyPubKey Internal public key of the sender for taproot (optional)
   * @param recipients Recipients of the transaction with amount and address
   * @param estimatedFee Estimated fee for the transaction
   */
  buildPsbt({
    utxos,
    senderAddress,
    xonlyPubKey,
    recipients,
    estimatedFee,
  }: BuildPsbtParams): string {
    // Consider utxos should be selected by selectUTXOs
    // and recipients should be filtered by valid addresses

    // 1. Validate chain id and payment type
    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (
      !network ||
      (paymentType !== "native-segwit" && paymentType !== "taproot")
    ) {
      throw new Error("Invalid chain id");
    }

    if (
      paymentType === "taproot" &&
      (!xonlyPubKey || xonlyPubKey.length !== 32)
    ) {
      throw new Error("taproot psbt requires internal pubkey");
    }

    // 2. Validate utxos (total value should be greater than amount to send + fee)
    const totalValue = utxos.reduce(
      (sum, utxo) => sum.add(new Dec(utxo.value)),
      new Dec(0)
    );

    const amountToSend = recipients.reduce(
      (sum, recipient) => sum.add(new Dec(recipient.amount)),
      new Dec(0)
    );

    const feeInSatoshi = estimatedFee
      .toDec()
      .mul(new Dec(10 ** estimatedFee.currency.coinDecimals));

    if (amountToSend.add(feeInSatoshi).gt(totalValue)) {
      throw new Error("Insufficient balance");
    }

    // 3. Get network params and output script of the sender
    const networkParams = (() => {
      switch (network) {
        case "mainnet":
          return networks.bitcoin;
        case "testnet":
          return networks.testnet;
        case "signet":
          return networks.testnet;
        default:
          throw new Error("Invalid network");
      }
    })();

    const senderOutputScript = address.toOutputScript(
      senderAddress,
      networkParams
    );
    const internalPubkey = xonlyPubKey ? Buffer.from(xonlyPubKey) : undefined;

    // 4. Build PSBT
    const psbt = new Psbt({ network: networkParams });

    // 4.1. Add sender utxos as input
    for (const utxo of utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: senderOutputScript,
          value: utxo.value,
        },
        // nonWitnessUtxo is not set for segwit utxos
        tapInternalKey: paymentType === "taproot" ? internalPubkey : undefined,
      });
    }

    // 4.2. Add recipients as outputs
    for (const recipient of recipients) {
      psbt.addOutput({
        address: recipient.address,
        value: recipient.amount,
      });
    }

    return psbt.toHex();
  }

  async signPsbt(psbt: Psbt): Promise<string> {
    const { getKeplr } = this;
    const keplr = await getKeplr();
    if (!keplr) {
      throw new Error("Keplr not found");
    }

    return keplr.signPsbt(this.chainId, psbt.toHex());
  }

  async pushTx(txHex: string) {
    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error(`${this.chainId} is not bitcoin chain`);
    }

    const indexerUrl = modularChainInfo.bitcoin.rest;
    const res = await simpleFetch<string>(`${indexerUrl}/tx`, {
      method: "POST",
      body: txHex,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    if (res.status !== 200) {
      throw new Error("Failed to push tx");
    }

    return res.data;
  }

  async signAndPushTx(psbt: Psbt) {
    const signedPsbt = await this.signPsbt(psbt);
    return this.pushTx(signedPsbt);
  }

  // TODO: track tx status (이거 좀 어려움)

  // static validate address
}
