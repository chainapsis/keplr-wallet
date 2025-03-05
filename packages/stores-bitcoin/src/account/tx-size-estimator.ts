import { Int } from "@keplr-wallet/unit";

// https://github.com/argvil19/bitcoin-transaction-size-calculator/blob/master/index.js
export type InputScriptType =
  | "p2pkh"
  | "p2sh"
  | "p2sh-p2wpkh"
  | "p2sh-p2wsh"
  | "p2wpkh"
  | "p2wsh"
  | "p2tr";

export interface TxSizerParams {
  input_count: number; // number of inputs
  input_script: InputScriptType; // type of input script
  input_m: number; // number of signatures
  input_n: number; // number of pubkeys
  p2pkh_output_count: number; // number of p2pkh outputs
  p2sh_output_count: number; // number of p2sh outputs
  p2sh_p2wpkh_output_count: number; // number of p2sh-p2wpkh outputs
  p2sh_p2wsh_output_count: number; // number of p2sh-p2wsh outputs
  p2wpkh_output_count: number; // number of p2wpkh outputs
  p2wsh_output_count: number; // number of p2wsh outputs
  p2tr_output_count: number; // number of p2tr outputs
}

export class BitcoinTxSizeEstimator {
  P2PKH_IN_SIZE = 148;
  P2PKH_OUT_SIZE = 34;
  P2SH_OUT_SIZE = 32;
  P2SH_P2WPKH_OUT_SIZE = 32;
  P2SH_P2WSH_OUT_SIZE = 32;
  P2SH_P2WPKH_IN_SIZE = 91;
  P2WPKH_IN_SIZE = 67.75;
  P2WPKH_OUT_SIZE = 31;
  P2WSH_OUT_SIZE = 43;
  P2TR_OUT_SIZE = 43;
  P2TR_IN_SIZE = 57.25;
  PUBKEY_SIZE = 33;
  SIGNATURE_SIZE = 72;
  SUPPORTED_INPUT_SCRIPT_TYPES: InputScriptType[] = [
    "p2pkh",
    "p2sh",
    "p2sh-p2wpkh",
    "p2sh-p2wsh",
    "p2wpkh",
    "p2wsh",
    "p2tr",
  ];

  defaultParams: TxSizerParams = {
    input_count: 0,
    input_script: "p2wpkh",
    input_m: 0,
    input_n: 0,
    p2pkh_output_count: 0,
    p2sh_output_count: 0,
    p2sh_p2wpkh_output_count: 0,
    p2sh_p2wsh_output_count: 0,
    p2wpkh_output_count: 0,
    p2wsh_output_count: 0,
    p2tr_output_count: 0,
  };

  params: TxSizerParams = { ...this.defaultParams };

  getSizeOfScriptLengthElement(length: number) {
    if (length < 75) {
      return 1;
    } else if (length <= 255) {
      return 2;
    } else if (length <= 65535) {
      return 3;
    } else if (length <= 4294967295) {
      return 5;
    } else {
      throw new Error("Size of redeem script is too large");
    }
  }

  getSizeOfVarInt(length: number) {
    if (length < 253) {
      return 1;
    } else if (length < 65535) {
      return 3;
    } else if (length < 4294967295) {
      return 5;
    } else if (new Int(length).lt(new Int("18446744073709551615"))) {
      return 9;
    } else {
      throw new Error("Invalid let int");
    }
  }

  getTxOverheadVBytes(
    input_script: InputScriptType,
    input_count: number,
    output_count: number
  ) {
    let witness_vbytes;
    if (input_script === "p2pkh" || input_script === "p2sh") {
      witness_vbytes = 0;
    } else {
      // Transactions with segwit inputs have extra overhead
      witness_vbytes =
        0.25 + // segwit marker
        0.25 + // segwit flag
        this.getSizeOfVarInt(input_count) / 4; // witness element count
    }

    return (
      4 + // nVersion
      this.getSizeOfVarInt(input_count) + // number of inputs
      this.getSizeOfVarInt(output_count) + // number of outputs
      4 + // nLockTime
      witness_vbytes
    );
  }

  getTxOverheadExtraRawBytes(
    input_script: InputScriptType,
    input_count: number
  ) {
    let witness_vbytes;
    if (input_script === "p2pkh" || input_script === "p2sh") {
      witness_vbytes = 0;
    } else {
      // Transactions with segwit inputs have extra overhead
      witness_vbytes =
        0.25 + // segwit marker
        0.25 + // segwit flag
        this.getSizeOfVarInt(input_count) / 4; // witness element count
    }

    return witness_vbytes * 3;
  }

  prepareParams(opts: Partial<TxSizerParams>) {
    // Verify opts and set them to this.params
    opts = opts || Object.assign(this.defaultParams);

    const input_count = opts.input_count || this.defaultParams.input_count;
    if (!Number.isInteger(input_count) || input_count < 0) {
      throw new Error("expecting positive input count, got: " + input_count);
    }

    const input_script = opts.input_script || this.defaultParams.input_script;
    if (this.SUPPORTED_INPUT_SCRIPT_TYPES.indexOf(input_script) === -1) {
      throw new Error("Not supported input script type");
    }

    const input_m = opts.input_m || this.defaultParams.input_m;
    if (!Number.isInteger(input_m) || input_m < 0) {
      throw new Error("expecting positive signature count");
    }

    const input_n = opts.input_n || this.defaultParams.input_n;
    if (!Number.isInteger(input_n) || input_n < 0) {
      throw new Error("expecting positive pubkey count");
    }

    const p2pkh_output_count =
      opts.p2pkh_output_count || this.defaultParams.p2pkh_output_count;
    if (!Number.isInteger(p2pkh_output_count) || p2pkh_output_count < 0) {
      throw new Error("expecting positive p2pkh output count");
    }

    const p2sh_output_count =
      opts.p2sh_output_count || this.defaultParams.p2sh_output_count;
    if (!Number.isInteger(p2sh_output_count) || p2sh_output_count < 0) {
      throw new Error("expecting positive p2sh output count");
    }

    const p2sh_p2wpkh_output_count =
      opts.p2sh_p2wpkh_output_count ||
      this.defaultParams.p2sh_p2wpkh_output_count;
    if (
      !Number.isInteger(p2sh_p2wpkh_output_count) ||
      p2sh_p2wpkh_output_count < 0
    ) {
      throw new Error("expecting positive p2sh-p2wpkh output count");
    }

    const p2sh_p2wsh_output_count =
      opts.p2sh_p2wsh_output_count ||
      this.defaultParams.p2sh_p2wsh_output_count;
    if (
      !Number.isInteger(p2sh_p2wsh_output_count) ||
      p2sh_p2wsh_output_count < 0
    ) {
      throw new Error("expecting positive p2sh-p2wsh output count");
    }

    const p2wpkh_output_count =
      opts.p2wpkh_output_count || this.defaultParams.p2wpkh_output_count;
    if (!Number.isInteger(p2wpkh_output_count) || p2wpkh_output_count < 0) {
      throw new Error("expecting positive p2wpkh output count");
    }

    const p2wsh_output_count =
      opts.p2wsh_output_count || this.defaultParams.p2wsh_output_count;
    if (!Number.isInteger(p2wsh_output_count) || p2wsh_output_count < 0) {
      throw new Error("expecting positive p2wsh output count");
    }

    const p2tr_output_count =
      opts.p2tr_output_count || this.defaultParams.p2tr_output_count;
    if (!Number.isInteger(p2tr_output_count) || p2tr_output_count < 0) {
      throw new Error("expecting positive p2tr output count");
    }

    this.params = {
      input_count,
      input_script,
      input_m,
      input_n,
      p2pkh_output_count,
      p2sh_output_count,
      p2sh_p2wpkh_output_count,
      p2sh_p2wsh_output_count,
      p2wpkh_output_count,
      p2wsh_output_count,
      p2tr_output_count,
    };

    return this.params;
  }

  getOutputCount() {
    return (
      this.params.p2pkh_output_count +
      this.params.p2sh_output_count +
      this.params.p2sh_p2wpkh_output_count +
      this.params.p2sh_p2wsh_output_count +
      this.params.p2wpkh_output_count +
      this.params.p2wsh_output_count +
      this.params.p2tr_output_count
    );
  }

  getSizeBasedOnInputType() {
    // In most cases the input size is predictable. For multisig inputs we need to perform a detailed calculation
    let inputSize = 0; // in virtual bytes
    let inputWitnessSize = 0;
    let redeemScriptSize;
    switch (this.params.input_script) {
      case "p2pkh":
        inputSize = this.P2PKH_IN_SIZE;
        break;
      case "p2sh-p2wpkh":
        inputSize = this.P2SH_P2WPKH_IN_SIZE;
        inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
        break;
      case "p2wpkh":
        inputSize = this.P2WPKH_IN_SIZE;
        inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
        break;
      case "p2tr": // Only consider the cooperative taproot signing path assume multisig is done via aggregate signatures
        inputSize = this.P2TR_IN_SIZE;
        inputWitnessSize = 65; // getSizeOfletInt(schnorrSignature) + schnorrSignature
        break;
      case "p2sh":
        redeemScriptSize =
          1 + // OP_M
          this.params.input_n * (1 + this.PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
          1 + // OP_N
          1; // OP_CHECKMULTISIG
        // eslint-disable-next-line no-case-declarations
        const scriptSigSize =
          1 + // size(0)
          this.params.input_m * (1 + this.SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
          this.getSizeOfScriptLengthElement(redeemScriptSize) +
          redeemScriptSize;
        inputSize =
          32 + 4 + this.getSizeOfVarInt(scriptSigSize) + scriptSigSize + 4;
        break;
      case "p2sh-p2wsh":
      case "p2wsh":
        redeemScriptSize =
          1 + // OP_M
          this.params.input_n * (1 + this.PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
          1 + // OP_N
          1; // OP_CHECKMULTISIG
        inputWitnessSize =
          1 + // size(0)
          this.params.input_m * (1 + this.SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
          this.getSizeOfScriptLengthElement(redeemScriptSize) +
          redeemScriptSize;
        inputSize =
          36 + // outpoint (spent UTXO ID)
          inputWitnessSize / 4 + // witness program
          4; // nSequence
        if (this.params.input_script === "p2sh-p2wsh") {
          inputSize += 32 + 3; // P2SH wrapper (redeemscript hash) + overhead?
        }
        break;
      default:
        throw new Error("Not supported input script type");
    }

    return {
      inputSize,
      inputWitnessSize,
    };
  }

  calcTxSize(opts: Partial<TxSizerParams>) {
    this.prepareParams(opts);
    const output_count = this.getOutputCount();
    const { inputSize, inputWitnessSize } = this.getSizeBasedOnInputType();

    const txVBytes =
      this.getTxOverheadVBytes(
        this.params.input_script,
        this.params.input_count,
        output_count
      ) +
      inputSize * this.params.input_count +
      this.P2PKH_OUT_SIZE * this.params.p2pkh_output_count +
      this.P2SH_OUT_SIZE * this.params.p2sh_output_count +
      this.P2SH_P2WPKH_OUT_SIZE * this.params.p2sh_p2wpkh_output_count +
      this.P2SH_P2WSH_OUT_SIZE * this.params.p2sh_p2wsh_output_count +
      this.P2WPKH_OUT_SIZE * this.params.p2wpkh_output_count +
      this.P2WSH_OUT_SIZE * this.params.p2wsh_output_count +
      this.P2TR_OUT_SIZE * this.params.p2tr_output_count;

    const txBytes =
      this.getTxOverheadExtraRawBytes(
        this.params.input_script,
        this.params.input_count
      ) +
      txVBytes +
      inputWitnessSize * this.params.input_count;
    const txWeight = txVBytes * 4;

    return { txVBytes, txBytes, txWeight };
  }

  estimateFee(vbyte: number, satVb: number) {
    if (isNaN(vbyte) || isNaN(satVb)) {
      throw new Error("Parameters should be numbers");
    }
    return vbyte * satVb;
  }

  formatFeeRange(fee: number, multiplier: number) {
    if (isNaN(fee) || isNaN(multiplier)) {
      throw new Error("Parameters should be numbers");
    }

    if (multiplier < 0) {
      throw new Error("Multiplier cant be negative");
    }

    const multipliedFee = fee * multiplier;

    return fee - multipliedFee + " - " + (fee + multipliedFee);
  }
}
