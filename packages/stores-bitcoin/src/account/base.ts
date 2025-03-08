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
import { NATIVE_SEGWIT_DUST_THRESHOLD } from "./constant";

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
   * @param feeCurrency Fee currency optional, default is the main currency of the chain
   * @param isSendMax Whether to send max amount, do not calculate change output
   * @param discardDustChange Whether to discard dust outputs
   * @returns {selectedUtxos, recipients, estimatedFee, txSize} Selected UTXOs, recipients, transaction fee, and transaction size
   */
  selectUTXOs({
    senderAddress,
    utxos,
    recipients,
    feeRate,
    feeCurrency,
    isSendMax = false,
    discardDustChange = true,
  }: SelectUTXOsParams): UTXOSelection | null {
    // 1. Basic validation
    if (!utxos.length || !recipients.length || feeRate <= 0) {
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

    const currency =
      feeCurrency ??
      this.chainGetter
        .getModularChainInfoImpl(this.chainId)
        .getCurrencies("bitcoin")[0];
    if (!currency) {
      throw new Error("Invalid currency");
    }

    // 3. Consider utxos is filtered (unconfirmed, outbound, protected, dust), just sort by descending order
    const sortedUtxos = utxos.sort((a, b) => b.value - a.value);

    const senderAddressInfo = this.validateAndGetAddressInfo(
      senderAddress,
      network as unknown as Network
    );
    if (!senderAddressInfo) {
      throw new Error("Invalid sender address");
    }

    const recipientAddressInfos = recipients
      .map(({ address }) =>
        this.validateAndGetAddressInfo(address, network as unknown as Network)
      )
      .filter(Boolean) as AddressInfo[];
    if (!recipientAddressInfos.length) {
      throw new Error("Invalid recipients");
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

    const DUST = new Dec(NATIVE_SEGWIT_DUST_THRESHOLD);

    // 8. Send max case (use all UTXOs)
    if (isSendMax) {
      const totalValue = sortedUtxos.reduce(
        (sum, utxo) => sum.add(new Dec(utxo.value)),
        new Dec(0)
      );

      // No change output in send max case
      const txSize = calculateTxSize(sortedUtxos.length, outputParams, false);
      const totalFee = calculateFee(txSize.txVBytes);

      // just return all utxos, even though fee + target amount is greater than total value
      // recalculation request will be done in the send config
      return {
        selectedUtxos: sortedUtxos,
        spendableAmount: totalValue.sub(totalFee),
        estimatedFee: new CoinPretty(currency, totalFee),
        txSize: txSize,
        hasChange: false,
      };
    }

    // 9. General UTXO selection algorithm
    const selectedUtxos: UTXO[] = [];
    let selectedAmount = new Dec(0);

    for (const utxo of sortedUtxos) {
      selectedUtxos.push(utxo);
      selectedAmount = selectedAmount.add(new Dec(utxo.value));

      if (selectedAmount.gte(targetAmount)) {
        // first assume change output is included
        const txSizeWithChange = calculateTxSize(
          selectedUtxos.length,
          outputParams,
          true
        );
        const feeWithChange = calculateFee(txSizeWithChange.txVBytes);

        // calculate the value of change output
        const remainderValue = selectedAmount
          .sub(targetAmount)
          .sub(feeWithChange);

        // if remainderValue is greater than or equal to dust, or
        // if remainderValue is less than dust and discardDustChange is true
        // then break
        if (
          remainderValue.gte(DUST) ||
          (remainderValue.lt(DUST) && discardDustChange)
        ) {
          break;
        }
      }
    }

    // 10. If selectedAmount is less than targetAmount, return null
    if (selectedAmount.lt(targetAmount)) {
      return null;
    }

    // 11. Final calculation
    // first assume change output is included
    const txSizeWithChange = calculateTxSize(
      selectedUtxos.length,
      outputParams,
      true
    );
    const feeWithChange = calculateFee(txSizeWithChange.txVBytes);
    const remainderValue = selectedAmount.sub(targetAmount).sub(feeWithChange);

    // if remainderValue is less than dust, then calculate without change output
    const hasChange = remainderValue.gte(DUST);

    let finalTxSize, finalFee, spendableAmount;

    if (hasChange) {
      // change output is included
      finalTxSize = txSizeWithChange;
      finalFee = feeWithChange;
      spendableAmount = targetAmount;
    } else {
      // change output is not included
      finalTxSize = calculateTxSize(selectedUtxos.length, outputParams, false);
      finalFee = calculateFee(finalTxSize.txVBytes);

      // if discardDustChange is true, discard dust and use target amount
      // otherwise, use selected amount minus fee
      if (discardDustChange) {
        spendableAmount = targetAmount;
      } else {
        spendableAmount = selectedAmount.sub(finalFee);
      }
    }

    return {
      selectedUtxos,
      spendableAmount: spendableAmount,
      estimatedFee: new CoinPretty(currency, finalFee),
      txSize: finalTxSize,
      hasChange: hasChange,
    };
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

    if (!senderAddress) {
      throw new Error("Sender address is required");
    }

    if (!recipients.length) {
      throw new Error("Recipients are required");
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
    const totalInputAmount = utxos.reduce(
      (sum, utxo) => sum.add(new Dec(utxo.value)),
      new Dec(0)
    );

    const totalOutputAmount = recipients.reduce(
      (sum, recipient) => sum.add(new Dec(recipient.amount)),
      new Dec(0)
    );

    const feeInSatoshi = estimatedFee
      .toDec()
      .mul(DecUtils.getTenExponentN(estimatedFee.currency.coinDecimals));

    const remainderValue = totalInputAmount
      .sub(totalOutputAmount)
      .sub(feeInSatoshi);
    const zeroValue = new Dec(0);

    if (remainderValue.lt(zeroValue)) {
      throw new Error("Insufficient balance");
    }

    const allRecipients = [...recipients];

    // 4. Handle change output if needed
    if (hasChange) {
      // if change amount is greater than or equal to dust threshold
      if (remainderValue.gte(new Dec(NATIVE_SEGWIT_DUST_THRESHOLD))) {
        // add change output address
        allRecipients.push({
          address: senderAddress,
          amount: remainderValue.truncate().toBigNumber().toJSNumber(),
        });
      } else {
        // hasChange is true but change amount is less than dust threshold, log warning
        console.warn("Change amount is less than dust threshold");
      }
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

    // 6. Validate recipients
    allRecipients.forEach((recipient) =>
      validate(recipient.address, network as unknown as Network)
    );

    // 7. Build PSBT
    try {
      const psbt = new Psbt({ network: networkParams });

      // 7.1. Process sender address and script
      const senderOutputScript = address.toOutputScript(
        senderAddress,
        networkParams
      );
      const internalPubkey = xonlyPubKey ? Buffer.from(xonlyPubKey) : undefined;

      // 7.2. Add sender UTXOs as inputs (RBF enabled)
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
            sequence: 0xfffffffd,
          });
        }

        if (paymentType === "native-segwit") {
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: { script: senderOutputScript, value: utxo.value },
            sequence: 0xfffffffd,
          });
        }
      }

      // 7.3. Add all outputs (recipients + change if applicable)
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

  private validateAndGetAddressInfo = (address: string, network: Network) => {
    try {
      return validate(address, network, {
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
}
