import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNativeSegwitUTXOs, useTaprootUTXOs } from "./use-utxos";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useBitcoinAddresses } from "./use-bitcoin-network-config";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";

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
    throw new Error("invalid psbt");
  }
  return formatData;
}

export const usePsbtsValidate = (
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>,
  feeConfig: IFeeConfig
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validatedPsbts, setValidatedPsbts] = useState<
    {
      psbt: Psbt;
      inputsToSign: number[];
      feeAmount: Dec;
      warnings: string[];
    }[]
  >([]);
  const [validationError, setValidationError] = useState<Error | undefined>(
    undefined
  );

  const {
    chainId,
    network: networkConfig,
    // origin
    // address
    // pubKey
  } = interactionData.data;

  const psbtsHexes = useMemo(() => {
    return "psbtHex" in interactionData.data
      ? [interactionData.data.psbtHex]
      : interactionData.data.psbtsHexes;
  }, [interactionData.data]);

  const { legacyAddress, nativeSegwitAddress, taprootAddress } =
    useBitcoinAddresses(chainId);

  // extension 내부적으로는 각 주소 유형에 따른 utxo만을 사용하지만,
  // 외부에서 서명 요청이 들어온 경우 동일한 공개키에서 생선된 native segwit 주소와 taproot 주소의
  // utxo가 섞여 들어올 가능성이 있다. 따라서 모든 utxo를 조회하여 유효한 psbt인지 검증한다.
  // legacy 주소의 utxo는 무시한다.
  const {
    isFetching: isFetchingNativeSegwitUTXOs,
    error: nativeSegwitUtxosError,
    availableUTXOs: nativeSegwitAvailableUTXOs,
  } = useNativeSegwitUTXOs(chainId);
  const {
    isFetching: isFetchingTaprootUTXOs,
    error: taprootUtxosError,
    availableUTXOs: taprootAvailableUTXOs,
  } = useTaprootUTXOs(chainId);

  const availableUTXOsSet = useMemo(() => {
    const utxoSet = new Set<string>();
    for (const utxo of nativeSegwitAvailableUTXOs) {
      utxoSet.add(`${utxo.txid}:${utxo.vout}`);
    }

    for (const utxo of taprootAvailableUTXOs) {
      utxoSet.add(`${utxo.txid}:${utxo.vout}`);
    }
    return utxoSet;
  }, [nativeSegwitAvailableUTXOs, taprootAvailableUTXOs]);

  const validatePsbts = useCallback(() => {
    // 검증 파라미터가 변경되어서 재검증이 필요하면 오류를 초기화한다.
    setValidationError(undefined);

    try {
      const psbts = psbtsHexes.map((psbtHex) =>
        Psbt.fromHex(formatPsbtHex(psbtHex), {
          network: networkConfig,
        })
      );
      let totalInputAmount = new Dec(0);
      let totalOutputAmount = new Dec(0);
      const validatedPsbts: {
        psbt: Psbt;
        inputsToSign: number[];
        feeAmount: Dec;
        warnings: string[];
      }[] = [];

      for (const psbt of psbts) {
        const txInputs = psbt.txInputs;
        const rawInputs = psbt.data.inputs;

        let sumInputAmount = new Dec(0);
        let sumOutputAmount = new Dec(0);
        const inputsToSign: number[] = [];
        const warnings: string[] = [];
        for (const [index, input] of rawInputs.entries()) {
          let script: any = null;
          let value = 0;

          if (input.witnessUtxo) {
            script = input.witnessUtxo.script;
            value = Number(input.witnessUtxo.value);
          } else if (input.nonWitnessUtxo) {
            const tx = Transaction.fromBuffer(input.nonWitnessUtxo);
            const output = tx.outs[txInputs[index].index];
            script = output.script;
            value = Number(output.value);
          }

          const isSigned = input.finalScriptSig || input.finalScriptWitness;

          if (script && !isSigned) {
            const address = fromOutputScript(script, networkConfig);

            // 사용자의 주소와 일치하는 input인 경우 서명 대상으로 추가
            if (
              address === legacyAddress ||
              address === nativeSegwitAddress ||
              address === taprootAddress
            ) {
              inputsToSign.push(index);

              const txInput = psbt.txInputs[index];
              const key = `${txInput.hash.reverse().toString("hex")}:${
                txInput.index
              }`;

              // 소유하고 있지 않은 또는 소유하고 있는지 확인이 어려운 input을 사용하는 psbt는
              // 여러 개의 서명이 필요하거나, 다른 주소의 utxo를 사용하는 경우,
              // 또는 쿼리 결과의 제한으로 인해 확인이 어려운 경우(+ 쿼리 오류난 경우)가 있다.
              // 따라서 오류를 반환하지 않고 경고를 반환한다. 사실 이렇게까지 해야할까 싶긴 한데...
              if (!availableUTXOsSet.has(key)) {
                warnings.push(
                  `Input ${key} is not available. Please check the utxo.`
                );
              }
            }
          } else {
            // CHECK: 다중 서명이 필요한 경우에 대한 처리가 필요할까?
            // dapp에서 요청이 들어오는 경우에 대한 use case 조사 필요 (ex. babylon staking)
          }

          sumInputAmount = sumInputAmount.add(new Dec(value));
        }

        // CHECK: output은 검증할 것이 있나?
        const outputs = psbt.txOutputs;
        for (const output of outputs) {
          sumOutputAmount = sumOutputAmount.add(new Dec(output.value));
        }

        const feeAmount = sumInputAmount.sub(sumOutputAmount);

        // 수수료가 0보다 작으면 유효하지 않은 psbt이다.
        if (feeAmount.lte(new Dec(0))) {
          validatedPsbts.push({
            psbt,
            inputsToSign,
            feeAmount: new Dec(0),
            warnings,
          });
        } else {
          validatedPsbts.push({
            psbt,
            inputsToSign,
            feeAmount,
            warnings,
          });

          totalInputAmount = totalInputAmount.add(sumInputAmount);
          totalOutputAmount = totalOutputAmount.add(sumOutputAmount);
        }
      }

      const feeAmount = totalInputAmount.sub(totalOutputAmount);
      if (feeAmount.lte(new Dec(0))) {
        throw new Error(
          "Invalid psbt: total input amount is less than total output amount"
        );
      }

      // 각 psbt의 유효성 검증 결과를 저장하고 계산된 수수료를 설정한다.
      setValidatedPsbts(validatedPsbts);
      feeConfig.setValue(feeAmount.truncate().toString());
      setIsInitialized(true);
    } catch (e) {
      // psbt deserialize 오류 또는 전체 입력의 합이 출력의 합보다 작은 경우
      setValidationError(e as Error);
    }
  }, [
    networkConfig,
    psbtsHexes,
    availableUTXOsSet,
    legacyAddress,
    nativeSegwitAddress,
    taprootAddress,
    feeConfig,
  ]);

  useEffect(() => {
    if (isFetchingNativeSegwitUTXOs || isFetchingTaprootUTXOs) {
      setIsInitialized(false);
    }
  }, [isFetchingNativeSegwitUTXOs, isFetchingTaprootUTXOs]);

  useEffect(() => {
    if (psbtsHexes.length === 0 || isInitialized) {
      return;
    }

    validatePsbts();
  }, [validatePsbts, isInitialized, psbtsHexes.length]);

  return {
    isInitialized,
    validatedPsbts,
    validationError,
    queryError: nativeSegwitUtxosError || taprootUtxosError,
    validatePsbts,
  };
};
