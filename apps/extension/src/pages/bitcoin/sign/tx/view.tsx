import React, { FunctionComponent, useMemo, useState } from "react";
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
  usePsbtSimulator,
} from "@keplr-wallet/hooks-bitcoin";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import {
  Body1,
  Body2,
  Body3,
  H5,
  Subtitle4,
} from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { XAxis } from "../../../../components/axis";
import { ViewDataButton } from "../../../sign/components/view-data-button";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { FeeSummary } from "../../components/input/fee-summary";
import { Transaction } from "bitcoinjs-lib";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import SimpleBar from "simplebar-react";
import { ArrowDropDownIcon } from "../../../../components/icon";
import {
  ValidatedPsbt,
  usePsbtsValidate,
} from "../../../../hooks/bitcoin/use-psbt-validate";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useBitcoinNetworkConfig } from "../../../../hooks/bitcoin/use-bitcoin-network-config";
import { EthTxBase } from "../../../sign/components/eth-tx/render/tx-base";
import { ItemLogo } from "../../../main/token-detail/msg-items/logo";
import { Stack } from "../../../../components/stack";
import { ArbitraryMsgSignHeader } from "../../../sign/components/arbitrary-message/arbitrary-message-header";
import { ArbitraryMsgRequestOrigin } from "../../../sign/components/arbitrary-message/arbitrary-message-origin";
import { ArbitraryMsgWalletDetails } from "../../../sign/components/arbitrary-message/arbitrary-message-wallet-details";
import { ModularChainInfo } from "@keplr-wallet/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { toXOnly } from "@keplr-wallet/crypto";
import { useGetUTXOs } from "../../../../hooks/bitcoin/use-get-utxos";

export const SignBitcoinTxView: FunctionComponent<{
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signBitcoinTxInteractionStore,
    bitcoinQueriesStore,
    bitcoinAccountStore,
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

  // 외부에서 Bitcoin send 요청이 들어온 경우
  const hasPsbtCandidate = "psbtCandidate" in interactionData.data;

  const [_, _genesisHash, paymentType] = chainId.split(":");

  const bitcoinAccount = bitcoinAccountStore.getAccount(chainId);

  // simulate 함수 안에서 불러오지 않고 커스텀 훅으로 대체해서
  // 페이지가 렌더링될 때 한 번만 호출해도 충분할 것으로 예상된다.
  const { availableUTXOs } = useGetUTXOs(
    chainId,
    senderConfig.sender,
    hasPsbtCandidate && paymentType === "taproot",
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
        const ZERO = new Dec(0);
        const amountInSatoshi = new Dec(
          interactionData.data.psbtCandidate.amount
        );

        let recipientsForTransaction = [];
        if (amountInSatoshi.gt(MAX_SAFE_OUTPUT)) {
          // 큰 금액을 여러 출력으로 분할
          let remainingAmount = amountInSatoshi;
          while (!remainingAmount.gt(ZERO)) {
            const chunkAmount = remainingAmount.gt(MAX_SAFE_OUTPUT)
              ? MAX_SAFE_OUTPUT
              : remainingAmount;
            recipientsForTransaction.push({
              address: interactionData.data.psbtCandidate.toAddress,
              amount: chunkAmount.truncate().toBigNumber().toJSNumber(),
            });
            remainingAmount = remainingAmount.sub(chunkAmount);
          }
        } else {
          recipientsForTransaction = [
            {
              address: interactionData.data.psbtCandidate.toAddress,
              amount: amountInSatoshi.truncate().toBigNumber().toJSNumber(),
            },
          ];
        }

        const selection = bitcoinAccount.selectUTXOs({
          senderAddress,
          utxos: availableUTXOs,
          recipients: recipientsForTransaction,
          feeRate,
          isSendMax,
        });

        if (!selection) {
          throw new Error("Can't find proper utxos selection");
        }

        const { selectedUtxos, txSize, hasChange } = selection;

        const psbtHex = bitcoinAccount.buildPsbt({
          utxos: selectedUtxos,
          senderAddress,
          recipients: recipientsForTransaction,
          feeRate,
          xonlyPubKey,
          isSendMax,
          hasChange,
        });

        return {
          psbtHex,
          txSize,
        };
      };

      return simulate;
    }
  );

  // 여러 주소 체계의 utxo를 조합하여 사용하는 경우가 있을 수 있으므로
  // sender address의 balance를 체크하지 않는다.
  // 중요한 오류는 usePsbtsValidate 훅에서 처리한다.
  feeConfig.setDisableBalanceCheck(true);

  const psbtsHexes = useMemo(() => {
    return "psbtHex" in interactionData.data
      ? [interactionData.data.psbtHex]
      : "psbtsHexes" in interactionData.data
      ? interactionData.data.psbtsHexes
      : psbtSimulator.psbtHex != null
      ? [psbtSimulator.psbtHex]
      : [];
  }, [interactionData.data, psbtSimulator.psbtHex]);

  const { isInitialized, validatedPsbts, criticalValidationError } =
    usePsbtsValidate(
      psbtsHexes,
      feeConfig,
      chainId,
      interactionData.data.network
    );

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
    !!criticalValidationError;
  const isLoading = signBitcoinTxInteractionStore.isObsoleteInteractionApproved(
    interactionData.id
  );
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
          path?: string;
        }[];
      }[] = [];

      for (const psbt of validatedPsbts) {
        psbtSignData.push({
          psbtHex: psbt.psbt.toHex(),
          inputsToSign: psbt.inputsToSign,
        });
      }

      await signBitcoinTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        psbtSignData,
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
      title={
        isExternal
          ? ""
          : intl.formatMessage({
              id: "page.sign.cosmos.tx.title",
            })
      }
      fixedHeight={true}
      left={<BackButton hidden={isExternal} />}
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
        <SignBitcoinTxViewHeader
          isExternal={isExternal}
          modularChainInfo={modularChainInfo}
          signerInfo={signerInfo}
          hasMultiplePsbts={validatedPsbts.length > 1}
        />
        <Gutter size="0.75rem" />
        {isExternal ? (
          validatedPsbts.length > 1 ? (
            <PsbtsView chainId={chainId} validatedPsbts={validatedPsbts} />
          ) : (
            <SinglePsbtView
              chainId={chainId}
              validatedPsbt={validatedPsbts?.[0]}
            />
          )
        ) : (
          <InternalSendBitcoinTxReview
            validatedPsbt={validatedPsbts?.[0]}
            chainId={chainId}
          />
        )}
        {isExternal ? null : (
          <React.Fragment>
            <div style={{ marginTop: "0.75rem", flex: 1 }} />
            <FeeSummary feeConfig={feeConfig} isInitialized={isInitialized} />
          </React.Fragment>
        )}
      </Box>
    </HeaderLayout>
  );
});

const NetworkInfoBadge: FunctionComponent<{
  chainInfo: ModularChainInfo;
}> = observer(({ chainInfo }) => {
  const theme = useTheme();

  return (
    <Box marginBottom="0.5rem" alignX="center" alignY="center">
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
              id="page.sign.ethereum.requested-network" // TODO: 텍스트 관련 id를 비트코인용으로 변경 또는 추가 필요
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

const SignBitcoinTxViewHeader: FunctionComponent<{
  isExternal: boolean;
  modularChainInfo: ModularChainInfo;
  signerInfo: {
    name: string;
    address: string;
  };
  hasMultiplePsbts: boolean;
}> = observer(
  ({ isExternal, modularChainInfo, signerInfo, hasMultiplePsbts }) => {
    return isExternal ? (
      <React.Fragment>
        <ArbitraryMsgSignHeader />
        <Gutter size="0.75rem" />
        <ArbitraryMsgRequestOrigin origin={origin} />
        <Gutter size="0.75rem" />
        {hasMultiplePsbts ? (
          <NetworkInfoBadge chainInfo={modularChainInfo} />
        ) : (
          <ArbitraryMsgWalletDetails
            walletName={signerInfo.name}
            chainInfo={modularChainInfo}
            addressInfo={{
              type: "bitcoin",
              address: signerInfo.address,
            }}
          />
        )}
      </React.Fragment>
    ) : (
      <NetworkInfoBadge chainInfo={modularChainInfo} />
    );
  }
);

const InternalSendBitcoinTxReview: FunctionComponent<{
  validatedPsbt?: ValidatedPsbt;
  chainId: string;
}> = observer(({ validatedPsbt, chainId }) => {
  const theme = useTheme();
  const { chainStore } = useStore();
  const { psbt, sumInputValueByAddress, decodedRawData } = validatedPsbt ?? {};

  const [isViewData, setIsViewData] = useState(false);

  const sender = sumInputValueByAddress?.[0].address;
  const recipientOutput = psbt?.txOutputs.find(
    (output) => output.address !== sender
  );
  const recipient = recipientOutput?.address;
  const sendToken = new CoinPretty(
    chainStore.getModularChainInfoImpl(chainId).getCurrencies("bitcoin")[0],
    recipientOutput?.value ?? new Dec(0)
  );

  const signingDataText = useMemo(() => {
    if (!decodedRawData) {
      return "";
    }
    return JSON.stringify(decodedRawData, null, 2);
  }, [decodedRawData]);

  return (
    <React.Fragment>
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
              <FormattedMessage id={"page.sign.ethereum.transaction.summary"} />
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
                            >{`${recipient?.slice(0, 10)}...${recipient?.slice(
                              -8
                            )}`}</Body1>
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
    </React.Fragment>
  );
});

const SinglePsbtView: FunctionComponent<{
  chainId: string;
  validatedPsbt?: ValidatedPsbt;
}> = observer(({ validatedPsbt, chainId }) => {
  const theme = useTheme();
  const { networkConfig } = useBitcoinNetworkConfig(chainId);
  const { psbt, sumInputValueByAddress } = validatedPsbt ?? {};

  const [isViewData, setIsViewData] = useState(false);

  const signingDataText = useMemo(() => {
    if (!psbt) {
      return "";
    }

    const version = psbt.version;
    const locktime = psbt.locktime;
    const inputs = psbt.txInputs.map((input, index) => {
      const txid = input.hash.reverse().toString("hex");
      const rawInput = psbt.data.inputs[index];

      let script: any;
      let inputAddress: string;

      try {
        if (rawInput.witnessUtxo) {
          script = rawInput.witnessUtxo.script;
        } else if (rawInput.nonWitnessUtxo) {
          const tx = Transaction.fromBuffer(rawInput.nonWitnessUtxo);
          const output = tx.outs[input.index];
          script = output.script;
        }

        if (script) {
          inputAddress = fromOutputScript(script, networkConfig);
        } else {
          inputAddress = "unknown address";
        }
      } catch (e) {
        console.error(e);
        inputAddress = "unknown address";
      }

      return {
        index,
        txid,
        vout: input.index,
        address: inputAddress,
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
  }, [psbt, networkConfig]);

  return (
    <React.Fragment>
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
              {sumInputValueByAddress && sumInputValueByAddress.length > 1
                ? `${sumInputValueByAddress.length} Input(s)`
                : `${psbt?.txOutputs.length ?? 0} Output(s)`}
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
          ) : null}
        </Box>
      </SimpleBar>
    </React.Fragment>
  );
});

const PsbtsView: FunctionComponent<{
  chainId: string;
  validatedPsbts: ValidatedPsbt[];
}> = observer(({ validatedPsbts, chainId }) => {
  const theme = useTheme();
  const { networkConfig } = useBitcoinNetworkConfig(chainId);

  const [isViewData, setIsViewData] = useState(false);

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
        const rawInput = psbt.data.inputs[index];

        let script: any;
        let inputAddress: string;

        try {
          if (rawInput.witnessUtxo) {
            script = rawInput.witnessUtxo.script;
          } else if (rawInput.nonWitnessUtxo) {
            const tx = Transaction.fromBuffer(rawInput.nonWitnessUtxo);
            const output = tx.outs[input.index];
            script = output.script;
          }

          if (script) {
            inputAddress = fromOutputScript(script, networkConfig);
          } else {
            inputAddress = "unknown address";
          }
        } catch (e) {
          console.error(e);
          inputAddress = "unknown address";
        }

        return {
          index,
          txid,
          vout: input.index,
          address: inputAddress,
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
  }, [validatedPsbts, networkConfig]);

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
    <React.Fragment>
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
              <FormattedMessage id={"page.sign.ethereum.transaction.summary"} />
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
          borderRadius: isViewData ? "0.375rem" : undefined,
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : "none",
        }}
      >
        {isViewData ? viewData : viewPsbts}
      </SimpleBar>
    </React.Fragment>
  );
});
