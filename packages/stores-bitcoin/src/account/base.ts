import { ChainGetter } from "@keplr-wallet/stores";
import {
  GENESIS_HASH_TO_NETWORK,
  GenesisHash,
  Keplr,
} from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { action, makeObservable, observable } from "mobx";
import validate, {
  AddressInfo,
  AddressType,
  Network,
  getAddressInfo,
} from "bitcoin-address-validation";
import { Psbt, networks, address } from "bitcoinjs-lib";
import { BitcoinTxSizeEstimator } from "./tx-size-estimator";
import {
  SelectionParams,
  BuildPsbtParams,
  SelectUTXOsParams,
  SelectionResult,
  UTXOSelection,
} from "./types";
import { BRANCH_AND_BOUND_TIMEOUT_MS, DUST_THRESHOLD } from "./constant";

export class BitcoinAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  protected _txSizeEstimator: BitcoinTxSizeEstimator;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    makeObservable(this);

    this._txSizeEstimator = new BitcoinTxSizeEstimator();
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
   * @param isSendMax Whether to send max amount, do not calculate change output
   * @param discardDustChange Whether to discard dust outputs
   * @returns {selectedUtxos, txSize} Selected UTXOs and transaction size
   */
  selectUTXOs({
    senderAddress,
    utxos,
    recipients,
    feeRate,
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

    // 3. Sort UTXOs by descending order
    const sortedUtxos = utxos.sort((a, b) => b.value - a.value);

    // 4. Validate addresses
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

    // 7. Initialize constants and helpers
    const DUST = new Dec(DUST_THRESHOLD);

    // Helper functions
    const calculateTxSize = (
      inputCount: number,
      outputParams: Record<string, number>,
      includeChange: boolean
    ) => {
      return this.calculateTxSize(
        senderAddressInfo.type,
        inputCount,
        outputParams,
        includeChange
      );
    };

    const calculateFee = (size: number) => new Dec(Math.ceil(size * feeRate));

    const isDust = (amount: Dec) => amount.lt(DUST);

    // Helper to calculate tx configuration for a given set of UTXOs
    const calculateTxConfig = (
      selectedUtxoIds: Set<string>,
      withChange: boolean
    ) => {
      const selectedCount = selectedUtxoIds.size;
      const txSize = calculateTxSize(selectedCount, outputParams, withChange);
      const fee = calculateFee(txSize.txVBytes);

      const selectedAmount = utxos
        .filter((utxo) => selectedUtxoIds.has(`${utxo.txid}:${utxo.vout}`))
        .reduce((sum, utxo) => sum.add(new Dec(utxo.value)), new Dec(0));

      const remainder = selectedAmount.sub(targetAmount).sub(fee);

      return {
        selectedUtxoIds,
        selectedAmount,
        txSize,
        fee,
        remainder,
        hasChange: withChange && remainder.gte(DUST),
      };
    };

    // 8. If send max is true, return all UTXOs and estimated fee
    // This is for simulation of build psbt when amount fraction is 1
    if (isSendMax) {
      const txSize = calculateTxSize(utxos.length, outputParams, false);

      return {
        selectedUtxos: utxos,
        txSize,
        hasChange: false,
      };
    }

    let selectedUtxoIds: Set<string>;

    // 9. Select UTXOs using branch and bound algorithm
    const branchAndBoundResult = this.branchAndBoundSelection({
      utxos: sortedUtxos,
      targetAmount,
      calculateTxSize,
      calculateFee,
      isDust,
      outputParams,
      discardDustChange,
    });

    if (!branchAndBoundResult) {
      // If branch and bound algorithm fails, use greedy selection
      selectedUtxoIds = this.greedySelection({
        utxos: sortedUtxos,
        targetAmount,
        calculateTxSize,
        calculateFee,
        isDust,
        outputParams,
        discardDustChange,
      });
    } else {
      selectedUtxoIds = branchAndBoundResult;
    }

    // If no UTXOs are selected, return null
    if (selectedUtxoIds.size === 0) {
      return null;
    }

    // 10. Calculate final tx configuration
    const withChangeConfig = calculateTxConfig(selectedUtxoIds, true);
    const hasChange = withChangeConfig.remainder.gte(DUST);

    // Final calculations based on whether we have change
    const finalConfig = calculateTxConfig(selectedUtxoIds, hasChange);

    // 11. Return the selection
    return {
      selectedUtxos: utxos.filter((utxo) =>
        selectedUtxoIds.has(`${utxo.txid}:${utxo.vout}`)
      ),
      txSize: finalConfig.txSize,
      hasChange,
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
    feeRate,
    isSendMax = false,
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

    if (feeRate <= 0) {
      throw new Error("Invalid fee rate");
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

    const remainderValue = totalInputAmount.sub(totalOutputAmount);
    const zeroValue = new Dec(0);

    // If send max is true, it's allowed to simulate build psbt with negative remainder value
    if (!isSendMax && remainderValue.lt(zeroValue)) {
      throw new Error("Insufficient balance");
    }

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

    // Helper functions
    const calculateTxSize = (
      inputCount: number,
      outputParams: Record<string, number>,
      includeChange: boolean
    ) => {
      return this.calculateTxSize(
        senderAddressInfo.type,
        inputCount,
        outputParams,
        includeChange
      );
    };

    const calculateFee = (size: number) => new Dec(Math.ceil(size * feeRate));

    const DUST = new Dec(DUST_THRESHOLD);

    const allRecipients = [...recipients];

    // 4. Handle change output if needed
    if (hasChange) {
      const txSize = calculateTxSize(utxos.length, outputParams, true);
      const fee = calculateFee(txSize.txVBytes);

      const changeAmount = remainderValue.sub(fee);

      // if change amount is greater than or equal to dust threshold
      if (changeAmount.gte(DUST)) {
        // add change output address
        allRecipients.push({
          address: senderAddress,
          amount: changeAmount.truncate().toBigNumber().toJSNumber(),
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
   * @param psbt PSBT to be signed, all inputs must be finalized
   * @returns Signed PSBT in hex format
   */
  async signPsbt(psbtHex: string): Promise<string> {
    const { getKeplr } = this;
    const keplr = await getKeplr();
    if (!keplr) {
      throw new Error("Keplr not found");
    }

    return keplr.signPsbt(this.chainId, psbtHex);
  }

  private validateAndGetAddressInfo = (address: string, network?: Network) => {
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

  private calculateTxSize = (
    senderAddressType: AddressType,
    inputCount: number,
    outputParams: Record<string, number>,
    includeChange: boolean
  ) => {
    const outputParamsWithChange = { ...outputParams };

    if (includeChange) {
      const changeKey = `${senderAddressType}_output_count`;
      outputParamsWithChange[changeKey] =
        (outputParamsWithChange[changeKey] || 0) + 1;
    }

    return this._txSizeEstimator.calcTxSize({
      input_count: inputCount,
      input_script: senderAddressType,
      ...outputParamsWithChange,
    });
  };

  private branchAndBoundSelection({
    utxos,
    targetAmount,
    calculateTxSize,
    calculateFee,
    isDust,
    outputParams,
    discardDustChange,
    timeoutMs,
  }: SelectionParams): Set<string> | null {
    // Algorithm execution time limit (ms)
    const TIMEOUT = timeoutMs ?? BRANCH_AND_BOUND_TIMEOUT_MS;
    const startTime = Date.now();

    // Calculate total available amount of all UTXOs
    const totalAvailable = utxos.reduce(
      (sum, utxo) => sum.add(new Dec(utxo.value)),
      new Dec(0)
    );

    // If target amount is greater than total available amount, return null
    if (targetAmount.gt(totalAvailable)) {
      return null;
    }

    // Function to estimate fee
    const estimateFee = (selectedIds: Set<string>, withChange: boolean) => {
      const txSize = calculateTxSize(
        selectedIds.size,
        outputParams,
        withChange
      );
      return calculateFee(txSize.txVBytes);
    };

    // Recursive search function - return value
    const search = (
      index: number,
      currentSelection: Set<string>,
      currentValue: Dec,
      remainingValue: Dec,
      timeoutReached: boolean = false
    ): SelectionResult | null => {
      // Check if timeout is reached
      if (Date.now() - startTime > TIMEOUT) {
        return null;
      }

      // Calculate fee for current selected UTXOs with change
      const withChangeFee = estimateFee(currentSelection, true);
      const effectiveValueWithChange = currentValue.sub(withChangeFee);

      let currentBest: SelectionResult | null = null;

      // If target amount is satisfied, consider current selection as the best candidate
      if (effectiveValueWithChange.gte(targetAmount)) {
        const remainder = effectiveValueWithChange.sub(targetAmount);

        const isDustRemainder = isDust(remainder);

        // If remainder is greater than or equal to dust threshold, or remainder is less than dust threshold and discardDustChange is true
        if (isDustRemainder || (!isDustRemainder && discardDustChange)) {
          currentBest = {
            utxoIds: new Set(currentSelection),
            totalValue: currentValue,
            effectiveValue: effectiveValueWithChange,
            wastage: remainder,
          };
        }
      }

      // If all UTXOs are considered or timeout is reached, return current best
      if (index >= utxos.length || timeoutReached) {
        return currentBest;
      }

      const utxo = utxos[index];
      const utxoId = `${utxo.txid}:${utxo.vout}`;
      const utxoValue = new Dec(utxo.value);

      // Bounding: If adding all remaining UTXOs still cannot reach target amount, return current best
      if (effectiveValueWithChange.add(remainingValue).lt(targetAmount)) {
        return currentBest;
      }

      // If already exceeds target amount and current best is better, return current best
      if (
        currentBest &&
        effectiveValueWithChange.gte(targetAmount) &&
        effectiveValueWithChange.sub(targetAmount).lt(currentBest.wastage)
      ) {
        return currentBest;
      }

      // Include current UTXO (branch 1)
      currentSelection.add(utxoId);
      const newRemaining = remainingValue.sub(utxoValue);
      const withUtxo = search(
        index + 1,
        new Set(currentSelection), // Create new Set object and pass it
        currentValue.add(utxoValue),
        newRemaining
      );

      // Exclude current UTXO (branch 2)
      currentSelection.delete(utxoId);
      const withoutUtxo = search(
        index + 1,
        new Set(currentSelection), // Create new Set object and pass it
        currentValue,
        newRemaining
      );

      // Select the better result between the two paths
      if (!withUtxo) return withoutUtxo;
      if (!withoutUtxo) return withUtxo;

      // Select the path with less remainder
      return withUtxo.wastage.lt(withoutUtxo.wastage) ? withUtxo : withoutUtxo;
    };

    // Start search
    const result = search(0, new Set<string>(), new Dec(0), totalAvailable);

    if (!result) {
      return null;
    }

    return result.utxoIds;
  }

  private greedySelection({
    utxos,
    targetAmount,
    calculateTxSize,
    calculateFee,
    isDust,
    outputParams,
    discardDustChange,
  }: SelectionParams): Set<string> {
    const selectedUtxoIds = new Set<string>();
    let selectedAmount = new Dec(0);

    // 1. Select UTXOs to satisfy target amount
    for (const utxo of utxos) {
      const utxoId = `${utxo.txid}:${utxo.vout}`;
      selectedUtxoIds.add(utxoId);
      selectedAmount = selectedAmount.add(new Dec(utxo.value));

      // Calculate fee
      const txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
      const fee = calculateFee(txSize.txVBytes);

      // Calculate remainder
      const remainder = selectedAmount.sub(targetAmount).sub(fee);
      const isDustRemainder = isDust(remainder);

      // If target amount is satisfied and remainder is appropriate, stop
      if (
        selectedAmount.gte(targetAmount) &&
        (isDustRemainder || (!isDustRemainder && discardDustChange))
      ) {
        break;
      }
    }

    // 2. Select additional UTXOs to cover fee
    let txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
    let fee = calculateFee(txSize.txVBytes);
    let remainder = selectedAmount.sub(targetAmount).sub(fee);

    if (remainder.lt(new Dec(0))) {
      for (const utxo of utxos) {
        const utxoId = `${utxo.txid}:${utxo.vout}`;
        if (selectedUtxoIds.has(utxoId)) continue;

        selectedUtxoIds.add(utxoId);
        selectedAmount = selectedAmount.add(new Dec(utxo.value));

        txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
        fee = calculateFee(txSize.txVBytes);
        remainder = selectedAmount.sub(targetAmount).sub(fee);

        if (remainder.gte(new Dec(0))) {
          break;
        }
      }
    }

    return selectedUtxoIds;
  }
}
