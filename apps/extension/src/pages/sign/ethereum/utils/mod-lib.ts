import { ethers } from "ethers";

// Type definitions based on the Solidity implementation
export type CallType = string; // 1 byte hex string
export type ExecType = string; // 1 byte hex string
export type ModeSelector = string; // 4 bytes hex string
export type ModePayload = string; // 22 bytes hex string
export type ModeCode = string; // 32 bytes hex string

// Interface for decoded mode components
export interface DecodedMode {
  callType: CallType;
  execType: ExecType;
  unused: string;
  modeSelector: ModeSelector;
  modePayload: ModePayload;
}

// CallType constants
export const CALLTYPE_SINGLE: CallType = "0x00";
export const CALLTYPE_BATCH: CallType = "0x01";
export const CALLTYPE_STATIC: CallType = "0xFE";
export const CALLTYPE_DELEGATECALL: CallType = "0xFF";

// ExecType constants
export const EXECTYPE_DEFAULT: ExecType = "0x00";
export const EXECTYPE_TRY: ExecType = "0x01";

// ModeSelector constants
export const MODE_DEFAULT: ModeSelector = "0x00000000";
export const MODE_OFFSET: ModeSelector = ethers
  .keccak256(ethers.toUtf8Bytes("default.mode.offset"))
  .slice(0, 10); // bytes4

export class ModeLib {
  /**
   * Encode a ModeCode from its components
   * @param callType - 1 byte hex string (e.g., '0x00')
   * @param execType - 1 byte hex string (e.g., '0x00')
   * @param modeSelector - 4 bytes hex string (e.g., '0x00000000')
   * @param modePayload - 22 bytes hex string (e.g., '0x' + '00'.repeat(22))
   * @returns 32 bytes hex string (ModeCode)
   */
  static encode(
    callType: CallType,
    execType: ExecType,
    modeSelector: ModeSelector,
    modePayload: ModePayload
  ): ModeCode {
    // Ensure proper padding
    const paddedCallType = ethers.zeroPadValue(callType, 1);
    const paddedExecType = ethers.zeroPadValue(execType, 1);
    const unusedBytes = "0x00000000"; // 4 bytes of zeros
    const paddedModeSelector = ethers.zeroPadValue(modeSelector, 4);
    const paddedModePayload = ethers.zeroPadValue(modePayload, 22);

    // Concatenate all parts
    const encoded = ethers.concat([
      paddedCallType,
      paddedExecType,
      unusedBytes,
      paddedModeSelector,
      paddedModePayload,
    ]);

    return ethers.zeroPadValue(encoded, 32);
  }

  /**
   * Decode a ModeCode into its components
   * @param mode - 32 bytes hex string
   * @returns Object with callType, execType, modeSelector, modePayload
   */
  static decode(mode: ModeCode): DecodedMode {
    const modeBytes = ethers.getBytes(mode);

    return {
      callType: ethers.hexlify(modeBytes.slice(0, 1)),
      execType: ethers.hexlify(modeBytes.slice(1, 2)),
      unused: ethers.hexlify(modeBytes.slice(2, 6)),
      modeSelector: ethers.hexlify(modeBytes.slice(6, 10)),
      modePayload: ethers.hexlify(modeBytes.slice(10, 32)),
    };
  }

  /**
   * Encode a simple single execution mode
   * @returns ModeCode for simple single execution
   */
  static encodeSimpleSingle(): ModeCode {
    return this.encode(
      CALLTYPE_SINGLE,
      EXECTYPE_DEFAULT,
      MODE_DEFAULT,
      "0x" + "00".repeat(22) // 22 bytes of zeros
    );
  }

  /**
   * Encode a simple batch execution mode
   * @returns ModeCode for simple batch execution
   */
  static encodeSimpleBatch(): ModeCode {
    return this.encode(
      CALLTYPE_BATCH,
      EXECTYPE_DEFAULT,
      MODE_DEFAULT,
      "0x" + "00".repeat(22) // 22 bytes of zeros
    );
  }

  /**
   * Get only the CallType from a ModeCode
   * @param mode - 32 bytes hex string
   * @returns 1 byte hex string representing the CallType
   */
  static getCallType(mode: ModeCode): CallType {
    const modeBytes = ethers.getBytes(mode);
    return ethers.hexlify(modeBytes.slice(0, 1));
  }

  /**
   * Get only the ExecType from a ModeCode
   * @param mode - 32 bytes hex string
   * @returns 1 byte hex string representing the ExecType
   */
  static getExecType(mode: ModeCode): ExecType {
    const modeBytes = ethers.getBytes(mode);
    return ethers.hexlify(modeBytes.slice(1, 2));
  }

  /**
   * Get only the ModeSelector from a ModeCode
   * @param mode - 32 bytes hex string
   * @returns 4 bytes hex string representing the ModeSelector
   */
  static getModeSelector(mode: ModeCode): ModeSelector {
    const modeBytes = ethers.getBytes(mode);
    return ethers.hexlify(modeBytes.slice(6, 10));
  }

  /**
   * Get only the ModePayload from a ModeCode
   * @param mode - 32 bytes hex string
   * @returns 22 bytes hex string representing the ModePayload
   */
  static getModePayload(mode: ModeCode): ModePayload {
    const modeBytes = ethers.getBytes(mode);
    return ethers.hexlify(modeBytes.slice(10, 32));
  }
}
