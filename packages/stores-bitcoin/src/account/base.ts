import { ChainGetter } from "@keplr-wallet/stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  Keplr,
} from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
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
   * @param senderAddress Address of the sender
   * @param utxos UTXOs associated with the sender's address (must be of the same payment type - p2wpkh, p2tr)
   * @param recipients Recipients of the transaction with amount and address
   * @param feeRate Transaction fee rate in sat/vB
   * @param inscriptionUtxos UTXOs containing inscriptions (for Ordinals)
   * @param runesUtxos UTXOs containing Runes protocol data
   * @param dustRelayFeeRate Fee rate for dust outputs
   * @param discardDust Whether to discard dust outputs
   * @returns {selectedUtxos, recipients, estimatedFee, txSize} Selected UTXOs, recipients, transaction fee, and transaction size
   */
  selectUTXOs({
    senderAddress,
    utxos,
    recipients,
    feeRate,
    inscriptionUtxos = [],
    runesUtxos = [],
    discardDust = false,
    dustRelayFeeRate = DUST_RELAY_FEE_RATE,
  }: SelectUTXOsParams): UTXOSelection | null {
    // 1. Basic validation
    if (
      !utxos.length ||
      !recipients.length ||
      feeRate <= 0 ||
      dustRelayFeeRate <= 0
    ) {
      throw new Error("Invalid parameters");
    }

    // 2. Get network config
    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (
      !network ||
      (paymentType !== "native-segwit" && paymentType !== "taproot")
    ) {
      throw new Error("Invalid chain id");
    }

    const currency = this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .getCurrencies("bitcoin")[0];
    if (!currency) {
      throw new Error("Invalid currency");
    }

    // 3. Filter and sort UTXOs
    const utxosToExclude = new Set<string>();
    [...inscriptionUtxos, ...runesUtxos].forEach((utxo) => {
      utxosToExclude.add(`${utxo.txid}:${utxo.vout}`);
    });

    const sortedUtxos = utxos
      .filter((utxo) => !utxosToExclude.has(`${utxo.txid}:${utxo.vout}`))
      .sort((a, b) => b.value - a.value);

    if (sortedUtxos.length === 0) {
      throw new Error("No UTXOs found");
    }

    // 4. Validate addresses
    const validateAndGetAddressInfo = (address: string) => {
      try {
        return validate(address, network as unknown as Network, {
          castTestnetTo: network === "signet" ? Network.signet : undefined,
        })
          ? getAddressInfo(address, {
              castTestnetTo: network === "signet" ? Network.signet : undefined,
            })
          : null;
      } catch (e) {
        return null;
      }
    };

    const senderAddressInfo = validateAndGetAddressInfo(senderAddress);
    if (!senderAddressInfo) {
      throw new Error("Invalid sender address");
    }

    const recipientAddressInfos = recipients
      .map(({ address }) => validateAndGetAddressInfo(address))
      .filter(Boolean) as AddressInfo[];

    if (!recipientAddressInfos.length) {
      throw new Error("Invalid recipient address");
    }

    // 5. Calculate output parameters
    const outputParams: Record<string, number> = {};
    recipientAddressInfos.forEach((info) => {
      const key = `${info.type}_output_count`;
      outputParams[key] = (outputParams[key] || 0) + 1;
    });

    // 6. Calculate target amount
    const targetAmount = recipients.reduce(
      (sum, recipient) => sum.add(new Dec(recipient.amount)),
      new Dec(0)
    );

    // 7. Initialize tx size estimator
    const txSizeEstimator = new BitcoinTxSizeEstimator();

    // Helper function for calculating tx size
    const calculateTxSize = (
      inputCount: number,
      outputParams: Record<string, number>,
      includeChange: boolean
    ) => {
      const outputParamsWithChange = { ...outputParams };

      if (includeChange) {
        const changeKey = `${senderAddressInfo.type}_output_count`;
        outputParamsWithChange[changeKey] =
          (outputParamsWithChange[changeKey] || 0) + 1;
      }

      return txSizeEstimator.calcTxSize({
        input_count: inputCount,
        input_script: senderAddressInfo.type,
        ...outputParamsWithChange,
      });
    };

    // Helper function for calculating fee
    const calculateFee = (size: number) => new Dec(Math.ceil(size * feeRate));

    // 8. Select UTXOs
    const selectedUtxos: UTXO[] = [];
    let selectedAmount = new Dec(0);
    const DUST = new Dec(DUST_THRESHOLD);

    for (const candidate of sortedUtxos) {
      // Calculate tx size and fee before adding this candidate
      const currentTxSize = calculateTxSize(
        selectedUtxos.length,
        outputParams,
        false
      );
      const currentFee = calculateFee(currentTxSize.txVBytes);

      // Calculate tx size and fee after adding this candidate
      const txSizeWithCandidate = calculateTxSize(
        selectedUtxos.length + 1,
        outputParams,
        false
      );
      const feeWithoutChange = calculateFee(txSizeWithCandidate.txVBytes);

      // Calculate the fee contribution of this candidate
      const candidateFeeContribution = feeWithoutChange.sub(currentFee);
      const candidateValue = new Dec(candidate.value);

      // Skip if candidate doesn't contribute positively
      if (candidateValue.lte(candidateFeeContribution)) {
        throw new Error(
          `Skipping UTXO: value doesn't exceed fee contribution, ${candidate.txid}:${candidate.vout}`
        );
      }

      // Add this candidate to our selection
      selectedUtxos.push(candidate);
      selectedAmount = selectedAmount.add(candidateValue);

      // Calculate the amount we need (target + fee without change)
      const requiredAmount = targetAmount.add(feeWithoutChange);

      // Check if we have enough without a change output
      if (selectedAmount.gte(requiredAmount)) {
        const remainderValue = selectedAmount.sub(requiredAmount);

        // If remainder is dust and we can discard it
        if (remainderValue.lt(DUST) && discardDust) {
          return {
            selectedUtxos,
            recipients,
            estimatedFee: new CoinPretty(currency, feeWithoutChange),
            txSize: txSizeWithCandidate,
            hasChange: false,
          };
        }

        // Calculate tx size and fee with change output
        const txSizeWithChange = calculateTxSize(
          selectedUtxos.length,
          outputParams,
          true
        );
        const feeWithChange = calculateFee(txSizeWithChange.txVBytes);

        // Calculate the amount we need with change
        const requiredAmountWithChange = targetAmount.add(feeWithChange);
        const changeAmount = selectedAmount.sub(requiredAmountWithChange);

        // Check if we have enough with a change output
        if (selectedAmount.gte(requiredAmountWithChange)) {
          // If change amount is too small (dust)
          if (changeAmount.lt(DUST)) {
            // If we can discard dust, use fee without change
            if (discardDust) {
              return {
                selectedUtxos,
                recipients,
                estimatedFee: new CoinPretty(currency, feeWithoutChange),
                txSize: txSizeWithCandidate,
                hasChange: false,
              };
            }

            // Calculate dust relay fee
            const dustVBytes =
              senderAddressInfo.type === "p2tr"
                ? txSizeEstimator.P2TR_OUT_SIZE
                : txSizeEstimator.P2WPKH_OUT_SIZE;
            const dustRelayFee = new Dec(DUST_RELAY_FEE_RATE).mul(
              new Dec(dustVBytes)
            );

            const requiredAmountWithChangeAndDust =
              requiredAmountWithChange.add(dustRelayFee);

            // If we have enough with a change output (output is dust)
            if (selectedAmount.gte(requiredAmountWithChangeAndDust)) {
              const dustVBytesInTxVBytes = dustRelayFee
                .quo(new Dec(feeRate))
                .roundUp()
                .toBigNumber()
                .toJSNumber();

              return {
                selectedUtxos,
                recipients,
                estimatedFee: new CoinPretty(currency, feeWithChange),
                txSize: {
                  ...txSizeWithChange,
                  dustVBytes: dustVBytesInTxVBytes,
                },
                hasChange: true,
              };
            }

            // We need to continue and add more UTXOs to cover the required amount
            continue;
          }

          // We have a valid change amount
          return {
            selectedUtxos,
            recipients,
            estimatedFee: new CoinPretty(currency, feeWithChange),
            txSize: txSizeWithChange,
            hasChange: true,
          };
        }
      }
      // If we haven't returned, we need more UTXOs
    }

    // We've used all available UTXOs but still don't have enough
    return null;
  }

  /**
   * Build PSBT for transaction
   * @param utxos UTXOs to be used for the transaction
   * @param senderAddress Address of the sender
   * @param xonlyPubKey Internal public key of the sender for taproot (optional)
   * @param recipients Recipients of the transaction with amount and address
   * @param estimatedFee Estimated fee for the transaction
   * @param hasChange Whether to include a change output
   */
  buildPsbt({
    utxos,
    senderAddress,
    xonlyPubKey,
    recipients,
    estimatedFee,
    hasChange = false,
  }: BuildPsbtParams): string {
    // 1. Basic validation
    if (!utxos.length) {
      throw new Error("No UTXOs provided for transaction");
    }

    if (!recipients.length) {
      throw new Error("No recipients specified for transaction");
    }

    if (!senderAddress) {
      throw new Error("Sender address is required");
    }

    // 2. Parse and validate chain configuration
    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (!network) {
      throw new Error(`Unsupported network: ${genesisHash}`);
    }

    if (paymentType !== "native-segwit" && paymentType !== "taproot") {
      throw new Error(`Unsupported payment type: ${paymentType}`);
    }

    if (
      paymentType === "taproot" &&
      (!xonlyPubKey || xonlyPubKey.length !== 32)
    ) {
      throw new Error("Taproot PSBT requires internal pubkey of 32 bytes");
    }

    // 3. Validate transaction economics
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
      .mul(DecUtils.getTenExponentN(estimatedFee.currency.coinDecimals));

    const remainderValue = totalValue.sub(amountToSend).sub(feeInSatoshi);
    const zeroValue = new Dec(0);

    if (remainderValue.lt(zeroValue)) {
      throw new Error("Insufficient balance");
    }

    const allRecipients = [...recipients];

    // 4. Handle change output if needed
    if (hasChange && remainderValue.gt(zeroValue)) {
      allRecipients.push({
        address: senderAddress,
        amount: remainderValue.truncate().toBigNumber().toJSNumber(),
      });
    }

    // 5. Get network params
    const networkParams = (() => {
      switch (network) {
        case "mainnet":
          return networks.bitcoin;
        case "testnet":
        case "signet":
          return networks.testnet;
        default:
          throw new Error(`Invalid network: ${network}`);
      }
    })();

    // 6. Build PSBT
    try {
      const psbt = new Psbt({ network: networkParams });

      // 6.1. Process sender address and script
      const senderOutputScript = address.toOutputScript(
        senderAddress,
        networkParams
      );
      const internalPubkey = xonlyPubKey ? Buffer.from(xonlyPubKey) : undefined;

      // 6.2. Add sender UTXOs as inputs
      for (const utxo of utxos) {
        if (paymentType === "taproot") {
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: senderOutputScript,
              value: utxo.value,
            },
            tapInternalKey: internalPubkey,
          });
        }

        if (paymentType === "native-segwit") {
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { script: senderOutputScript, value: utxo.value },
          });
        }
      }

      // 6.3. Add all outputs (recipients + change if applicable)
      for (const recipient of allRecipients) {
        psbt.addOutput({
          address: recipient.address,
          value: recipient.amount,
        });
      }

      return psbt.toHex();
    } catch (error) {
      console.error("Error creating PSBT:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to build PSBT: ${error.message}`);
      }
      throw new Error("Failed to build PSBT: Unknown error");
    }
  }

  /**
   * Sign PSBT
   * @param psbt PSBT to be signed
   * @returns Signed PSBT in hex format
   */
  async signPsbt(psbt: Psbt): Promise<string> {
    const { getKeplr } = this;
    const keplr = await getKeplr();
    if (!keplr) {
      throw new Error("Keplr not found");
    }

    return keplr.signPsbt(this.chainId, psbt.toHex());
  }

  /**
   * Push transaction to network through indexer
   * @param txHex Transaction in hex format
   * @returns Transaction hash
   */
  async pushTx(txHex: string): Promise<string> {
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

  async signAndPushTx(psbt: Psbt): Promise<string> {
    const signedPsbt = await this.signPsbt(psbt);
    return await this.pushTx(signedPsbt);
  }
}
