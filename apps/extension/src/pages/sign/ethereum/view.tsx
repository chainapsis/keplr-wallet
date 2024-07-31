import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Body2, Body3, H5 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { useInteractionInfo } from "../../../hooks";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../utils/ledger-types";
import { Buffer } from "buffer/";
import { LedgerGuideBox } from "../components/ledger-guide-box";
import { EthSignType } from "@keplr-wallet/types";
import {
  handleEthereumPreSignByKeystone,
  handleEthereumPreSignByLedger,
} from "../utils/handle-eth-sign";
import { FormattedMessage, useIntl } from "react-intl";
import { ErrModuleKeystoneSign, KeystoneUR } from "../utils/keystone";
import { KeystoneSign } from "../components/keystone";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../components/view-data-button";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { defaultRegistry } from "../components/eth-tx/registry";
import { ChainImageFallback } from "../../../components/image";
import { Gutter } from "../../../components/gutter";
import { useUnmount } from "../../../hooks/use-unmount";
import { FeeSummary } from "../components/fee-summary";
import { FeeControl } from "../../../components/input/fee-control";
import {
  useAmountConfig,
  useFeeConfig,
  useGasSimulator,
  useSenderConfig,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { EthTxBase } from "../components/eth-tx/render/tx-base";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Image } from "../../../components/image";
import { Column, Columns } from "../../../components/column";

/**
 * CosmosTxView의 주석을 꼭 참고하셈
 * 이 View는 아직 실험적이고 임시로 구현한거임
 * evmos에서 ADR-036 view랑 똑같이 구현해놔서 그게 마음에 안들어서 2.0에서 잠시 뺐다가
 * 쓰는 사람들이 약간 있길래 최소한의 UI로 먼저 구현함
 */
export const EthereumSigningView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    uiConfigStore,
    signEthereumInteractionStore,
    accountStore,
    ethereumAccountStore,
    queriesStore,
  } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const interactionInfo = useInteractionInfo(() => {
    signEthereumInteractionStore.rejectAll();
  });

  const { message, signType, signer, chainId } = interactionData.data;

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);
  const chainInfo = chainStore.getChain(chainId);

  const senderConfig = useSenderConfig(chainStore, chainId, signer);
  const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig
  );
  const feeConfig = useFeeConfig(
    chainStore,
    queriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  const [signingDataBuff, setSigningDataBuff] = useState(Buffer.from(message));
  const isTxSigning = signType === EthSignType.TRANSACTION;

  const gasSimulator = useGasSimulator(
    new MemoryKVStore("gas-simulator.ethereum.sign"),
    chainStore,
    chainInfo.chainId,
    gasConfig,
    feeConfig,
    "evm/native",
    () => {
      if (!isTxSigning) {
        throw new Error(
          "Gas simulator is only working for transaction signing"
        );
      }

      if (chainInfo.evm == null) {
        throw new Error("Gas simulator is only working with EVM info");
      }

      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      return {
        simulate: () =>
          ethereumAccount.simulateGas(account.ethereumHexAddress, {
            to: unsignedTx.to,
            data: unsignedTx.data,
            value: unsignedTx.value,
          }),
      };
    }
  );

  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = (() => {
    if (isTxSigning) {
      const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } =
        feeConfig.getEIP1559TxFees(
          feeConfig.type === "manual"
            ? uiConfigStore.lastFeeOption || "average"
            : feeConfig.type
        );

      return maxFeePerGas && maxPriorityFeePerGas
        ? {
            maxFeePerGas: `0x${BigInt(
              maxFeePerGas.truncate().toString()
            ).toString(16)}`,
            maxPriorityFeePerGas: `0x${BigInt(
              maxPriorityFeePerGas.truncate().toString()
            ).toString(16)}`,
            gasPrice: undefined,
          }
        : {
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
            gasPrice: `0x${BigInt(
              gasPrice?.truncate().toString() ?? 0
            ).toString(16)}`,
          };
    }

    return {
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      gasPrice: undefined,
    };
  })();

  useEffect(() => {
    if (isTxSigning) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      const gasLimitFromTx = BigInt(unsignedTx.gasLimit ?? unsignedTx.gas ?? 0);
      if (gasLimitFromTx > 0) {
        gasConfig.setValue(gasLimitFromTx.toString());

        const gasPriceFromTx = BigInt(
          unsignedTx.maxFeePerGas ?? unsignedTx.gasPrice ?? 0
        );
        if (gasPriceFromTx > 0) {
          feeConfig.setFee(
            new CoinPretty(
              chainInfo.currencies[0],
              new Dec(gasConfig.gas).mul(new Dec(gasPriceFromTx))
            )
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTxSigning && !interactionData.isInternal) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      if (gasConfig.gas > 0) {
        unsignedTx.gasLimit = `0x${gasConfig.gas.toString(16)}`;

        if (!unsignedTx.maxFeePerGas) {
          unsignedTx.maxFeePerGas = `0x${new Int(
            feeConfig.getFeePrimitive()[0].amount
          )
            .div(new Int(gasConfig.gas))
            .toBigNumber()
            .toString(16)}`;
        }
      }

      if (!unsignedTx.maxPriorityFeePerGas && maxPriorityFeePerGas) {
        unsignedTx.maxPriorityFeePerGas =
          unsignedTx.maxPriorityFeePerGas ?? maxPriorityFeePerGas;
      }

      if (
        !unsignedTx.gasPrice &&
        !unsignedTx.maxFeePerGas &&
        !unsignedTx.maxPriorityFeePerGas &&
        gasPrice
      ) {
        unsignedTx.gasPrice = gasPrice;
      }

      setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), "utf8"));
    }
  }, [
    gasConfig.gas,
    isTxSigning,
    message,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    gasSimulator,
    gasConfig,
    feeConfig,
    interactionData.isInternal,
  ]);

  useEffect(() => {
    (async () => {
      if (isTxSigning && chainInfo.features.includes("op-stack-l1-data-fee")) {
        const { to, gasLimit, value, data, chainId }: UnsignedTransaction =
          JSON.parse(Buffer.from(message).toString("utf8"));

        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee({
          to,
          gasLimit,
          value,
          data,
          chainId,
        });
        feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [chainInfo.features, ethereumAccount, feeConfig, isTxSigning, message]);

  useEffect(() => {
    if (isTxSigning) {
      // Refresh EIP-1559 fee every 12 seconds.
      const intervalId = setInterval(() => {
        feeConfig.refreshEIP1559TxFees();
      }, 12000);

      return () => clearInterval(intervalId);
    }
  }, [isTxSigning, feeConfig]);

  const signingDataText = useMemo(() => {
    switch (signType) {
      case EthSignType.MESSAGE:
        // If the message is 32 bytes, it's probably a hash.
        if (signingDataBuff.length === 32) {
          return signingDataBuff.toString("hex");
        } else {
          const text = (() => {
            const string = signingDataBuff.toString("utf8");
            if (string.startsWith("0x")) {
              return Buffer.from(string.slice(2), "hex").toString("utf8");
            }

            return string;
          })();

          // If the text contains RTL mark, escape it.
          return text.replace(/\u202E/giu, "\\u202E");
        }
      case EthSignType.TRANSACTION:
        return JSON.stringify(
          JSON.parse(signingDataBuff.toString("utf8")),
          null,
          2
        );
      case EthSignType.EIP712:
        return JSON.stringify(JSON.parse(signingDataBuff.toString()), null, 2);
      default:
        return signingDataBuff.toString("hex");
    }
  }, [signingDataBuff, signType]);

  const [isViewData, setIsViewData] = useState(false);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const [isKeystoneInteracting, setIsKeystoneInteracting] = useState(false);
  const [keystoneUR, setKeystoneUR] = useState<KeystoneUR>();
  const keystoneScanResolve = useRef<(ur: KeystoneUR) => void>();
  const [keystoneInteractingError, setKeystoneInteractingError] = useState<
    Error | undefined
  >(undefined);

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

  const [isUnknownContractExecution, setIsUnknownContractExecution] =
    useState(false);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: `page.sign.ethereum.${signType}.title`,
      })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButton={{
        text: intl.formatMessage({ id: "button.approve" }),
        color: "primary",
        size: "large",
        isLoading:
          signEthereumInteractionStore.isObsoleteInteraction(
            interactionData.id
          ) || isLedgerInteracting,
        onClick: async () => {
          try {
            let signature;
            if (interactionData.data.keyType === "ledger") {
              setIsLedgerInteracting(true);
              setLedgerInteractingError(undefined);
              signature = await handleEthereumPreSignByLedger(
                interactionData,
                Buffer.from(signingDataText),
                {
                  useWebHID: uiConfigStore.useWebHIDLedger,
                }
              );
            } else if (interactionData.data.keyType === "keystone") {
              setIsKeystoneInteracting(true);
              signature = await handleEthereumPreSignByKeystone(
                interactionData,
                Buffer.from(signingDataText),
                {
                  displayQRCode: async (ur: KeystoneUR) => {
                    setKeystoneUR(ur);
                  },
                  scanQRCode: () =>
                    new Promise<KeystoneUR>((resolve) => {
                      keystoneScanResolve.current = resolve;
                    }),
                }
              );
            }

            await signEthereumInteractionStore.approveWithProceedNext(
              interactionData.id,
              Buffer.from(signingDataText),
              signature,
              async (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    window.close();
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
              }
            );
          } catch (e) {
            console.log(e);

            if (e instanceof KeplrError) {
              if (e.module === ErrModuleLedgerSign) {
                setLedgerInteractingError(e);
              } else if (e.module === ErrModuleKeystoneSign) {
                setKeystoneInteractingError(e);
              } else {
                setLedgerInteractingError(undefined);
                setKeystoneInteractingError(undefined);
              }
            } else {
              setLedgerInteractingError(undefined);
              setKeystoneInteractingError(undefined);
            }
          } finally {
            setIsLedgerInteracting(false);
          }
        },
      }}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        {isTxSigning ? (
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
        ) : (
          <Box
            padding="1rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette.white
                : ColorPalette["gray-600"]
            }
            borderRadius="0.375rem"
            style={{
              boxShadow:
                theme.mode === "light"
                  ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                  : "none",
            }}
          >
            <XAxis alignY="center">
              <Image
                alt="sign-custom-image"
                src={require("../../../public/assets/img/sign-adr36.png")}
                style={{ width: "3rem", height: "3rem" }}
              />
              <Gutter size="0.75rem" />
              <YAxis>
                <H5
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-10"]
                  }
                >
                  <FormattedMessage id="Prove account ownership to" />
                </H5>
                <Gutter size="2px" />
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {interactionData?.data.origin || ""}
                </Body3>
              </YAxis>
            </XAxis>
          </Box>
        )}

        <Gutter size="0.75rem" />

        {isTxSigning && (
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
        )}
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
          {isTxSigning && !isUnknownContractExecution ? (
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
                    {(() => {
                      const { icon, title, content } = defaultRegistry.render(
                        interactionData.data.chainId,
                        JSON.parse(
                          Buffer.from(interactionData.data.message).toString()
                        ) as UnsignedTransaction
                      );

                      if (icon !== undefined && title !== undefined) {
                        return (
                          <EthTxBase
                            icon={icon}
                            title={title}
                            content={content}
                          />
                        );
                      }

                      setIsUnknownContractExecution(true);
                    })()}
                  </Body2>
                </Box>
              )}
            </Box>
          ) : (
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
          )}
        </SimpleBar>

        <Box height="0" minHeight="0.75rem" />

        {!isViewData ? <div style={{ flex: 1 }} /> : null}

        {isTxSigning &&
          (() => {
            if (interactionData.isInternal) {
              return (
                <FeeSummary
                  feeConfig={feeConfig}
                  gasConfig={gasConfig}
                  gasSimulator={gasSimulator}
                  isForEVMTx
                />
              );
            }

            return (
              <FeeControl
                feeConfig={feeConfig}
                senderConfig={senderConfig}
                gasConfig={gasConfig}
                gasSimulator={gasSimulator}
                isForEVMTx
              />
            );
          })()}

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>
      <KeystoneSign
        ur={keystoneUR}
        isOpen={isKeystoneInteracting}
        close={() => {
          setIsKeystoneInteracting(false);
        }}
        onScan={(ur) => {
          if (keystoneScanResolve.current === undefined) {
            throw new Error("Keystone Scan Error");
          }
          keystoneScanResolve.current(ur);
        }}
        error={keystoneInteractingError}
        onCloseError={() => {
          if (keystoneInteractingError) {
            setIsKeystoneInteracting(false);
          }
          setKeystoneInteractingError(undefined);
        }}
      />
    </HeaderLayout>
  );
});
