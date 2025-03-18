import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Network, Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useGetBitcoinKeys } from "./use-bitcoin-network-config";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import {
  Bip32Derivation,
  DUST_THRESHOLD,
  TapBip32Derivation,
} from "@keplr-wallet/stores-bitcoin";

export type ValidatedPsbt = {
  psbt: Psbt;
  inputsToSign: {
    index: number;
    address: string;
    path?: string;
  }[];
  fee: Dec;
  sumInputValueByAddress: {
    address: string;
    value: Dec;
  }[];
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
  psbtsHexes: string[],
  feeConfig: IFeeConfig,
  chainId: string,
  networkConfig: Network
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
      : interactionData.data.psbtsHexes;
  }, [interactionData.data]);

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
        }))
        .sort((a, b) => {
          // 1차로 소유한 계정순 -> inputsToSign에 포함되어 있는지 여부
          const isAMine = inputsToSign.some(
            (input) => input.address === a.address
          );
          const isBMine = inputsToSign.some(
            (input) => input.address === b.address
          );

          if (isAMine && isBMine) {
            // 둘 다 소유한 계정인 경우, value 순으로 정렬
            if (a.value.gt(b.value)) {
              return -1;
            } else if (a.value.lt(b.value)) {
              return 1;
            } else {
              return 0;
            }
          }

          if (isAMine) {
            return -1;
          }

          return 1;
        });
    };
  }, []);

  const isInputMine = useCallback(
    async (
      address: string,
      bip32Derivation?: Bip32Derivation[] | TapBip32Derivation[],
      isValidDerivationFn?: (path: string, pubkey: Buffer) => Promise<boolean>
    ) => {
      for (const key of bitcoinKeys) {
        if (key.address === address) {
          return {
            isMine: true,
            path: key.derivationPath, // mnemonic, 하드웨어 지갑은 경로를 포함하고 있어야 한다.
          };
        }

        if (bip32Derivation) {
          for (const derivation of bip32Derivation) {
            // 이 값을 사용하는 경우는 내부에서 mnemonic으로 생성된 키를 사용하거나 하드웨어 지갑에서 생성된 키를 사용하는 경우이다.
            // 이 시점에서는 파생된 키가 올바른지 검증(비밀키를 받아와서 하드닝 경로를 포함한 파생 키를 생성 및 검증하는 것은 안전하지 않음)은
            // 어려우므로 마스터 키의 지문만 검증한다. (백그라운드로 보내서 검증해야 할 수도 있음)
            if (
              key.masterFingerprintHex &&
              Buffer.from(key.masterFingerprintHex, "hex").equals(
                derivation.masterFingerprint
              )
            ) {
              return {
                isMine: true,
                path: derivation.path,
              };
            }

            // 하드웨어 지갑에서 파생된 키의 경우, 파생 경로와 공개키를 검증하는 함수를 제공한다.
            if (isValidDerivationFn) {
              const isValid = await isValidDerivationFn(
                derivation.path,
                derivation.pubkey
              );
              if (isValid) {
                return {
                  isMine: true,
                  path: derivation.path,
                };
              }
            }
          }
        }
      }

      return {
        isMine: false,
        path: undefined,
      };
    },
    [bitcoinKeys]
  );

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
        const inputsToSign: {
          index: number;
          address: string;
          path?: string;
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
          const address = fromOutputScript(script, networkConfig);

          if (script && !isSigned) {
            // 사용자의 주소와 일치하는 input인 경우 서명 대상으로 추가

            const { isMine, path } = await isInputMine(
              address,
              input.bip32Derivation ?? input.tapBip32Derivation
            );
            if (isMine) {
              inputsToSign.push({ index, address, path });
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
    networkConfig,
    psbtsHexes,
    isInputMine,
    processInputValuesByAddress,
    feeConfig,
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
