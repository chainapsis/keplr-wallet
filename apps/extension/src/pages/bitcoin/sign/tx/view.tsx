import React, { FunctionComponent, useMemo, useState } from "react";
import { SignBitcoinTxInteractionStore } from "@keplr-wallet/stores-core";
import {
  handleExternalInteractionWithNoProceedNext,
  isRunningInSidePanel,
} from "../../../../utils";
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
  usePsbtSimulator,
  useAvailableBalanceConfig,
  UnableToFindProperUtxosError,
} from "@keplr-wallet/hooks-bitcoin";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import {
  BaseTypography,
  Body1,
  Body2,
  Body3,
  H5,
  Subtitle3,
  Subtitle4,
} from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { XAxis, YAxis } from "../../../../components/axis";
import { ViewDataButton } from "../../../sign/components/view-data-button";
import { useNavigate } from "react-router";
import {
  ApproveIcon,
  CancelIcon,
  LeftArrowIcon,
  RightArrowIcon,
} from "../../../../components/button";
import { FeeSummary } from "../../components/input/fee-summary";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import SimpleBar from "simplebar-react";
import {
  ValidatedPsbt,
  usePsbtsValidate,
} from "../../../../hooks/bitcoin/use-psbt-validate";
import { useBitcoinNetworkConfig } from "../../../../hooks/bitcoin/use-bitcoin-network-config";
import { EthTxBase } from "../../../sign/components/eth-tx/render/tx-base";
import { ItemLogo } from "../../../main/token-detail/msg-items/logo";
import { Stack } from "../../../../components/stack";
import { ArbitraryMsgSignHeader } from "../../../sign/components/arbitrary-message/arbitrary-message-header";
import { ArbitraryMsgRequestOrigin } from "../../../sign/components/arbitrary-message/arbitrary-message-origin";
import { ArbitraryMsgWalletDetails } from "../../../sign/components/arbitrary-message/arbitrary-message-wallet-details";
import { AppCurrency, ModularChainInfo } from "@keplr-wallet/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { toXOnly } from "@keplr-wallet/crypto";
import { useGetUTXOs } from "../../../../hooks/bitcoin/use-get-utxos";
import {
  IPsbtInput,
  IPsbtOutput,
  RemainderStatus,
} from "@keplr-wallet/stores-bitcoin";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { InformationPlainIcon } from "../../../../components/icon";
import { Tooltip } from "../../../../components/tooltip";
import { BitcoinGuideBox } from "../../components/guide-box";
import { HeaderProps } from "../../../../layouts/header/types";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../../sign/utils/ledger-types";
import { LedgerGuideBox } from "../../../sign/components/ledger-guide-box";
import { connectAndSignPsbtsWithLedger } from "../../../sign/utils/handle-bitcoin-sign";

export const SignBitcoinTxView: FunctionComponent<{
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signBitcoinTxInteractionStore,
    bitcoinQueriesStore,
    bitcoinAccountStore,
    uiConfigStore,
  } = useStore();

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

  const availableBalanceConfig = useAvailableBalanceConfig(chainStore, chainId);

  const amountConfig = useAmountConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    senderConfig,
    availableBalanceConfig
  );

  const feeConfig = useFeeConfig(
    chainStore,
    bitcoinQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    txSizeConfig,
    feeRateConfig,
    availableBalanceConfig
  );

  // 외부에서 Bitcoin send 요청이 들어온 경우
  const hasPsbtCandidate = "psbtCandidate" in interactionData.data;

  const { currentPaymentType } = useBitcoinNetworkConfig(chainId);

  const bitcoinAccount = bitcoinAccountStore.getAccount(chainId);

  // simulate 함수 안에서 불러오지 않고 커스텀 훅으로 대체해서
  // 페이지가 렌더링될 때 한 번만 호출해도 충분할 것으로 예상된다.
  const {
    availableUTXOs,
    isFetching: isFetchingUTXOs,
    error: utxoError,
  } = useGetUTXOs(
    chainId,
    senderConfig.sender,
    hasPsbtCandidate && currentPaymentType === "taproot",
    hasPsbtCandidate
  );

  // bitcoin tx size는 amount, fee rate, recipient address type에 따라 달라진다.
  // 또한 별도의 simulator refresh 로직이 없기 때문에 availableUTXOs의 값이 변경되면
  // 새로운 key를 생성해서 새로운 simulator를 생성하도록 한다.
  const psbtSimulatorKey = useMemo(() => {
    if ("psbtCandidate" in interactionData.data) {
      const recipientPrefix =
        interactionData.data.psbtCandidate.toAddress.slice(0, 4);
      const amountHex = interactionData.data.psbtCandidate.amount.toString(16);
      return (
        recipientPrefix +
        amountHex +
        feeRateConfig.feeRate.toString() +
        availableUTXOs.length.toString()
      );
    }

    return "";
  }, [interactionData.data, feeRateConfig.feeRate, availableUTXOs]);

  const psbtSimulator = usePsbtSimulator(
    new ExtensionKVStore("psbt-simulator.bitcoin.send"),
    chainStore,
    chainId,
    txSizeConfig,
    feeConfig,
    psbtSimulatorKey,
    () => {
      if (!("psbtCandidate" in interactionData.data)) {
        throw new Error("Not ready to simulate psbt");
      }

      const simulate = async (): Promise<{
        psbtHex: string;
        txSize: {
          txVBytes: number;
          txBytes: number;
          txWeight: number;
        };
        remainderValue: string;
        remainderStatus: RemainderStatus;
      }> => {
        if (!("psbtCandidate" in interactionData.data)) {
          throw new Error("Not ready to simulate psbt");
        }

        // refresh는 필요없다. -> 블록 생성 시간이 10분
        const senderAddress = interactionData.data.address;
        const publicKey = interactionData.data.pubKey;

        const xonlyPubKey = publicKey
          ? toXOnly(Buffer.from(publicKey))
          : undefined;
        const feeRate = feeRateConfig.feeRate;
        const isSendMax = amountConfig.fraction === 1;

        const MAX_SAFE_OUTPUT = new Dec(2 ** 53 - 1);
        const amountInSatoshi = new Dec(
          interactionData.data.psbtCandidate.amount
        );
        const recipientsForTransaction: IPsbtOutput[] = [];

        if (amountInSatoshi.gt(MAX_SAFE_OUTPUT)) {
          // 큰 금액을 여러 출력으로 분할
          let remainingValue = amountInSatoshi;
          while (!remainingValue.lte(new Dec(0))) {
            const chunkValue = remainingValue.gt(MAX_SAFE_OUTPUT)
              ? MAX_SAFE_OUTPUT
              : remainingValue;
            recipientsForTransaction.push({
              address: interactionData.data.psbtCandidate.toAddress,
              value: chunkValue.truncate().toBigNumber().toJSNumber(),
            });
            remainingValue = remainingValue.sub(chunkValue);
          }
        } else {
          recipientsForTransaction.push({
            address: interactionData.data.psbtCandidate.toAddress,
            value: amountInSatoshi.truncate().toBigNumber().toJSNumber(),
          });
        }

        const selection = bitcoinAccount.selectUTXOs({
          senderAddress,
          utxos: availableUTXOs,
          recipients: recipientsForTransaction,
          feeRate,
          isSendMax,
        });

        if (!selection) {
          throw new UnableToFindProperUtxosError(
            "Can't find proper utxos selection"
          );
        }

        const { selectedUtxos, txSize, remainderStatus, remainderValue } =
          selection;

        const inputs: IPsbtInput[] = selectedUtxos.map((utxo) => ({
          txid: utxo.txid,
          vout: utxo.vout,
          value: utxo.value,
          address: senderAddress,
          tapInternalKey: xonlyPubKey,
        }));

        const psbtHex = bitcoinAccount.buildPsbt({
          inputs,
          changeAddress: senderAddress,
          outputs: recipientsForTransaction,
          feeRate,
          isSendMax,
          hasChange: remainderStatus === "used_as_change",
        });

        return {
          psbtHex,
          txSize,
          remainderStatus,
          remainderValue,
        };
      };

      return simulate;
    }
  );

  // sendBitcoin 요청이 들어오는 경우를 제외하고는 balance를 체크하지 않는다.
  // (여러 주소 체계의 utxo를 조합하여 사용하는 경우가 있을 수 있으므로)
  // 중요한 오류는 usePsbtsValidate 훅에서 처리한다.
  feeConfig.setDisableBalanceCheck(hasPsbtCandidate);

  const { isInitialized, validatedPsbts, criticalValidationError } =
    usePsbtsValidate(interactionData, feeConfig, psbtSimulator.psbtHex);

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

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isTestnet = modularChainInfo.bitcoin.bip44.coinType === 1;

  // 이 페이지에서는 다른 config들이 사용되지 않으므로 feeConfig만 검증한다.
  const txConfigsValidate = useTxConfigsValidate({
    feeConfig,
  });

  const hasUnableToSignPsbt = validatedPsbts.some(
    (data) => data.inputsToSign.length === 0
  );
  const isUnableToGetUTXOs =
    hasPsbtCandidate && !isFetchingUTXOs && !!utxoError;

  const buttonDisabled =
    txConfigsValidate.interactionBlocked ||
    !isInitialized ||
    !!criticalValidationError ||
    hasUnableToSignPsbt ||
    isUnableToGetUTXOs;
  const isLoading =
    signBitcoinTxInteractionStore.isObsoleteInteractionApproved(
      interactionData.id
    ) || isLedgerInteracting;
  const isExternal =
    interactionInfo.interaction && !interactionInfo.interactionInternal;

  const signerInfo = {
    name:
      typeof interactionData.data.keyInsensitive["keyRingName"] === "string"
        ? interactionData.data.keyInsensitive["keyRingName"]
        : "",
    address: interactionData.data.address,
  };

  const approve = async () => {
    try {
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("bitcoin")[0];
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      if (validatedPsbts.length === 0) {
        return;
      }

      const psbtSignData: {
        psbtHex: string;
        inputsToSign: {
          index: number;
          address: string;
          hdPath?: string;
          tapLeafHashesToSign?: Buffer[];
        }[];
      }[] = [];

      for (const validated of validatedPsbts) {
        psbtSignData.push({
          psbtHex: validated.psbt.toHex(),
          inputsToSign: validated.inputsToSign,
        });
      }

      let signedPsbtsHexes: string[] | undefined;
      if (interactionData.data.keyType === "ledger") {
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);

        signedPsbtsHexes = await connectAndSignPsbtsWithLedger(
          interactionData,
          psbtSignData,
          modularChainInfo,
          { useWebHID: uiConfigStore.useWebHIDLedger }
        );
      }

      await signBitcoinTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        psbtSignData,
        signedPsbtsHexes ?? [],
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

      if (e instanceof KeplrError) {
        if (e.module === ErrModuleLedgerSign) {
          setLedgerInteractingError(e);
        } else {
          setLedgerInteractingError(undefined);
        }
      } else {
        setLedgerInteractingError(undefined);
      }
    } finally {
      setIsLedgerInteracting(false);
    }
  };

  const reject = async () => {
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
  };

  const [currentPsbtIndex, setCurrentPsbtIndex] = useState(0);

  const getBottomButtons = (): HeaderProps["bottomButtons"] => {
    if (validatedPsbts.length <= 1) {
      return [
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
          onClick: reject,
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
      ];
    }

    const buttons: HeaderProps["bottomButtons"] = [];

    // Add back/cancel button
    if (currentPsbtIndex === 0) {
      buttons.push({
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
        onClick: reject,
      });
    } else {
      buttons.push({
        textOverrideIcon: (
          <LeftArrowIcon
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
        onClick: () => {
          setCurrentPsbtIndex(currentPsbtIndex - 1);
        },
      });
    }

    // Add next/approve button
    // 첫번째 psbt는 review 버튼
    // 그 다음부터 next 버튼
    // 마지막 psbt는 approve 버튼
    if (currentPsbtIndex < validatedPsbts.length - 1) {
      buttons.push({
        text: `${intl.formatMessage({
          id: currentPsbtIndex === 0 ? "button.review" : "button.next",
        })} (${currentPsbtIndex + 1}/${validatedPsbts.length})`,
        right: (
          <RightArrowIcon
            color={
              theme.mode === "light"
                ? ColorPalette["blue-400"]
                : ColorPalette["gray-200"]
            }
          />
        ),
        size: "large",
        color: "secondary",
        onClick: () => {
          setCurrentPsbtIndex(currentPsbtIndex + 1);
        },
      });
    } else {
      buttons.push({
        isSpecial: true,
        text: `${intl.formatMessage({
          id: "button.approve",
        })} (${currentPsbtIndex + 1}/${validatedPsbts.length})`,
        size: "large",
        right: !isLoading && <ApproveIcon />,
        disabled: buttonDisabled,
        isLoading,
        onClick: approve,
      });
    }

    return buttons;
  };

  const ledgerGuideBox = (
    <LedgerGuideBox
      data={{
        keyInsensitive: interactionData.data.keyInsensitive,
        isBitcoin: !isTestnet,
        isBitcoinTest: isTestnet,
      }}
      isLedgerInteracting={isLedgerInteracting}
      ledgerInteractingError={ledgerInteractingError}
      isInternal={interactionData.isInternal}
    />
  );

  return (
    <HeaderLayout
      title={
        isExternal
          ? ""
          : intl.formatMessage({
              id: "page.sign.cosmos.tx.title",
            })
      }
      headerContainerStyle={{
        height: isExternal ? "0" : undefined,
      }}
      contentContainerStyle={{
        paddingTop: isExternal ? "1.75rem" : undefined,
      }}
      fixedHeight={true}
      left={<BackButton hidden={isExternal} />}
      // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
      bottomButtons={getBottomButtons()}
    >
      {isExternal ? (
        validatedPsbts.length > 1 ? (
          // Show current PSBT based on index
          <PsbtDetailsView
            isUnableToGetUTXOs={isUnableToGetUTXOs}
            signerInfo={signerInfo}
            chainId={chainId}
            origin={interactionData.data.origin}
            validatedPsbt={validatedPsbts[currentPsbtIndex]}
            totalPsbts={validatedPsbts.length}
            currentPsbtIndex={currentPsbtIndex}
            ledgerGuideBox={ledgerGuideBox}
            criticalValidationError={criticalValidationError}
          />
        ) : (
          <PsbtDetailsView
            isUnableToGetUTXOs={isUnableToGetUTXOs}
            signerInfo={signerInfo}
            chainId={chainId}
            origin={interactionData.data.origin}
            validatedPsbt={validatedPsbts?.[0]}
            ledgerGuideBox={ledgerGuideBox}
            criticalValidationError={criticalValidationError}
          />
        )
      ) : (
        <InternalSendBitcoinTxReview
          isUnableToGetUTXOs={isUnableToGetUTXOs}
          validatedPsbt={validatedPsbts?.[0]}
          chainId={chainId}
          feeSummary={
            <FeeSummary feeConfig={feeConfig} isInitialized={isInitialized} />
          }
          ledgerGuideBox={ledgerGuideBox}
        />
      )}
    </HeaderLayout>
  );
});

const InternalSendBitcoinTxReview: FunctionComponent<{
  validatedPsbt?: ValidatedPsbt;
  isUnableToGetUTXOs: boolean;
  chainId: string;
  feeSummary: React.ReactNode;
  ledgerGuideBox?: React.ReactNode;
}> = observer(
  ({
    validatedPsbt,
    chainId,
    feeSummary,
    isUnableToGetUTXOs,
    ledgerGuideBox,
  }) => {
    const theme = useTheme();
    const { chainStore } = useStore();
    const { sumInputValueByAddress, sumOutputValueByAddress, decodedRawData } =
      validatedPsbt ?? {};

    const [isViewData, setIsViewData] = useState(false);

    const sender = sumInputValueByAddress?.[0].address;
    // 자기 자신한테 보내는 경우도 있으므로, 이 경우 받는 주소와 잔돈 주소가 자신의 주소와 같을 수 있음.
    const recipientOutput =
      sumOutputValueByAddress?.length && sumOutputValueByAddress.length > 1
        ? sumOutputValueByAddress?.find((output) => output.address !== sender)
        : sumOutputValueByAddress?.[0];
    const recipient = recipientOutput?.address;
    const modularChainInfo = chainStore.getModularChain(chainId);
    const currency = chainStore
      .getModularChainInfoImpl(chainId)
      .getCurrencies("bitcoin")[0];
    const sendToken = new CoinPretty(
      currency,
      recipientOutput?.value ?? new Dec(0)
    );

    const signingDataText = useMemo(() => {
      if (!decodedRawData) {
        return "";
      }
      return JSON.stringify(decodedRawData, null, 2);
    }, [decodedRawData]);

    const isPartialSign = sumInputValueByAddress?.some(
      (input) => !input.isMine
    );
    const isUnableToSign = validatedPsbt?.inputsToSign.length === 0;

    return (
      <Box
        height="100%"
        padding="0.75rem 0.75rem 0"
        style={{
          overflow: "auto",
        }}
      >
        <NetworkInfoBadge chainInfo={modularChainInfo} />
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
                  <EthTxBase
                    icon={
                      <ItemLogo
                        center={
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.125 17.875L17.875 4.125M17.875 4.125L7.5625 4.125M17.875 4.125V14.4375"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        width="2.75rem"
                        height="2.75rem"
                      />
                    }
                    title={
                      <FormattedMessage id="page.sign.ethereum.transaction.send.title" />
                    }
                    content={
                      <React.Fragment>
                        <Box
                          padding="0.25rem 0.625rem"
                          backgroundColor={ColorPalette["gray-400"]}
                          borderRadius="20rem"
                          width="fit-content"
                        >
                          <Body2 color={ColorPalette["white"]}>
                            {sendToken?.trim(true).toString()}
                          </Body2>
                        </Box>

                        <Gutter size="0.75rem" />

                        <Columns sum={1} gutter="1.125rem" alignY="center">
                          <Stack alignX="center" gutter="0.375rem">
                            <Box
                              backgroundColor={ColorPalette["gray-300"]}
                              borderRadius="20rem"
                              width="0.5rem"
                              height="0.5rem"
                            />
                            <Box
                              backgroundColor={ColorPalette["gray-300"]}
                              width="1px"
                              height="3rem"
                            />
                            <Box
                              backgroundColor={ColorPalette["gray-300"]}
                              borderRadius="20rem"
                              width="0.5rem"
                              height="0.5rem"
                            />
                          </Stack>
                          <Stack gutter="1.625rem">
                            <Stack gutter="0.25rem">
                              <Subtitle4
                                color={
                                  theme.mode === "light"
                                    ? ColorPalette["gray-400"]
                                    : ColorPalette["gray-200"]
                                }
                              >
                                <FormattedMessage id="page.sign.ethereum.transaction.send.from" />
                              </Subtitle4>
                              <Body1
                                color={
                                  theme.mode === "light"
                                    ? ColorPalette["gray-500"]
                                    : ColorPalette["white"]
                                }
                              >{`${sender?.slice(0, 10)}...${sender?.slice(
                                -8
                              )}`}</Body1>
                            </Stack>
                            <Stack gutter="0.25rem">
                              <Subtitle4
                                color={
                                  theme.mode === "light"
                                    ? ColorPalette["gray-400"]
                                    : ColorPalette["gray-200"]
                                }
                              >
                                <FormattedMessage id="page.sign.ethereum.transaction.send.to" />
                              </Subtitle4>
                              <Body1
                                color={
                                  theme.mode === "light"
                                    ? ColorPalette["gray-500"]
                                    : ColorPalette["white"]
                                }
                              >{`${recipient?.slice(
                                0,
                                10
                              )}...${recipient?.slice(-8)}`}</Body1>
                            </Stack>
                          </Stack>
                        </Columns>
                      </React.Fragment>
                    }
                  />
                </Body2>
              </Box>
            )}
          </Box>
        </SimpleBar>
        <BitcoinGuideBox
          isPartialSign={isPartialSign}
          isUnableToGetUTXOs={isUnableToGetUTXOs}
          isUnableToSign={isUnableToSign}
        />
        <div style={{ marginTop: "0.75rem", flex: 1 }} />
        {feeSummary}
        {ledgerGuideBox}
      </Box>
    );
  }
);

const PsbtDetailsView: FunctionComponent<{
  chainId: string;
  signerInfo: {
    name: string;
    address: string;
  };
  origin: string;
  isUnableToGetUTXOs: boolean;
  validatedPsbt?: ValidatedPsbt;
  totalPsbts?: number;
  currentPsbtIndex?: number;
  ledgerGuideBox?: React.ReactNode;
  criticalValidationError?: Error;
}> = observer(
  ({
    validatedPsbt,
    chainId,
    signerInfo,
    origin,
    isUnableToGetUTXOs,
    totalPsbts,
    currentPsbtIndex,
    ledgerGuideBox,
    criticalValidationError,
  }) => {
    const theme = useTheme();
    const {
      sumInputValueByAddress,
      sumOutputValueByAddress,
      decodedRawData,
      fee,
    } = validatedPsbt ?? {};
    const { chainStore } = useStore();
    const [isViewData, setIsViewData] = useState(false);

    const signingDataText = useMemo(() => {
      if (!decodedRawData) {
        return "";
      }
      return JSON.stringify(decodedRawData, null, 2);
    }, [decodedRawData]);

    const modularChainInfo = chainStore.getModularChain(chainId);
    const currency = chainStore
      .getModularChainInfoImpl(chainId)
      .getCurrencies("bitcoin")[0];

    const { totalSpend, expectedFee } = useMemo(() => {
      if (!sumInputValueByAddress?.length) {
        return {
          totalSpend: new CoinPretty(currency, new Dec(0)),
          expectedFee: new CoinPretty(currency, new Dec(0)),
        };
      }

      let totalInputs = new Dec(0);
      let myInputs = new Dec(0);

      for (const input of sumInputValueByAddress) {
        totalInputs = totalInputs.add(input.value);
        if (input.isMine) {
          myInputs = myInputs.add(input.value);
        }
      }

      let totalOutputs = new Dec(0);
      let myOutputs = new Dec(0);
      if (sumOutputValueByAddress?.length) {
        for (const output of sumOutputValueByAddress) {
          totalOutputs = totalOutputs.add(output.value);
          if (output.isMine) {
            myOutputs = myOutputs.add(output.value);
          }
        }
      }

      const totalFee = fee ?? new Dec(0);

      return {
        totalSpend: new CoinPretty(currency, myInputs.sub(myOutputs)),
        expectedFee: new CoinPretty(currency, totalFee),
      };
    }, [sumInputValueByAddress, sumOutputValueByAddress, currency, fee]);

    const isPartialSign = sumInputValueByAddress?.some(
      (input) => !input.isMine
    );
    const isUnableToSign = validatedPsbt?.inputsToSign.length === 0;
    const hasGuideBox = isUnableToGetUTXOs || isPartialSign || isUnableToSign;
    const hasLedgerGuideBox =
      totalPsbts && currentPsbtIndex !== undefined
        ? currentPsbtIndex === totalPsbts - 1 && ledgerGuideBox
        : ledgerGuideBox;

    const isSidePanel = isRunningInSidePanel();

    return (
      <Box
        height="100%"
        padding="0 0.75rem"
        style={{
          overflow: "auto",
        }}
      >
        <ArbitraryMsgSignHeader />
        <Gutter size="0.75rem" />
        <ArbitraryMsgRequestOrigin origin={origin} />
        <Gutter size="0.75rem" />
        <BitcoinGuideBox
          isPartialSign={isPartialSign}
          isUnableToGetUTXOs={isUnableToGetUTXOs}
          isUnableToSign={isUnableToSign}
          criticalValidationError={criticalValidationError}
        />
        {ledgerGuideBox}
        {(hasGuideBox || hasLedgerGuideBox) && <Gutter size="0.75rem" />}
        {totalPsbts && totalPsbts > 1 && currentPsbtIndex !== undefined && (
          <React.Fragment>
            <Box padding="0.25rem" alignX="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage
                  id="page.sign.bitcoin.transaction.review-progress"
                  values={{
                    index: currentPsbtIndex + 1,
                    total: totalPsbts,
                  }}
                />
              </Subtitle3>
            </Box>
            <Gutter size="0.75rem" />
          </React.Fragment>
        )}
        <ContentWrapper isSidePanel={isSidePanel}>
          <ArbitraryMsgWalletDetails
            walletName={signerInfo.name}
            chainInfo={modularChainInfo}
            addressInfo={{
              type: "bitcoin",
              address: signerInfo.address,
            }}
            hideSigningLabel={true}
            hideAddress={true}
          />
          <Gutter size="0.75rem" />
          <Box marginBottom="0.5625rem" paddingX="0.5rem">
            <Columns sum={1} alignY="center">
              <XAxis>
                {isViewData ? (
                  <H5
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-500"]
                          : ColorPalette["gray-50"],
                    }}
                  >
                    <FormattedMessage id="page.sign.bitcoin.transaction.data" />
                  </H5>
                ) : (
                  <AddressesWithValuesLabel
                    length={sumInputValueByAddress?.length ?? 0}
                    isInput={true}
                    currency={currency}
                  />
                )}
              </XAxis>
              <Column weight={1} />
              <ViewDataButton
                isViewData={isViewData}
                setIsViewData={setIsViewData}
              />
            </Columns>
          </Box>
          {isViewData ? (
            <SimpleBar
              autoHide={false}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "0 1 auto",
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
            </SimpleBar>
          ) : (
            <React.Fragment>
              <AddressesWithValues
                sumValueByAddress={sumInputValueByAddress ?? []}
                isInput={true}
                currency={currency}
              />
              <Gutter size="0.75rem" />
              <Box marginBottom="0.5625rem" paddingX="0.5rem">
                <AddressesWithValuesLabel
                  length={sumOutputValueByAddress?.length ?? 0}
                  isInput={false}
                  currency={currency}
                />
              </Box>
              <AddressesWithValues
                sumValueByAddress={sumOutputValueByAddress ?? []}
                isInput={false}
                currency={currency}
              />
            </React.Fragment>
          )}
        </ContentWrapper>
        <Gutter size="0.75rem" />
        <ExpectedFee expectedFee={expectedFee} />
        <div style={{ flex: 1, minHeight: "1.25rem" }} />
        <TotalSpend totalSpend={totalSpend} />
        <Gutter size="0.25rem" />
      </Box>
    );
  }
);

const ContentWrapper: FunctionComponent<{
  children: React.ReactNode;
  isSidePanel: boolean;
}> = ({ children, isSidePanel }) => {
  if (isSidePanel) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  // classic 모드일 때는 높이가 낮은데 화면에 요소들이 너무 많아서
  // 도메인 정보, 예상 수수료, 총 지출 정보만 고정해두고 나머지는 스크롤이 적용되도록 함
  return (
    <SimpleBar
      autoHide={true}
      style={{
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {children}
    </SimpleBar>
  );
};

const NetworkInfoBadge: FunctionComponent<{
  chainInfo: ModularChainInfo;
}> = observer(({ chainInfo }) => {
  const theme = useTheme();

  return (
    <Box marginY="0.25rem" alignX="center" alignY="center">
      <Box
        padding="0.375rem 0.625rem 0.375rem 0.75rem"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
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
                network: chainInfo.chainName,
              }}
            />
          </Body3>
          <Gutter direction="horizontal" size="0.5rem" />
          <ChainImageFallback
            size="1.25rem"
            chainInfo={chainInfo}
            alt={chainInfo.chainName}
          />
        </XAxis>
      </Box>
    </Box>
  );
});

const AddressesWithValuesLabel: FunctionComponent<{
  length: number;
  isInput?: boolean;
  currency: AppCurrency;
}> = observer(({ length, isInput, currency }) => {
  const theme = useTheme();
  return (
    <Columns sum={1} alignY="center">
      <H5
        style={{
          color:
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["blue-300"],
        }}
      >
        {length}
      </H5>
      <Gutter size="0.25rem" />
      <H5
        style={{
          color:
            theme.mode === "light"
              ? ColorPalette["gray-500"]
              : ColorPalette["gray-50"],
        }}
      >
        <FormattedMessage
          id={`page.sign.bitcoin.transaction.${isInput ? "input" : "output"}`}
        />
      </H5>
      <Gutter size="0.25rem" />
      {isInput && <UTXOWarningIcon currency={currency} />}
    </Columns>
  );
});

const AddressesWithValues: FunctionComponent<{
  sumValueByAddress: {
    address: string;
    value: Dec;
    isMine?: boolean;
  }[];
  isInput?: boolean;
  currency: AppCurrency;
}> = observer(({ sumValueByAddress, isInput, currency }) => {
  const theme = useTheme();

  return (
    <SimpleBar
      autoHide={false}
      style={{
        display: "flex",
        flexDirection: "column",
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
        minHeight: "fit-content",
        maxHeight: sumValueByAddress.length >= 4 ? "7.875rem" : undefined,
      }}
    >
      <Box
        padding="1rem"
        margin="0"
        style={{
          color:
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-200"],
          gap: "0.75rem",
        }}
      >
        {sumValueByAddress.map((data) => {
          const isUnsignable = isInput && !data.isMine;

          return (
            <Columns sum={1} alignY="center" key={data.address}>
              <Subtitle3
                style={{
                  color: isUnsignable
                    ? ColorPalette["gray-300"]
                    : theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["white"],
                }}
              >
                {Bech32Address.shortenAddress(data.address, 20)}
              </Subtitle3>
              <Column weight={1} />
              <Body2
                color={
                  isUnsignable
                    ? theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                    : theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                {new CoinPretty(currency, data.value)
                  .trim(true)
                  .maxDecimals(8)
                  .hideDenom(true)
                  .toString()}
              </Body2>
            </Columns>
          );
        })}
      </Box>
    </SimpleBar>
  );
});

const ExpectedFee: FunctionComponent<{
  expectedFee: CoinPretty;
}> = observer(({ expectedFee }) => {
  const theme = useTheme();
  return (
    <XAxis alignY="center">
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
        style={{ padding: "0 0.375rem" }}
      >
        <FormattedMessage id="page.sign.bitcoin.transaction.expected-network-fee" />
      </Subtitle3>
      <div style={{ flex: 1 }} />
      <Body2
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-50"]
        }
        style={{ padding: "0 0.375rem" }}
      >
        {expectedFee?.trim(true).toString()}
      </Body2>
    </XAxis>
  );
});

const TotalSpend: FunctionComponent<{
  totalSpend: CoinPretty;
}> = observer(({ totalSpend }) => {
  const theme = useTheme();
  return (
    <XAxis alignY="center">
      <div style={{ flex: 1 }} />
      <YAxis alignX="right">
        <Subtitle3 color={ColorPalette["gray-300"]}>
          <FormattedMessage id="page.sign.bitcoin.transaction.total-spend" />
        </Subtitle3>
        <Gutter size="0.5rem" />
        <BaseTypography
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["white"]
          }
          style={{ fontSize: "1.375rem", fontWeight: 500 }}
        >
          {totalSpend?.trim(true).toString()}
        </BaseTypography>
      </YAxis>
      <Gutter size="0.375rem" />
    </XAxis>
  );
});

const UTXOWarningIcon: FunctionComponent<{
  currency: AppCurrency;
}> = ({ currency }) => {
  const theme = useTheme();
  return (
    <Tooltip
      content={
        <FormattedMessage
          id="page.sign.bitcoin.transaction.utxo-warning"
          values={{
            coinDenom: currency.coinDenom,
          }}
        />
      }
      forceWidth="14.5rem"
      hideArrow={true}
      allowedPlacements={["bottom"]}
      floatingOffset={6}
    >
      <Box
        width="1rem"
        height="1rem"
        padding="0.0625rem"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InformationPlainIcon
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-200"]
          }
        />
      </Box>
    </Tooltip>
  );
};
