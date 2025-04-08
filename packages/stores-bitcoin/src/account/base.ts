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
import {
  SelectionParams,
  BuildPsbtParams,
  SelectUTXOsParams,
  SelectionResult,
  UTXOSelection,
  IPsbtInput,
  IPsbtOutput,
  RemainderStatus,
} from "./types";
import {
  BRANCH_AND_BOUND_TIMEOUT_MS,
  DUST_THRESHOLD,
  MAX_BITCOIN_SUPPLY,
  MAX_SAFE_OUTPUT,
  MIN_RELAY_FEE,
} from "./constant";
import { BitcoinTxSizeEstimator, InputScriptType } from "./tx-size-estimator";

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
   * @param recipients Recipients of the transaction with value and address
   * @param feeRate Transaction fee rate in sat/vB
   * @param isSendMax Whether to send max value, do not calculate change output
   * @param prevalidatedAddressInfos Prevalidated address infos, removed duplicates, can be used for both inputs and outputs
   * @returns {selectedUtxos, txSize, hasChange} Selected UTXOs and transaction size, whether there is change output
   */
  selectUTXOs({
    senderAddress,
    utxos,
    outputs,
    feeRate,
    isSendMax = false,
    prevalidatedAddressInfos,
  }: SelectUTXOsParams): UTXOSelection | null {
    // 1. Basic validation
    if (!utxos.length || !outputs.length || feeRate <= 0) {
      throw new Error("Invalid parameters");
    }

    // 2. Get network config and validate utxos and addresses
    const [, genesisHash, paymentType] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (
      !network ||
      (paymentType !== "native-segwit" && paymentType !== "taproot")
    ) {
      throw new Error("Invalid chain id");
    }

    // 2-1. Calculate target value and validate
    const targetValue = outputs.reduce(
      (sum, recipient) => sum.add(new Dec(recipient.value)),
      new Dec(0)
    );
    const DUST = new Dec(DUST_THRESHOLD);

    // send max 더라도 dust와 max supply를 초과하는 경우 예외 처리가 필요하다.
    if (targetValue.lt(DUST)) {
      throw new Error("Target value is less than dust threshold");
    }

    if (targetValue.gt(new Dec(MAX_BITCOIN_SUPPLY))) {
      throw new Error(
        `Amount exceeds maximum Bitcoin supply (${MAX_BITCOIN_SUPPLY} BTC)`
      );
    }

    // 2-2. Get prevalidated or validate address info
    const addressInfoMap = new Map<string, AddressInfo>();

    const getAddressInfo = (address: string): AddressInfo => {
      if (addressInfoMap.has(address)) {
        return addressInfoMap.get(address)!;
      }

      if (prevalidatedAddressInfos) {
        const prevalidatedInfo = prevalidatedAddressInfos.find(
          (info) => info.address === address
        );
        if (prevalidatedInfo) {
          addressInfoMap.set(address, prevalidatedInfo);
          return prevalidatedInfo;
        }
      }

      const validatedInfo = this.validateAndGetAddressInfo(
        address,
        network as unknown as Network
      );

      if (!validatedInfo) {
        throw new Error(`Invalid address: ${address}`);
      }

      addressInfoMap.set(address, validatedInfo);
      return validatedInfo;
    };

    const senderAddressInfo = getAddressInfo(senderAddress);
    if (!senderAddressInfo) {
      throw new Error("Invalid sender address");
    }

    const recipientAddressInfos = outputs
      .map(({ address }) => {
        try {
          return getAddressInfo(address);
        } catch (error) {
          throw new Error(`Invalid recipient address: ${address}`);
        }
      })
      .filter(Boolean) as AddressInfo[];
    if (recipientAddressInfos.length !== outputs.length) {
      throw new Error("Outputs include invalid addresses");
    }

    // 3. Calculate output parameters
    const outputParams = this.calculateOutputParams(recipientAddressInfos);

    // 4. Setup helper functions
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

    const calculateFee = (size: number) => {
      const calculatedFee = new Dec(Math.ceil(size * feeRate));
      // Ensure fee meets minimum relay fee requirement
      if (calculatedFee.lt(new Dec(MIN_RELAY_FEE))) {
        return new Dec(MIN_RELAY_FEE);
      }
      return calculatedFee;
    };
    const isDust = (value: Dec) => value.lt(DUST);

    // 5. Handle send max case
    if (isSendMax) {
      const txSize = calculateTxSize(utxos.length, outputParams, false);
      return {
        selectedUtxos: utxos,
        txSize,
        remainderStatus: RemainderStatus.None,
        remainderValue: "0",
      };
    }

    // 6. Try single UTXO selection first
    const sortedUtxos = utxos.sort((a, b) => b.value - a.value);
    const singleUtxoResult = this.trySingleUtxoSelection({
      utxos: sortedUtxos,
      targetValue,
      calculateTxSize,
      calculateFee,
      isDust,
      outputParams,
    });
    if (singleUtxoResult) {
      return singleUtxoResult;
    }

    // 7. Use branch and bound or greedy selection for multiple UTXOs
    const selectedUtxoIds = this.selectMultipleUtxos({
      utxos: sortedUtxos,
      targetValue,
      calculateTxSize,
      calculateFee,
      isDust,
      outputParams,
      timeoutMs: BRANCH_AND_BOUND_TIMEOUT_MS,
    });

    if (!selectedUtxoIds || selectedUtxoIds.size === 0) {
      return null;
    }

    // 8. Calculate final configuration
    const selectedUtxos = utxos.filter((utxo) =>
      selectedUtxoIds.has(`${utxo.txid}:${utxo.vout}`)
    );
    const totalValue = selectedUtxos.reduce(
      (sum, utxo) => sum.add(new Dec(utxo.value)),
      new Dec(0)
    );

    const withChangeTxSize = calculateTxSize(
      selectedUtxos.length,
      outputParams,
      true
    );
    const withChangeFee = calculateFee(withChangeTxSize.txVBytes);
    const withChangeRemainder = totalValue.sub(targetValue).sub(withChangeFee);

    if (withChangeRemainder.gte(DUST)) {
      return {
        selectedUtxos,
        txSize: withChangeTxSize,
        remainderStatus: RemainderStatus.UsedAsChange,
        remainderValue: withChangeRemainder.truncate().toString(),
      };
    }

    const withoutChangeTxSize = calculateTxSize(
      selectedUtxos.length,
      outputParams,
      false
    );
    const withoutChangeFee = calculateFee(withoutChangeTxSize.txVBytes);
    const withoutChangeRemainder = totalValue
      .sub(targetValue)
      .sub(withoutChangeFee);

    if (withoutChangeRemainder.gte(new Dec(0))) {
      return {
        selectedUtxos,
        txSize: withoutChangeTxSize,
        remainderStatus: RemainderStatus.AddedToFee,
        remainderValue: withoutChangeRemainder.truncate().toString(),
      };
    }

    // isSendMax는 아니지만 수량이 max 근처(?)인 경우
    return {
      selectedUtxos,
      txSize: withoutChangeTxSize,
      remainderStatus: RemainderStatus.None,
      remainderValue: "0",
    };
  }

  /**
   * Prepares and validates transaction outputs for single recipient
   * @param amount Amount in satoshis
   * @param recipientAddress Recipient address
   * @param chainId Chain ID
   * @param maxOutputCount Optional maximum number of outputs to create for large amounts
   * @returns Validated recipient address info and outputs ready for transaction
   */
  prepareOutputsForSingleRecipient(
    amount: Dec,
    recipientAddress: string,
    chainId: string
  ): {
    recipientAddressInfo: AddressInfo;
    outputs: IPsbtOutput[];
  } {
    const [, genesisHash] = chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (!network) {
      throw new Error(`Unsupported network: ${genesisHash}`);
    }

    const recipientAddressInfo = this.validateAndGetAddressInfo(
      recipientAddress,
      network as unknown as Network
    );

    if (!recipientAddressInfo) {
      throw new Error("Invalid recipient address");
    }

    if (amount.gt(new Dec(MAX_BITCOIN_SUPPLY))) {
      throw new Error(
        `Amount exceeds maximum Bitcoin supply (${MAX_BITCOIN_SUPPLY} BTC)`
      );
    }

    const maxSafeOutput = new Dec(MAX_SAFE_OUTPUT);
    const outputs: IPsbtOutput[] = [];

    const ZERO = new Dec(0);

    if (amount.gt(maxSafeOutput)) {
      let remainingValue = amount;

      while (remainingValue.gt(ZERO)) {
        const chunkValue = remainingValue.gt(maxSafeOutput)
          ? maxSafeOutput
          : remainingValue;

        outputs.push({
          address: recipientAddress,
          value: chunkValue.truncate().toBigNumber().toJSNumber(),
        });
        remainingValue = remainingValue.sub(chunkValue);
      }
    } else {
      outputs.push({
        address: recipientAddress,
        value: amount.truncate().toBigNumber().toJSNumber(),
      });
    }

    return {
      recipientAddressInfo,
      outputs,
    };
  }

  private calculateOutputParams(
    addressInfos: AddressInfo[]
  ): Record<string, number> {
    const outputParams: Record<string, number> = {};
    addressInfos.forEach((info) => {
      const key = `${info.type}_output_count`;
      outputParams[key] = (outputParams[key] || 0) + 1;
    });
    return outputParams;
  }

  private trySingleUtxoSelection({
    utxos,
    targetValue,
    calculateTxSize,
    calculateFee,
    outputParams,
  }: SelectionParams): UTXOSelection | null {
    for (const utxo of utxos) {
      const utxoValue = new Dec(utxo.value);

      // Try with change first
      const withChangeTxSize = calculateTxSize(1, outputParams, true);
      const withChangeFee = calculateFee(withChangeTxSize.txVBytes);
      const withChangeRemainder = utxoValue.sub(targetValue).sub(withChangeFee);

      // remainder를 change로 고려한 경우, dust보다 큰 경우에만 change로 고려
      if (withChangeRemainder.gte(new Dec(DUST_THRESHOLD))) {
        return {
          selectedUtxos: [utxo],
          txSize: withChangeTxSize,
          remainderStatus: RemainderStatus.UsedAsChange,
          remainderValue: withChangeRemainder.truncate().toString(),
        };
      }

      // remainder를 change로 고려했을 때 dust보다 작아서 수수료로 추가하는 경우
      const withoutChangeTxSize = calculateTxSize(1, outputParams, false);
      const withoutChangeFee = calculateFee(withoutChangeTxSize.txVBytes);
      const withoutChangeRemainder = utxoValue
        .sub(targetValue)
        .sub(withoutChangeFee);

      if (withoutChangeRemainder.gte(new Dec(0))) {
        return {
          selectedUtxos: [utxo],
          txSize: withoutChangeTxSize,
          remainderStatus: RemainderStatus.AddedToFee,
          remainderValue: withoutChangeRemainder.truncate().toString(),
        };
      }
    }
    return null;
  }

  private selectMultipleUtxos(params: SelectionParams): Set<string> | null {
    const branchAndBoundResult = this.branchAndBoundSelection(params);
    if (branchAndBoundResult) {
      return branchAndBoundResult;
    }
    return this.greedySelection(params);
  }

  /**
   * Build PSBT for transaction
   * @param inputs UTXOs to be used for the transaction
   * @param outputs Recipients of the transaction with value and address
   * @param changeAddress Address of the sender to receive change
   * @param feeRate Transaction fee rate in sat/vB
   * @param maximumFeeRate Maximum fee rate in sat/vB
   * @param isSendMax Whether to send max value, do not calculate change output
   * @param hasChange Whether to include a change output
   */
  buildPsbt({
    inputs,
    outputs,
    changeAddress,
    feeRate,
    maximumFeeRate = 1000,
    isSendMax = false,
    hasChange = false,
    prevalidatedAddressInfos,
  }: BuildPsbtParams): string {
    // 1. Basic validation
    if (!inputs.length) {
      throw new Error(
        "No inputs provided for transaction, at least one input is required"
      );
    }

    if (hasChange && !changeAddress) {
      throw new Error("Change address is required when change is enabled");
    }

    if (feeRate <= 0 || feeRate > maximumFeeRate) {
      throw new Error(
        `Invalid fee rate: ${feeRate}, must be between 0 and ${maximumFeeRate}`
      );
    }

    // 2. Get network config and validate addresses
    const [, genesisHash] = this.chainId.split(":");
    const network = GENESIS_HASH_TO_NETWORK[genesisHash as GenesisHash];
    if (!network) {
      throw new Error(`Unsupported network: ${genesisHash}`);
    }

    // 3. Validate transaction economics
    this.validateTransactionEconomics(inputs, outputs, isSendMax);

    // 4. Process addresses and get network config
    const { inputsWithAddressInfo, outputsWithAddressInfo } =
      this.processAddresses(
        inputs,
        outputs,
        changeAddress,
        hasChange,
        network,
        feeRate,
        prevalidatedAddressInfos
      );

    // 5. Build PSBT
    return this.createPsbt(
      inputsWithAddressInfo,
      outputsWithAddressInfo,
      network,
      maximumFeeRate
    );
  }

  private validateTransactionEconomics(
    inputs: IPsbtInput[],
    outputs: IPsbtOutput[],
    isSendMax: boolean
  ): void {
    const totalInputValue = inputs.reduce(
      (sum, input) => sum.add(new Dec(input.value)),
      new Dec(0)
    );
    const totalOutputValue = outputs.reduce(
      (sum, output) => sum.add(new Dec(output.value)),
      new Dec(0)
    );
    const remainderValue = totalInputValue.sub(totalOutputValue);

    if (!isSendMax && remainderValue.lt(new Dec(0))) {
      throw new Error("Insufficient balance");
    }
  }

  private processAddresses(
    inputs: IPsbtInput[],
    outputs: IPsbtOutput[],
    changeAddress: string | undefined,
    hasChange: boolean,
    network: string,
    feeRate: number,
    prevalidatedAddressInfos?: AddressInfo[]
  ): {
    inputsWithAddressInfo: (IPsbtInput & { addressInfo: AddressInfo })[];
    outputsWithAddressInfo: (IPsbtOutput & { addressInfo: AddressInfo })[];
  } {
    const addressInfoMap = new Map<string, AddressInfo>();

    const getAddressInfo = (address: string): AddressInfo => {
      if (addressInfoMap.has(address)) {
        return addressInfoMap.get(address)!;
      }

      if (prevalidatedAddressInfos) {
        const prevalidatedInfo = prevalidatedAddressInfos.find(
          (info) => info.address === address
        );
        if (prevalidatedInfo) {
          addressInfoMap.set(address, prevalidatedInfo);
          return prevalidatedInfo;
        }
      }

      const validatedInfo = this.validateAndGetAddressInfo(
        address,
        network as unknown as Network
      );

      if (!validatedInfo) {
        throw new Error(`Invalid address: ${address}`);
      }

      addressInfoMap.set(address, validatedInfo);
      return validatedInfo;
    };

    const inputsWithAddressInfo = inputs.map((input) => {
      try {
        const addressInfo = getAddressInfo(input.address);
        return { ...input, addressInfo };
      } catch (error) {
        throw new Error(`Invalid sender address: ${input.address}`);
      }
    });

    const outputsWithAddressInfo = outputs.map((output) => {
      try {
        const addressInfo = getAddressInfo(output.address);
        return { ...output, addressInfo };
      } catch (error) {
        throw new Error(`Invalid recipient address: ${output.address}`);
      }
    });

    if (hasChange && changeAddress) {
      try {
        const changeAddressInfo = getAddressInfo(changeAddress);

        const totalInputValue = inputs.reduce(
          (sum, input) => sum.add(new Dec(input.value)),
          new Dec(0)
        );

        // Calculate outputs total value (excluding change)
        const totalOutputValue = outputs.reduce(
          (sum, output) => sum.add(new Dec(output.value)),
          new Dec(0)
        );

        // Calculate fee and change value directly from input/output values
        // using the expected fee rate and actual transaction size from calcTxSize
        const outputParams: Record<string, number> = {};
        outputsWithAddressInfo.forEach((output) => {
          const key = `${output.addressInfo.type}_output_count`;
          outputParams[key] = (outputParams[key] || 0) + 1;
        });

        // Consider change output in tx size calculation
        const changeKey = `${changeAddressInfo.type}_output_count`;
        outputParams[changeKey] = (outputParams[changeKey] || 0) + 1;

        // Determine dominant input script type
        const typeCounts: Record<string, number> = {};
        inputsWithAddressInfo.forEach((input) => {
          typeCounts[input.addressInfo.type] =
            (typeCounts[input.addressInfo.type] || 0) + 1;
        });

        let inputScript = "p2tr";
        let maxCount = 0;
        Object.entries(typeCounts).forEach(([type, count]) => {
          if (count > maxCount) {
            maxCount = count;
            inputScript = type;
          }
        });

        const { txVBytes } = this._txSizeEstimator.calcTxSize({
          input_count: inputs.length,
          input_script: inputScript as InputScriptType,
          ...outputParams,
        });

        const calculatedFee = new Dec(Math.ceil(txVBytes * feeRate));
        const fee = calculatedFee.lt(new Dec(MIN_RELAY_FEE))
          ? new Dec(MIN_RELAY_FEE)
          : calculatedFee;

        const changeValue = totalInputValue.sub(totalOutputValue).sub(fee);

        if (changeValue.gte(new Dec(DUST_THRESHOLD))) {
          outputsWithAddressInfo.push({
            address: changeAddress,
            value: changeValue.truncate().toBigNumber().toJSNumber(),
            addressInfo: changeAddressInfo,
          });
        } else {
          console.warn("Change amount is less than dust threshold");
        }
      } catch (error) {
        throw new Error("Invalid change address");
      }
    }

    return { inputsWithAddressInfo, outputsWithAddressInfo };
  }

  private createPsbt(
    inputsWithAddressInfo: (IPsbtInput & { addressInfo: AddressInfo })[],
    outputsWithAddressInfo: (IPsbtOutput & { addressInfo: AddressInfo })[],
    network: string,
    maximumFeeRate: number
  ): string {
    const networkConfig =
      network === "mainnet" ? networks.bitcoin : networks.testnet;

    try {
      const psbt = new Psbt({ network: networkConfig });

      for (const input of inputsWithAddressInfo) {
        this.addInputToPsbt(psbt, input, networkConfig);
      }

      for (const output of outputsWithAddressInfo) {
        psbt.addOutput({
          address: output.address,
          value: output.value,
        });
      }

      psbt.setMaximumFeeRate(maximumFeeRate);

      return psbt.toHex();
    } catch (error) {
      console.error("Error creating PSBT:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to build PSBT: ${error.message}`);
      }
      throw new Error("Failed to build PSBT: Unknown error");
    }
  }

  private addInputToPsbt(
    psbt: Psbt,
    input: IPsbtInput & { addressInfo: AddressInfo },
    networkConfig: networks.Network
  ): void {
    const txInput: Parameters<typeof psbt.addInput>[0] = {
      hash: input.txid,
      index: input.vout,
      sequence: 0xfffffffd,
    };

    if (input.addressInfo.type === "p2pkh") {
      if (!input.nonWitnessUtxo) {
        throw new Error("Non-witness UTXO is required for p2pkh inputs");
      }

      if (input.bip32Derivation) {
        txInput.bip32Derivation = input.bip32Derivation;
      }

      psbt.addInput({
        ...txInput,
        nonWitnessUtxo: input.nonWitnessUtxo,
      });
    } else if (input.addressInfo.type === "p2wpkh") {
      if (input.bip32Derivation) {
        txInput.bip32Derivation = input.bip32Derivation;
      }

      psbt.addInput({
        ...txInput,
        witnessUtxo: {
          script: address.toOutputScript(input.address, networkConfig),
          value: input.value,
        },
      });
    } else if (input.addressInfo.type === "p2tr") {
      if (!input.tapInternalKey && !input.tapBip32Derivation) {
        throw new Error(
          "Tap internal key or bip32 derivation is required for p2tr inputs"
        );
      }

      if (input.tapInternalKey) {
        txInput.tapInternalKey = input.tapInternalKey;
      }

      if (input.tapBip32Derivation) {
        txInput.tapBip32Derivation = input.tapBip32Derivation;
      }

      psbt.addInput({
        ...txInput,
        witnessUtxo: {
          script: address.toOutputScript(input.address, networkConfig),
          value: input.value,
        },
      });
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

  private validateAndGetAddressInfo = (
    address: string,
    network?: Network
  ): AddressInfo | null => {
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
  ): { txVBytes: number; txBytes: number; txWeight: number } => {
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
    targetValue,
    calculateTxSize,
    calculateFee,
    isDust,
    outputParams,
    timeoutMs,
  }: SelectionParams): Set<string> | null {
    // Algorithm execution time limit (ms)
    const TIMEOUT = timeoutMs ?? BRANCH_AND_BOUND_TIMEOUT_MS;
    const startTime = Date.now();

    // Calculate total available value of all UTXOs
    const totalAvailable = utxos.reduce(
      (sum, utxo) => sum.add(new Dec(utxo.value)),
      new Dec(0)
    );

    // If target value is greater than total available value, return null
    if (targetValue.gt(totalAvailable)) {
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

      // If target value is satisfied, consider current selection as the best candidate
      if (effectiveValueWithChange.gte(targetValue)) {
        const remainder = effectiveValueWithChange.sub(targetValue);

        const isDustRemainder = isDust(remainder);

        // Prioritize non-dust change outputs
        // If remainder is not dust, consider it as a valid solution
        if (!isDustRemainder) {
          currentBest = {
            utxoIds: new Set(currentSelection),
            totalValue: currentValue,
            effectiveValue: effectiveValueWithChange,
            wastage: remainder,
          };
        } else {
          // If remainder is dust, we'll still consider it but with lower priority
          // We'll only use it if we can't find a better solution
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

      // Bounding: If adding all remaining UTXOs still cannot reach target value, return current best
      if (effectiveValueWithChange.add(remainingValue).lt(targetValue)) {
        return currentBest;
      }

      // If already exceeds target amount and current best is better, return current best
      if (
        currentBest &&
        effectiveValueWithChange.gte(targetValue) &&
        effectiveValueWithChange.sub(targetValue).lt(currentBest.wastage)
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

      // Prioritize non-dust change outputs
      const withUtxoDust = isDust(withUtxo.wastage);
      const withoutUtxoDust = isDust(withoutUtxo.wastage);

      // If one has non-dust change and the other has dust change, prefer the non-dust one
      if (!withUtxoDust && withoutUtxoDust) return withUtxo;
      if (withUtxoDust && !withoutUtxoDust) return withoutUtxo;

      // If both have the same dust status, select the one with less wastage
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
    targetValue,
    calculateTxSize,
    calculateFee,
    isDust,
    outputParams,
  }: Omit<SelectionParams, "timeoutMs">): Set<string> {
    const selectedUtxoIds = new Set<string>();
    let selectedValue = new Dec(0);

    // 1. Select UTXOs to satisfy target value
    for (const utxo of utxos) {
      const utxoId = `${utxo.txid}:${utxo.vout}`;
      selectedUtxoIds.add(utxoId);
      selectedValue = selectedValue.add(new Dec(utxo.value));

      // Calculate fee
      const txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
      const fee = calculateFee(txSize.txVBytes);

      // Calculate remainder
      const remainder = selectedValue.sub(targetValue).sub(fee);
      const isDustRemainder = isDust(remainder);

      // If target value is satisfied and remainder is not dust, stop
      // This prioritizes non-dust change outputs
      if (selectedValue.gte(targetValue) && !isDustRemainder) {
        break;
      }
    }

    // 2. Select additional UTXOs to cover fee
    let txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
    let fee = calculateFee(txSize.txVBytes);
    let remainder = selectedValue.sub(targetValue).sub(fee);

    if (remainder.lt(new Dec(0))) {
      for (const utxo of utxos) {
        const utxoId = `${utxo.txid}:${utxo.vout}`;
        if (selectedUtxoIds.has(utxoId)) continue;

        selectedUtxoIds.add(utxoId);
        selectedValue = selectedValue.add(new Dec(utxo.value));

        txSize = calculateTxSize(selectedUtxoIds.size, outputParams, true);
        fee = calculateFee(txSize.txVBytes);
        remainder = selectedValue.sub(targetValue).sub(fee);

        if (remainder.gte(new Dec(0))) {
          break;
        }
      }
    }

    // 3. If we have a dust remainder, try to find a better combination
    // that results in a non-dust remainder
    if (isDust(remainder) && remainder.gt(new Dec(0))) {
      // Try to find a UTXO that, when added, would result in a non-dust remainder
      for (const utxo of utxos) {
        const utxoId = `${utxo.txid}:${utxo.vout}`;
        if (selectedUtxoIds.has(utxoId)) continue;

        // Add this UTXO
        selectedUtxoIds.add(utxoId);
        const newValue = selectedValue.add(new Dec(utxo.value));

        // Calculate new fee and remainder
        const newTxSize = calculateTxSize(
          selectedUtxoIds.size,
          outputParams,
          true
        );
        const newFee = calculateFee(newTxSize.txVBytes);
        const newRemainder = newValue.sub(targetValue).sub(newFee);

        // If the new remainder is not dust, keep this UTXO
        if (!isDust(newRemainder) && newRemainder.gt(new Dec(0))) {
          selectedValue = newValue;
          break;
        }

        // Otherwise, remove this UTXO and try another one
        selectedUtxoIds.delete(utxoId);
      }
    }

    return selectedUtxoIds;
  }
}
