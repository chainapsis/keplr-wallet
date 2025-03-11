import { IFeeConfig } from "@keplr-wallet/hooks-bitcoin";
import { Dec } from "@keplr-wallet/unit";
import { Psbt } from "bitcoinjs-lib";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNativeSegwitUTXOs, useTaprootUTXOs } from "./use-utxos";

export const usePsbtsValidate = (
  chainId: string,
  psbtsHexes: string[],
  feeConfig: IFeeConfig
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [validatedPsbts, setValidatedPsbts] = useState<
    {
      psbt: Psbt;
      feeAmount: Dec;
      validationError: Error | undefined;
    }[]
  >([]);
  const [validationError, setValidationError] = useState<Error | undefined>(
    undefined
  );

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

    const availableUTXOs = new Map<string, number>();
    // `${txid}:${vout}`을 유니크한 키로 사용하고, 값은 utxo의 값을 저장한다.
    for (const utxo of nativeSegwitUTXOs) {
      availableUTXOs.set(`${utxo.txid}:${utxo.vout}`, utxo.value);
    }

    for (const utxo of taprootUTXOs) {
      availableUTXOs.set(`${utxo.txid}:${utxo.vout}`, utxo.value);
    }

    try {
      const psbts = psbtsHexes.map((psbtHex) => Psbt.fromHex(psbtHex));
      let totalInputAmount = new Dec(0);
      let totalOutputAmount = new Dec(0);
      const validatedPsbts: {
        psbt: Psbt;
        feeAmount: Dec;
        validationError: Error | undefined;
      }[] = [];

      for (const psbt of psbts) {
        const inputs = psbt.txInputs;

        let sumInputAmount = new Dec(0);
        let sumOutputAmount = new Dec(0);

        for (const input of inputs) {
          const utxo = `${input.hash.reverse().toString("hex")}:${input.index}`;

          // 소유하고 있지 않은 input을 사용하는 psbt는
          // 여러 개의 서명이 필요하거나, 다른 주소의 utxo를 사용하는 경우일 수 있다.
          // 따라서 오류를 반환하지 않고 무시한다.
          // CHECK: 여러 개의 서명이 필요한 p2wsh, p2tr input인 경우 사용자의 서명이 필요한지 확인해야 한다.
          if (!availableUTXOs.has(utxo)) {
            // validatedPsbts.push({
            //   psbt,
            //   feeAmount: new Dec(0),
            //   validationError: new Error(
            //     `${utxo} is not owned, inscription, brc20, runes, etc.`
            //   ),
            // });
            // continue;
          }

          sumInputAmount = sumInputAmount.add(
            new Dec(availableUTXOs.get(utxo) ?? 0)
          );
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
            feeAmount: new Dec(0),
            validationError: new Error(
              "Invalid psbt: total input amount is less than total output amount"
            ),
          });
        } else {
          validatedPsbts.push({
            psbt,
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
  }, [nativeSegwitUTXOs, taprootUTXOs, psbtsHexes, feeConfig]);

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
