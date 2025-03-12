import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNativeSegwitUTXOs, useTaprootUTXOs } from "./use-utxos";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import {
  useBitcoinAddresses,
  useBitcoinNetworkConfig,
} from "./use-bitcoin-network-config";

export const usePsbtsValidate = (
  chainId: string,
  psbtsHexes: string[],
  feeConfig: IFeeConfig
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validatedPsbts, setValidatedPsbts] = useState<
    {
      psbt: Psbt;
      inputsToSign: number[];
      feeAmount: Dec;
      validationError: Error | undefined;
    }[]
  >([]);
  const [validationError, setValidationError] = useState<Error | undefined>(
    undefined
  );

  const { networkConfig } = useBitcoinNetworkConfig(chainId);
  const { legacyAddress, nativeSegwitAddress, taprootAddress } =
    useBitcoinAddresses(chainId);

  // extension 내부적으로는 각 주소 유형에 따른 utxo만을 사용하지만,
  // 외부에서 서명 요청이 들어온 경우 동일한 공개키에서 생선된 native segwit 주소와 taproot 주소의
  // utxo가 섞여 들어올 가능성이 있다. 따라서 모든 utxo를 조회하여 유효한 psbt인지 검증한다.
  // legacy 주소는 일단 무시한다.
  const nativeSegwitUTXOs = useNativeSegwitUTXOs(chainId);
  const taprootUTXOs = useTaprootUTXOs(chainId);

  const utxosAvailable = useMemo(() => {
    return nativeSegwitUTXOs !== undefined && taprootUTXOs !== undefined;
  }, [nativeSegwitUTXOs, taprootUTXOs]);

  const validatePsbts = useCallback(() => {
    // 검증 파라미터가 변경되어서 재검증이 필요하면 오류를 초기화한다.
    setValidationError(undefined);

    // 검증에 사용할 utxo가 없으면 오류를 반환한다.
    if (!nativeSegwitUTXOs || !taprootUTXOs) {
      setValidationError(new Error("Can't find utxos"));
      return;
    }

    const availableUTXOs = new Set<string>();
    for (const utxo of nativeSegwitUTXOs) {
      availableUTXOs.add(`${utxo.txid}:${utxo.vout}`);
    }

    for (const utxo of taprootUTXOs) {
      availableUTXOs.add(`${utxo.txid}:${utxo.vout}`);
    }

    try {
      const psbts = psbtsHexes.map((psbtHex) => Psbt.fromHex(psbtHex));
      let totalInputAmount = new Dec(0);
      let totalOutputAmount = new Dec(0);
      const validatedPsbts: {
        psbt: Psbt;
        inputsToSign: number[];
        feeAmount: Dec;
        validationError: Error | undefined;
      }[] = [];

      for (const psbt of psbts) {
        const txInputs = psbt.txInputs;
        const rawInputs = psbt.data.inputs;

        let sumInputAmount = new Dec(0);
        let sumOutputAmount = new Dec(0);
        const inputsToSign: number[] = [];

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

            if (
              address in [legacyAddress, nativeSegwitAddress, taprootAddress]
            ) {
              inputsToSign.push(index);

              const txInput = psbt.txInputs[index];
              const key = `${txInput.hash.reverse().toString("hex")}:${
                txInput.index
              }`;

              if (!availableUTXOs.has(key)) {
                // 소유하고 있지 않은 input을 사용하는 psbt는
                // 여러 개의 서명이 필요하거나, 다른 주소의 utxo를 사용하는 경우일 수 있다.
                // 따라서 오류를 반환하지 않고 무시한다.
                // CHECK: 여러 개의 서명이 필요한 p2wsh, p2tr input인 경우 사용자의 서명이 필요한지 확인해야 한다.
              }
            }
          } else {
            // CHECK: 다중 서명이 필요한 경우에 대한 처리가 필요할까?
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
            validationError: new Error(
              "Invalid psbt: total input amount is less than total output amount"
            ),
          });
        } else {
          validatedPsbts.push({
            psbt,
            inputsToSign,
            feeAmount,
            validationError: undefined,
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
    nativeSegwitUTXOs,
    taprootUTXOs,
    psbtsHexes,
    feeConfig,
    networkConfig,
    legacyAddress,
    nativeSegwitAddress,
    taprootAddress,
  ]);

  useEffect(() => {
    if (utxosAvailable && psbtsHexes.length > 0) {
      setIsInitialized(false);
    }
  }, [utxosAvailable, psbtsHexes]);

  useEffect(() => {
    if (psbtsHexes.length === 0 || isInitialized) {
      return;
    }

    if (utxosAvailable) {
      validatePsbts();
    }
  }, [validatePsbts, isInitialized, psbtsHexes, utxosAvailable]);

  return {
    isInitialized,
    validatedPsbts,
    validationError,
    validatePsbts,
  };
};
