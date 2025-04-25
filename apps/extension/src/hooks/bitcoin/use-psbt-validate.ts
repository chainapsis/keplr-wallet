import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Psbt, Transaction, script as bscript } from "bitcoinjs-lib";
import { tapleafHash } from "bitcoinjs-lib/src/payments/bip341";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useGetBitcoinKeys } from "./use-bitcoin-network-config";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import {
  Bip32Derivation,
  DUST_THRESHOLD,
  TapBip32Derivation,
} from "@keplr-wallet/stores-bitcoin";
import { Hash, toXOnly } from "@keplr-wallet/crypto";
import { toASM } from "bitcoinjs-lib/src/script";

interface TapLeafScript {
  leafVersion: number;
  script: Buffer;
}

export type ValidatedPsbt = {
  psbt: Psbt;
  inputsToSign: {
    index: number;
    address: string;
    hdPath?: string;
    tapLeafHashesToSign?: Buffer[];
    sighashTypes?: number[];
    disableTweakSigner?: boolean;
    useTweakedSigner?: boolean;
  }[];
  fee: Dec;
  sumInputValueByAddress: {
    address: string;
    value: Dec;
    isMine: boolean;
  }[];
  sumOutputValueByAddress: {
    address: string;
    value: Dec;
    isMine: boolean;
  }[];
  decodedRawData: {
    version: number;
    locktime: number;
    inputs: {
      index: number;
      txid: string;
      vout: number;
      sequence: number | undefined;
    }[];
    outputs: {
      index: number;
      address: string;
      value: number;
    }[];
  };
};

export function formatPsbtHex(psbtHex: string) {
  let formatData = "";
  try {
    // base64 인코딩된 psbt인 경우, base64 디코딩 후 hex로 변환
    if (!/^[0-9a-fA-F]+$/.test(psbtHex)) {
      formatData = Psbt.fromBase64(psbtHex).toHex();
    } else {
      Psbt.fromHex(psbtHex);
      formatData = psbtHex;
    }
  } catch (e) {
    throw new Error("Invalid PSBT format to deserialize");
  }
  return formatData;
}

export const usePsbtsValidate = (
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>,
  feeConfig: IFeeConfig,
  cachedPsbtHex: string | null
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validatedPsbts, setValidatedPsbts] = useState<ValidatedPsbt[]>([]);
  const [criticalValidationError, setCriticalValidationError] = useState<
    Error | undefined
  >(undefined);

  const prevPsbtsHashRef = useRef<string | null>(null);

  const {
    chainId,
    network: networkConfig,
    signPsbtOptions,
  } = interactionData.data;

  const psbtsHexes = useMemo(() => {
    return "psbtHex" in interactionData.data
      ? [interactionData.data.psbtHex]
      : "psbtsHexes" in interactionData.data
      ? interactionData.data.psbtsHexes
      : cachedPsbtHex != null
      ? [cachedPsbtHex]
      : [];
  }, [interactionData.data, cachedPsbtHex]);

  const psbtsHash = useMemo(() => {
    if (psbtsHexes.length === 0) {
      return null;
    }

    const hash = Hash.sha256(new TextEncoder().encode(psbtsHexes.join(",")));
    return Buffer.from(hash).toString("hex");
  }, [psbtsHexes]);

  const bitcoinKeys = useGetBitcoinKeys(chainId);

  const processInputValuesByAddress = useMemo(() => {
    return (
      sumInputValueByAddressRecord: Record<string, Dec>,
      inputsToSign: { index: number; address: string }[]
    ) => {
      return Object.entries(sumInputValueByAddressRecord)
        .map(([address, value]) => ({
          address,
          value,
          isMine: inputsToSign.some((input) => input.address === address),
        }))
        .sort((a, b) => {
          if (a.isMine && b.isMine) {
            // 둘 다 소유한 계정인 경우, value 순으로 정렬
            if (a.value.gt(b.value)) {
              return -1;
            } else if (a.value.lt(b.value)) {
              return 1;
            } else {
              return 0;
            }
          }

          if (a.isMine) {
            return -1;
          }

          return 1;
        });
    };
  }, []);

  const processOutputValuesByAddress = useMemo(() => {
    return (
      sumOutputValueByAddressRecord: Record<string, Dec>,
      inputsToSign: { index: number; address: string }[]
    ) => {
      return Object.entries(sumOutputValueByAddressRecord)
        .map(([address, value]) => ({
          address,
          value,
          isMine:
            inputsToSign.some((input) => input.address === address) ||
            bitcoinKeys.some((key) => key.address === address),
        }))
        .sort((a, b) => {
          if (a.isMine && b.isMine) {
            // 둘 다 소유한 계정인 경우, value 순으로 정렬
            if (a.value.gt(b.value)) {
              return -1;
            } else if (a.value.lt(b.value)) {
              return 1;
            } else {
              return 0;
            }
          }

          if (a.isMine) {
            return -1;
          }

          return 1;
        });
    };
  }, [bitcoinKeys]);

  const getInputToSignInfo = useCallback(
    (
      address: string,
      tapLeafScripts?: TapLeafScript[],
      bip32Derivation?: Bip32Derivation[] | TapBip32Derivation[]
    ): {
      isToSign: boolean;
      hdPath?: string;
      tapLeafHashesToSign?: Buffer[];
    } => {
      const getTapLeafHashesToSign = (
        xOnlyUserPubKey: Buffer,
        tapLeafScripts: TapLeafScript[]
      ) => {
        const tapLeafHashesToSign: Buffer[] = [];

        for (const { script, leafVersion } of tapLeafScripts) {
          const decompiled = bscript.decompile(script);
          if (!decompiled) {
            continue;
          }

          const containsUserPubKey = decompiled.some(
            (op) => Buffer.isBuffer(op) && xOnlyUserPubKey.equals(op)
          );
          if (containsUserPubKey) {
            tapLeafHashesToSign.push(
              tapleafHash({ output: script, version: leafVersion })
            );
          }
        }

        return tapLeafHashesToSign;
      };
      // 키 경로 지출과 스크립트 경로 지출이 동시에 존재하는 경우는 이론상 가능하지만,
      // 거의 발생하지 않을 것으로 예상되므로 무시한다.

      // 1. 키 경로 지출 매칭 여부 확인 (주소 직접 일치 여부만 확인)
      const matchingKey = bitcoinKeys.find((key) => key.address === address);
      if (matchingKey) {
        return {
          isToSign: true,
          hdPath: matchingKey.derivationPath,
        };
      }

      // 2. taproot script 경로 지출 매칭 여부 확인
      if (tapLeafScripts && tapLeafScripts.length > 0) {
        for (const key of bitcoinKeys) {
          const xOnlyUserPubKey = toXOnly(Buffer.from(key.pubKey));
          const tapLeafHashesToSignFromScript = getTapLeafHashesToSign(
            xOnlyUserPubKey,
            tapLeafScripts
          );

          if (tapLeafHashesToSignFromScript.length > 0) {
            return {
              isToSign: true,
              hdPath: key.derivationPath,
              tapLeafHashesToSign: tapLeafHashesToSignFromScript,
            };
          }
        }
      }

      // 3. bip32 derivation 마스터 지문 일치 여부 확인
      // 1, 2번 검증에서 일반적으로 걸리지 않는 경우에만 거치는 검증
      // (하드웨어 지갑, 또는 현재 연결된 계정의 키가 아닌 다른 파생 키의 경로가 주어진 경우)
      if (bip32Derivation && bip32Derivation.length > 0) {
        for (const derivation of bip32Derivation) {
          const matchingKey = bitcoinKeys.find(
            (key) =>
              key.masterFingerprintHex &&
              Buffer.from(key.masterFingerprintHex, "hex").equals(
                derivation.masterFingerprint
              )
          );

          if (matchingKey) {
            // taproot 스크립트 경로 지출인 경우, leafHashes가 주어진다.
            let tapLeafHashesToSign: Buffer[] | undefined;
            if ("leafHashes" in derivation) {
              tapLeafHashesToSign = derivation.leafHashes;
            }

            if (tapLeafScripts && tapLeafScripts.length > 0) {
              const xonlyUserPubKey = toXOnly(derivation.pubkey);

              const tapLeafHashesToSignFromScript = getTapLeafHashesToSign(
                xonlyUserPubKey,
                tapLeafScripts
              );

              tapLeafHashesToSign = tapLeafHashesToSignFromScript.filter(
                (hash) =>
                  !tapLeafHashesToSign?.some((existingHash) =>
                    existingHash.equals(hash)
                  )
              );
            }

            return {
              isToSign: true,
              hdPath: derivation.path,
              tapLeafHashesToSign,
            };
          }
        }
      }

      return {
        isToSign: false,
        hdPath: undefined,
      };
    },
    [bitcoinKeys]
  );

  const decodePsbt = useCallback((psbt: Psbt) => {
    return {
      version: psbt.version,
      locktime: psbt.locktime,
      inputs: psbt.txInputs.map((input, index) => {
        const txid = input.hash.reverse().toString("hex");
        return {
          index,
          txid,
          vout: input.index,
          sequence: input.sequence,
        };
      }),
      outputs: psbt.txOutputs.map((output, index) => {
        return {
          index,
          address: output.address || "unknown address",
          value: output.value,
        };
      }),
    };
  }, []);

  const validatePsbts = useCallback(() => {
    // 검증 파라미터가 변경되어서 재검증이 필요하면 오류를 초기화한다.
    setCriticalValidationError(undefined);

    try {
      const psbts = psbtsHexes.map((psbtHex) =>
        Psbt.fromHex(formatPsbtHex(psbtHex), {
          network: networkConfig,
        })
      );

      let totalInputValue = new Dec(0);
      let totalOutputValue = new Dec(0);
      const validatedPsbtResults: ValidatedPsbt[] = [];

      for (const psbt of psbts) {
        const txInputs = psbt.txInputs;
        const rawInputs = psbt.data.inputs;

        let sumInputValue = new Dec(0);
        let sumOutputValue = new Dec(0);
        const sumInputValueByAddressRecord: Record<string, Dec> = {};
        const sumOutputValueByAddressRecord: Record<string, Dec> = {};
        const inputsToSign: {
          index: number;
          address: string;
          hdPath?: string;
          tapLeafHashesToSign?: Buffer[];

          publicKey?: string;
          sighashTypes?: number[];
          disableTweakSigner?: boolean;
          useTweakedSigner?: boolean;
        }[] = [];

        for (const [index, input] of rawInputs.entries()) {
          let script: any = null;
          let value = new Dec(0);

          if (input.witnessUtxo) {
            script = input.witnessUtxo.script;
            value = new Dec(input.witnessUtxo.value);
          } else if (input.nonWitnessUtxo) {
            const tx = Transaction.fromBuffer(input.nonWitnessUtxo);
            const output = tx.outs[txInputs[index].index];
            script = output.script;
            value = new Dec(output.value);
          }

          const isSigned = input.finalScriptSig || input.finalScriptWitness;
          let address: string;
          try {
            address = script
              ? fromOutputScript(script, networkConfig)
              : "unknown";
          } catch (e) {
            if (
              e instanceof Error &&
              e.message.toLowerCase().includes("has no matching address")
            ) {
              address = "unknown";
            } else {
              throw new Error("Invalid script to get address");
            }
          }

          // 서명할 입력이 따로 지정되지 않은 경우, 서명할 입력을 생성한다.
          if (script && !isSigned && !signPsbtOptions?.toSignInputs) {
            const { isToSign, hdPath, tapLeafHashesToSign } =
              getInputToSignInfo(
                address,
                input.tapLeafScript,
                input.bip32Derivation ?? input.tapBip32Derivation
              );

            // 소유한 주소이거나 서명할 트리노드가 있는 경우 서명 대상으로 추가
            if (isToSign) {
              inputsToSign.push({
                index,
                address,
                hdPath,
                sighashTypes: input.sighashType
                  ? [input.sighashType]
                  : undefined,
                tapLeafHashesToSign,
              });
            }
          }

          sumInputValue = sumInputValue.add(value);
          sumInputValueByAddressRecord[address] = sumInputValueByAddressRecord[
            address
          ]
            ? sumInputValueByAddressRecord[address].add(value)
            : value;
        }

        // 서명할 입력이 따로 지정된 경우
        if (signPsbtOptions?.toSignInputs) {
          for (const input of signPsbtOptions.toSignInputs) {
            const index = Number(input.index);
            if (isNaN(index)) {
              throw new Error("Invalid index in toSignInput");
            }

            if (!input.address && !input.publicKey) {
              throw new Error("No address or public key in toSignInput");
            }

            const myKey = bitcoinKeys.find(
              (key) =>
                (input.address && key.address === input.address) ||
                (input.publicKey &&
                  Buffer.from(key.pubKey).toString("hex") === input.publicKey)
            );
            if (!myKey) {
              throw new Error("Invalid address or public key in toSignInput");
            }

            const sighashTypes = input.sighashTypes?.map(Number);
            if (sighashTypes?.some(isNaN)) {
              throw new Error("Invalid sighash type in toSignInput");
            }

            const { isToSign, hdPath } = getInputToSignInfo(myKey.address);
            if (isToSign) {
              inputsToSign.push({
                index,
                address: myKey.address,
                hdPath,
                sighashTypes,
                disableTweakSigner: input.disableTweakSigner,
                useTweakedSigner: input.useTweakedSigner,
              });
            }
          }
        }

        // CHECK: output은 검증할 것이 있나?
        const outputs = psbt.txOutputs;
        for (const output of outputs) {
          if (output.value < DUST_THRESHOLD) {
            console.warn(
              "Output amount is less than the minimum amount (0.00000546). Transaction may fail."
            );
          }

          let address: string = "unknown";
          try {
            address =
              output.address ??
              (output.script
                ? fromOutputScript(output.script, networkConfig)
                : "unknown");
          } catch (e) {
            // 스크립트 경로 지출인 경우, 주소를 추출할 수 없어서 어셈블리 문자열로 반환한다
            address = toASM(output.script);
          }

          const value = new Dec(output.value);

          sumOutputValueByAddressRecord[address] =
            sumOutputValueByAddressRecord[address]
              ? sumOutputValueByAddressRecord[address].add(value)
              : value;

          sumOutputValue = sumOutputValue.add(new Dec(output.value));
        }

        const fee = sumInputValue.sub(sumOutputValue);

        validatedPsbtResults.push({
          psbt,
          inputsToSign,
          fee,
          sumInputValueByAddress: processInputValuesByAddress(
            sumInputValueByAddressRecord,
            inputsToSign
          ),
          sumOutputValueByAddress: processOutputValuesByAddress(
            sumOutputValueByAddressRecord,
            inputsToSign
          ),
          decodedRawData: decodePsbt(psbt),
        });

        totalInputValue = totalInputValue.add(sumInputValue);
        totalOutputValue = totalOutputValue.add(sumOutputValue);
      }

      const totalFee = totalInputValue.sub(totalOutputValue);

      // 각 psbt의 유효성 검증 결과를 저장하고 계산된 수수료를 설정한다.
      setValidatedPsbts(validatedPsbtResults);
      feeConfig.setValue(totalFee.truncate().toString());
      prevPsbtsHashRef.current = psbtsHash;

      setIsInitialized(true);
    } catch (e) {
      // psbt deserialize가 실패하는 경우, 이는 더 이상 검증을 진행할 수 없는 치명적인 오류이다.
      setCriticalValidationError(e as Error);
      console.error(e);
    }
  }, [
    psbtsHexes,
    psbtsHash,
    feeConfig,
    networkConfig,
    signPsbtOptions?.toSignInputs,
    getInputToSignInfo,
    bitcoinKeys,
    processInputValuesByAddress,
    processOutputValuesByAddress,
    decodePsbt,
  ]);

  useEffect(() => {
    // 검증이 필요한 경우:
    // 1. 아직 초기화되지 않은 상태이면서 필요한 데이터가 모두 있는 경우
    // 2. PSBT 해시값이 변경된 경우 (psbt의 값 또는 순서가 변경된 경우)
    const isReady = bitcoinKeys.length > 0 && psbtsHexes.length > 0;
    const detectedChange =
      prevPsbtsHashRef.current !== null &&
      prevPsbtsHashRef.current !== psbtsHash;

    const needValidation = isReady && (!isInitialized || detectedChange);

    if (needValidation) {
      validatePsbts();
    }
  }, [
    validatePsbts,
    isInitialized,
    psbtsHexes.length,
    bitcoinKeys.length,
    psbtsHash,
  ]);

  return {
    isInitialized,
    validatedPsbts,
    criticalValidationError,
  };
};
