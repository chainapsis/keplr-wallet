import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { FormattedMessage, useIntl } from "react-intl";
import {
  useFeeConfig,
  useTxSizeConfig,
  useSenderConfig,
  useZeroAllowedFeeRateConfig,
  useAmountConfig,
  useTxConfigsValidate,
  IFeeConfig,
} from "@keplr-wallet/hooks-bitcoin";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { Body2, Body3, H5 } from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { ViewDataButton } from "../../../sign/components/view-data-button";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { FeeSummary } from "../../components/input/fee-summary";
import { Psbt } from "bitcoinjs-lib";
import { Dec } from "@keplr-wallet/unit";
import {
  useNativeSegwitUTXOs,
  useTaprootUTXOs,
} from "../../../../hooks/bitcoin/use-utxos";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import SimpleBar from "simplebar-react";
import { ArrowDropDownIcon } from "../../../../components/icon";

const usePsbtsValidate = (
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

          // 소유하고 있지 않은 input을 사용하는 psbt는 유효하지 않다.
          if (!availableUTXOs.has(utxo)) {
            validatedPsbts.push({
              psbt,
              feeAmount: new Dec(0),
              validationError: new Error(
                `${utxo} is not owned, inscription, brc20, runes, etc.`
              ),
            });
            continue;
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

export const SignBitcoinTxView: FunctionComponent<{
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const { signBitcoinTxInteractionStore, bitcoinQueriesStore } = useStore();

  const theme = useTheme();
  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signBitcoinTxInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const navigate = useNavigate();

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not bitcoin chain`);
  }

  // 비트코인 트랜잭션은 utxo 기반이라 서명 페이지에서 fee rate 또는 tx size를 조정하여
  // 수수료를 재계산하려면 utxo 조합을 새로 생성해야 하는 문제가 있다.
  // 따라서 usePsbtsValidate 훅을 사용하여 psbt를 파싱하여 전체 입력의 합에서 출력의 합을 빼서 수수료만 따로 계산한다.
  // 아래 config들은 feeConfig를 위해 선언되었을 뿐, 유의미하게 사용되지는 않는다.

  const senderConfig = useSenderConfig(
    chainStore,
    chainId,
    interactionData.data.address
  );

  const feeRateConfig = useZeroAllowedFeeRateConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    0
  );

  // disallow zero tx size to display fee error
  const txSizeConfig = useTxSizeConfig(chainStore, chainId, true);

  const amountConfig = useAmountConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    senderConfig
  );

  const feeConfig = useFeeConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    txSizeConfig,
    feeRateConfig
  );

  // 여러 주소 체계의 utxo를 조합하여 사용하는 경우가 있을 수 있으므로
  // sender address의 balance를 체크하지 않는다.
  // 중요한 오류는 usePsbtsValidate 훅에서 처리한다.
  feeConfig.setDisableBalanceCheck(true);

  const psbtsHexes = useMemo(() => {
    return "psbtHex" in interactionData.data
      ? [interactionData.data.psbtHex]
      : interactionData.data.psbtsHexes;
  }, [interactionData.data]);

  const { isInitialized, validatedPsbts, validationError } = usePsbtsValidate(
    chainId,
    psbtsHexes,
    feeConfig
  );

  const [isViewData, setIsViewData] = useState(false);

  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });

  // 이 페이지에서는 다른 config들이 사용되지 않으므로 feeConfig만 검증한다.
  const txConfigsValidate = useTxConfigsValidate({
    feeConfig,
  });

  const buttonDisabled =
    txConfigsValidate.interactionBlocked ||
    !isInitialized ||
    validatedPsbts.some((psbt) => psbt.validationError) ||
    !!validationError;
  const isLoading = signBitcoinTxInteractionStore.isObsoleteInteractionApproved(
    interactionData.id
  );

  const approve = async () => {
    try {
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("bitcoin")[0];
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      let psbtHex = "";
      let psbtsHexes: string[] = [];
      if ("psbtHex" in interactionData.data) {
        psbtHex = interactionData.data.psbtHex;
      } else if ("psbtsHexes" in interactionData.data) {
        psbtsHexes = interactionData.data.psbtsHexes;
      } else {
        throw new Error("Invalid interaction data");
      }

      await signBitcoinTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        psbtHex,
        "", // ledger로 서명된 signedPsbtHex가 들어감
        psbtsHexes,
        [], // ledger로 서명된 signedPsbtHexes가 들어감
        async (proceedNext) => {
          if (!proceedNext) {
            if (
              interactionInfo.interaction &&
              !interactionInfo.interactionInternal
            ) {
              handleExternalInteractionWithNoProceedNext();
            }
          }

          if (
            interactionInfo.interaction &&
            interactionInfo.interactionInternal
          ) {
            // XXX: 약간 난해한 부분인데
            //      내부의 tx의 경우에는 tx 이후의 routing을 요청한 쪽에서 처리한다.
            //      하지만 tx를 처리할때 tx broadcast 등의 과정이 있고
            //      서명 페이지에서는 이러한 과정이 끝났는지 아닌지를 파악하기 힘들다.
            //      만약에 밑과같은 처리를 하지 않으면 interaction data가 먼저 지워지면서
            //      화면이 깜빡거리는 문제가 발생한다.
            //      이 문제를 해결하기 위해서 내부의 tx는 보내는 쪽에서 routing을 잘 처리한다고 가정하고
            //      페이지를 벗어나고 나서야 data를 지우도록한다.
            await unmountPromise.promise;
          }
        },
        {
          // XXX: 단지 special button의 애니메이션을 보여주기 위해서 delay를 넣음...ㅋ;
          preDelay: 200,
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.sign.cosmos.tx.title" })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
      bottomButtons={[
        {
          textOverrideIcon: (
            <CancelIcon
              color={
                theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["gray-200"]
              }
            />
          ),
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            await signBitcoinTxInteractionStore.rejectWithProceedNext(
              interactionData.id,
              (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    handleExternalInteractionWithNoProceedNext();
                  } else if (
                    interactionInfo.interaction &&
                    interactionInfo.interactionInternal
                  ) {
                    window.history.length > 1 ? navigate(-1) : navigate("/");
                  } else {
                    navigate("/", { replace: true });
                  }
                }
              }
            );
          },
        },
        {
          isSpecial: true,
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          left: !isLoading && <ApproveIcon />,
          disabled: buttonDisabled,
          isLoading,
          onClick: approve,
        },
      ]}
    >
      <Box
        height="100%"
        padding="0.75rem 0.75rem 0"
        style={{
          overflow: "auto",
        }}
      >
        <Box marginBottom="0.5rem" alignX="center" alignY="center">
          <Box
            padding="0.375rem 0.625rem 0.375rem 0.75rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"]
            }
            borderRadius="20rem"
          >
            <XAxis alignY="center">
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage
                  id="page.sign.ethereum.requested-network"
                  values={{
                    network: modularChainInfo.chainName,
                  }}
                />
              </Body3>
              <Gutter direction="horizontal" size="0.5rem" />
              <ChainImageFallback
                size="1.25rem"
                chainInfo={modularChainInfo}
                alt={modularChainInfo.chainName}
              />
            </XAxis>
          </Box>
        </Box>
        <Gutter size="0.75rem" />
        <Box marginBottom="0.5rem">
          <Columns sum={1} alignY="center">
            <XAxis>
              <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                <FormattedMessage
                  id={"page.sign.ethereum.transaction.summary"}
                />
              </H5>
            </XAxis>
            <Column weight={1} />

            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </Columns>
        </Box>
        {validatedPsbts.length > 1 ? (
          <PsbtsView isViewData={isViewData} validatedPsbts={validatedPsbts} />
        ) : (
          <SinglePsbtView
            isViewData={isViewData}
            psbt={validatedPsbts?.[0]?.psbt}
            validationError={validatedPsbts?.[0]?.validationError}
          />
        )}
        <div style={{ marginTop: "0.75rem", flex: 1 }} />
        <FeeSummary feeConfig={feeConfig} isInitialized={isInitialized} />
      </Box>
    </HeaderLayout>
  );
});

const SinglePsbtView: FunctionComponent<{
  isViewData: boolean;
  psbt?: Psbt;
  validationError?: Error | undefined;
}> = observer(
  ({
    psbt,
    isViewData,
    // validationError,
  }) => {
    const theme = useTheme();

    const signingDataText = useMemo(() => {
      if (!psbt) {
        return "";
      }

      // PSBT 정보를 사용자 친화적인 형태로 파싱
      const version = psbt.version;
      const locktime = psbt.locktime;
      const inputs = psbt.txInputs.map((input, index) => {
        const txid = input.hash.reverse().toString("hex");
        return {
          index,
          txid,
          vout: input.index,
          sequence: input.sequence,
        };
      });

      const outputs = psbt.txOutputs.map((output, index) => {
        return {
          index,
          address: output.address || "unknown address",
          value: output.value,
        };
      });

      const readableData = {
        version,
        locktime,
        inputs,
        outputs,
      };

      return JSON.stringify(readableData, null, 2);
    }, [psbt]);

    return (
      <SimpleBar
        autoHide={false}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: !isViewData ? "0 1 auto" : 1,
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: "0.375rem",
          backgroundColor:
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"],
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : "none",
        }}
      >
        <Box>
          {isViewData ? (
            <Box
              as={"pre"}
              padding="1rem"
              // Remove normalized style of pre tag
              margin="0"
              style={{
                width: "fit-content",
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"],
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {signingDataText}
            </Box>
          ) : (
            <Box padding="1rem">
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-100"]
                }
              >
                {psbt?.toHex()}
                {/* {(() => {
                  const { icon, title, content } = defaultRegistry.render(
                    interactionData.data.chainId,
                    JSON.parse(
                      Buffer.from(interactionData.data.message).toString()
                    ) as UnsignedTransaction
                  );

                  if (icon !== undefined && title !== undefined) {
                    return (
                      <EthTxBase icon={icon} title={title} content={content} />
                    );
                  }
                })()} */}
              </Body2>
            </Box>
          )}
        </Box>
      </SimpleBar>
    );
  }
);

const PsbtsView: FunctionComponent<{
  validatedPsbts: {
    psbt: Psbt;
    feeAmount: Dec;
    validationError: Error | undefined;
  }[];
  isViewData: boolean;
}> = observer(({ validatedPsbts, isViewData }) => {
  const theme = useTheme();

  const [openedItemIndex, setOpenedItemIndex] = useState<number | null>(null);
  const toggleOpen = (index: number) =>
    index === openedItemIndex
      ? setOpenedItemIndex(null)
      : setOpenedItemIndex(index);

  const signingDataText = useMemo(() => {
    const psbts = validatedPsbts.map(({ psbt }) => {
      const version = psbt.version;
      const locktime = psbt.locktime;
      const inputs = psbt.txInputs.map((input, index) => {
        const txid = input.hash.reverse().toString("hex");
        return {
          index,
          txid,
          vout: input.index,
          sequence: input.sequence,
        };
      });

      const outputs = psbt.txOutputs.map((output, index) => {
        return {
          index,
          address: output.address || "unknown address",
          value: output.value,
        };
      });

      return {
        version,
        locktime,
        inputs,
        outputs,
      };
    });

    return JSON.stringify(psbts, null, 2);
  }, [validatedPsbts]);

  const viewData = (
    <Box
      as={"pre"}
      padding="1rem"
      // Remove normalized style of pre tag
      margin="0"
      style={{
        width: "fit-content",
        color:
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-200"],
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {signingDataText}
    </Box>
  );

  const viewPsbts = validatedPsbts.map(
    (
      {
        psbt,
        // validationError
      },
      i
    ) => {
      const isOpen = openedItemIndex === i;
      return (
        <Box
          key={i}
          padding="1rem 0 0"
          marginBottom={i !== validatedPsbts.length - 1 ? "0.5rem" : undefined}
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          borderRadius="0.375rem"
          cursor="pointer"
          height="100%"
          onClick={() => toggleOpen(i)}
        >
          <Box padding="0 1rem 1rem">
            <Columns sum={1} alignY="center">
              <Column weight={1}>
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-10"]
                  }
                >
                  PSBT
                </H5>
              </Column>
              <Column weight={0}>
                <ArrowDropDownIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-300"]}
                />
              </Column>
            </Columns>
          </Box>

          <SimpleBar
            autoHide={false}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "0 1 auto",
              overflowY: "auto",
              overflowX: "hidden",

              padding: "0 1rem",

              minWidth: "100%",

              height: "fit-content",
              minHeight: isOpen ? "3.125rem" : undefined,
              maxHeight: "12.5rem",
            }}
          >
            {isOpen ? (
              <Box
                as="pre"
                style={{
                  margin: "0 0 0.5rem",
                  width: "fit-content",
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-400"]
                      : ColorPalette["gray-200"],

                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {/* TODO: 데이터 표시 방식 변경 */}
                {isOpen ? psbt.toHex() : ""}
              </Box>
            ) : null}
          </SimpleBar>
        </Box>
      );
    }
  );

  return (
    <SimpleBar
      autoHide={false}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: !isViewData ? "0 1 auto" : 1,
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: isViewData ? "0.375rem" : undefined,
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      {isViewData ? viewData : viewPsbts}
    </SimpleBar>
  );
});
