import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Psbt, Transaction, script as bscript } from "bitcoinjs-lib";
import { tapleafHash } from "bitcoinjs-lib/src/payments/bip341";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useGetBitcoinKeys } from "./use-bitcoin-network-config";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import {
  Bip32Derivation,
  DUST_THRESHOLD,
  TapBip32Derivation,
} from "@keplr-wallet/stores-bitcoin";
import { toXOnly } from "@keplr-wallet/crypto";
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

  const { chainId, network: networkConfig } = interactionData.data;

  const psbtsHexes = useMemo(() => {
    return "psbtHex" in interactionData.data
      ? [interactionData.data.psbtHex]
      : "psbtsHexes" in interactionData.data
      ? interactionData.data.psbtsHexes
      : cachedPsbtHex != null
      ? [cachedPsbtHex]
      : [];
  }, [interactionData.data, cachedPsbtHex]);

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

      // 2. bip32 derivation 일치 여부 확인
      // 마스터 지문 일치 여부 확인: derivation 데이터의 첫 번째 요소만 사용
      // (여러 개의 derivation <하나의 키에서 여러 파생 키를 생성하여 하나의 입력에 서명하는 경우> 사용하는 경우는 희박할 것..)
      if (bip32Derivation && bip32Derivation.length > 0) {
        const derivation = bip32Derivation[0];

        // mnemonic으로 생성된 키를 사용하거나 하드웨어 지갑에서 생성된 키를 사용하는 경우에만 검증
        // mnemonic으로 생성된 키의 경우 파생된 키가 올바른지 검증하는 것은 어려우므로 마스터 키의 지문만 검증한다.
        // (백그라운드에서 비밀키를 받아와서 하드닝 경로를 포함한 파생 키를 생성 및 검증하는 것은 안전하지 않음)
        // -> 아예 검증 로직을 백그라운드로 보내버리는 것도 고려해야 함
        const matchingMasterKey = bitcoinKeys.find(
          (key) =>
            key.masterFingerprintHex &&
            Buffer.from(key.masterFingerprintHex, "hex").equals(
              derivation.masterFingerprint
            )
        );

        if (matchingMasterKey) {
          // CHECK: master fingerprint 일치 여부 이상으로 검증이 필요할까?
          // 이 훅 내부에서 렛저 연결하고 파생키를 검증하는 것은 좀 비효율 + 번거로움

          // 스크립트 경로 지출인 경우, leafHashes가 주어진다. (taproot)
          let tapLeafHashesToSign: Buffer[] | undefined;
          if ("leafHashes" in derivation) {
            tapLeafHashesToSign = derivation.leafHashes;
          }

          if (tapLeafScripts && tapLeafScripts.length > 0) {
            const xonlyUserPubKey = toXOnly(derivation.pubkey); // 파생 키의 xonly 공개키 사용

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

      // 3. 일치하지 않더라도 script 경로 지출인 경우 서명 대상으로 추가
      if (tapLeafScripts && tapLeafScripts.length > 0) {
        // taproot 키가 여러 개 존재할 가능성?
        const taprootKey = bitcoinKeys.find(
          (key) => key.paymentType === "taproot"
        );
        if (taprootKey) {
          const xOnlyUserPubKey = toXOnly(Buffer.from(taprootKey.pubKey));
          const tapLeafHashesToSignFromScript = getTapLeafHashesToSign(
            xOnlyUserPubKey,
            tapLeafScripts
          );

          if (tapLeafHashesToSignFromScript.length > 0) {
            return {
              isToSign: true,
              hdPath: taprootKey.derivationPath,
              tapLeafHashesToSign: tapLeafHashesToSignFromScript,
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

  const validatePsbts = useCallback(async () => {
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
          const address = script
            ? fromOutputScript(script, networkConfig)
            : "unknown";

          if (script && !isSigned) {
            // check if the input is key path spending
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

        // 수수료가 0보다 작으면 유효하지 않은 psbt이다.
        if (fee.lte(new Dec(0))) {
          throw new Error(
            "Insufficient fee: inputs must be greater than outputs"
          );
        } else {
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
      }

      const totalFee = totalInputValue.sub(totalOutputValue);
      if (totalFee.lte(new Dec(0))) {
        throw new Error("Insufficient fee for transaction");
      }

      // 각 psbt의 유효성 검증 결과를 저장하고 계산된 수수료를 설정한다.
      setValidatedPsbts(validatedPsbtResults);
      feeConfig.setValue(totalFee.truncate().toString());
      setIsInitialized(true);
    } catch (e) {
      // psbt deserialize 오류 또는 입력의 합이 출력의 합보다 작은 psbt가 있는 경우
      // 이는 더 이상 검증을 진행할 수 없는 치명적인 오류이다.
      setCriticalValidationError(e as Error);
    }
  }, [
    psbtsHexes,
    feeConfig,
    networkConfig,
    getInputToSignInfo,
    processInputValuesByAddress,
    processOutputValuesByAddress,
    decodePsbt,
  ]);

  useEffect(() => {
    if (bitcoinKeys.length === 0 || psbtsHexes.length === 0 || isInitialized) {
      return;
    }

    validatePsbts();
  }, [validatePsbts, isInitialized, psbtsHexes.length, bitcoinKeys.length]);

  return {
    isInitialized,
    validatedPsbts,
    criticalValidationError,
  };
};
