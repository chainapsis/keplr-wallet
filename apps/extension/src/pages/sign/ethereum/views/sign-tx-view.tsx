import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Body2, Body3, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useInteractionInfo } from "../../../../hooks";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { Buffer } from "buffer/";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import {
  handleEthereumPreSignByKeystone,
  handleEthereumPreSignByLedger,
} from "../../utils/handle-eth-sign";
import { FormattedMessage, useIntl } from "react-intl";
import { ErrModuleKeystoneSign, KeystoneUR } from "../../utils/keystone";
import { KeystoneSign } from "../../components/keystone";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../../components/view-data-button";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { defaultRegistry } from "../../components/eth-tx/registry";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { useUnmount } from "../../../../hooks/use-unmount";
import { FeeSummary } from "../../components/fee-summary";
import { FeeControl } from "../../../../components/input/fee-control";
import {
  useAmountConfig,
  useFeeConfig,
  useGasSimulator,
  useSenderConfig,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { EthTxBase } from "../../components/eth-tx/render/tx-base";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Column, Columns } from "../../../../components/column";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { HeaderProps } from "../../../../layouts/header/types";
import { getKeplrFromWindow } from "@keplr-wallet/stores";

export const EthereumSignTxView: FunctionComponent<{
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
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signEthereumInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
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
    senderConfig,
    false
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
  const [preferNoSetFee, setPreferNoSetFee] = useState<boolean>(false);

  const gasSimulator = useGasSimulator(
    new MemoryKVStore("gas-simulator.ethereum.sign"),
    chainStore,
    chainInfo.chainId,
    gasConfig,
    feeConfig,
    "evm/native",
    () => {
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
          gasPrice: `0x${BigInt(gasPrice?.truncate().toString() ?? 0).toString(
            16
          )}`,
        };
  })();

  useEffect(() => {
    const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

    const gasLimitFromTx = BigInt(unsignedTx.gasLimit ?? unsignedTx.gas ?? 0);
    if (gasLimitFromTx > 0) {
      gasConfig.setValue(gasLimitFromTx.toString());

      const gasPriceFromTx = BigInt(
        unsignedTx.maxFeePerGas ?? unsignedTx.gasPrice ?? 0
      );
      if (gasPriceFromTx > 0) {
        // 사이트에서 제공된 수수료를 사용하는 경우, fee type이 manual로 설정되며,
        // 사용자가 수동으로 설정하는 것을 지양하기 위해 preferNoSetFee를 true로 설정
        feeConfig.setFee(
          new CoinPretty(
            chainInfo.currencies[0],
            new Dec(gasConfig.gas).mul(new Dec(gasPriceFromTx))
          )
        );

        setPreferNoSetFee(!interactionData.isInternal);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!interactionData.isInternal) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));

      // 수수료 옵션을 사이트에서 제공하는 경우, 수수료 옵션을 사용하지 않음
      if (feeConfig.type === "manual") {
        return;
      }

      if (gasConfig.gas > 0) {
        unsignedTx.gasLimit = `0x${gasConfig.gas.toString(16)}`;
      }

      // EIP-1559 우선 적용
      if (maxFeePerGas) {
        unsignedTx.gasPrice = undefined;
        unsignedTx.maxFeePerGas = maxFeePerGas;
      }

      if (unsignedTx.maxFeePerGas && maxPriorityFeePerGas) {
        unsignedTx.maxPriorityFeePerGas = maxPriorityFeePerGas;
      }

      if (!maxFeePerGas && !maxPriorityFeePerGas && gasPrice) {
        unsignedTx.gasPrice = gasPrice;
      }

      setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), "utf8"));
    }
  }, [
    gasConfig.gas,
    message,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    gasSimulator,
    gasConfig,
    feeConfig,
    feeConfig.type,
    interactionData.isInternal,
  ]);

  // interactionData.isInternal === true일때는 이전 UI에서 설정할 수 있기 때문에
  // 그때는 처리되지 않도록 신경써야한다.
  const needHandleNonceMethod = !interactionData.isInternal;
  const [nonceMethod, setNonceMethod] = useState<"latest" | "pending">(
    "pending"
  );
  const originalNonceRef = useRef(
    (() => {
      if (needHandleNonceMethod) {
        const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));
        return unsignedTx.nonce;
      }
      return null;
    })()
  );
  useEffect(() => {
    if (needHandleNonceMethod) {
      const unsignedTx = JSON.parse(Buffer.from(message).toString("utf8"));
      if (nonceMethod === "pending") {
        if (originalNonceRef.current) {
          unsignedTx.nonce = originalNonceRef.current;
          setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), "utf8"));
        } else {
          (async () => {
            const keplr = await getKeplrFromWindow();
            if (keplr) {
              const transactionCountPending =
                await keplr.ethereum.request<string>({
                  method: "eth_getTransactionCount",
                  params: [senderConfig.sender, "pending"],
                  chainId: feeConfig.chainId,
                });
              const nonce = parseInt(transactionCountPending, 16);
              unsignedTx.nonce = nonce;
              setSigningDataBuff(
                Buffer.from(JSON.stringify(unsignedTx), "utf8")
              );
            }
          })();
        }
      } else if (nonceMethod === "latest") {
        (async () => {
          const keplr = await getKeplrFromWindow();
          if (keplr) {
            const transactionCountLatest = await keplr.ethereum.request<string>(
              {
                method: "eth_getTransactionCount",
                params: [senderConfig.sender, "latest"],
                chainId: feeConfig.chainId,
              }
            );
            const nonce = parseInt(transactionCountLatest, 16);
            unsignedTx.nonce = nonce;
            setSigningDataBuff(Buffer.from(JSON.stringify(unsignedTx), "utf8"));
          }
        })();
      }
    }
  }, [
    feeConfig.chainId,
    message,
    needHandleNonceMethod,
    nonceMethod,
    senderConfig.sender,
  ]);

  useEffect(() => {
    (async () => {
      if (chainInfo.features.includes("op-stack-l1-data-fee")) {
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
  }, [chainInfo.features, ethereumAccount, feeConfig, message]);

  useEffect(() => {
    // If the signing request is internal or the fee is set by dApp,
    // we don't need to refresh the fee.
    if (!needHandleNonceMethod || preferNoSetFee) {
      return;
    }

    // Refresh EIP-1559 fee every 12 seconds.
    const intervalId = setInterval(() => {
      feeConfig.refreshEIP1559TxFees();
    }, 12000);

    return () => clearInterval(intervalId);
  }, [feeConfig, preferNoSetFee, needHandleNonceMethod]);

  useEffect(() => {
    if (feeConfig.type === "manual") {
      return;
    }

    // if fee type is changed from manual to auto(average, fast, fastest),
    // we need to set preferNoSetFee to false to allow automatic fee set.
    setPreferNoSetFee(false);
  }, [feeConfig.type]);

  const signingDataText = useMemo(() => {
    return JSON.stringify(
      JSON.parse(signingDataBuff.toString("utf8")),
      null,
      2
    );
  }, [signingDataBuff]);

  const [isViewData, setIsViewData] = useState(false);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isKeystonUSB =
    interactionData.data.keyType === "keystone" &&
    interactionData.data.keyInsensitive["connectionType"] === "USB";

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

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    feeConfig,
  });

  const isLoading =
    signEthereumInteractionStore.isObsoleteInteractionApproved(
      interactionData.id
    ) ||
    isLedgerInteracting ||
    isKeystoneInteracting;

  // TODO: ethereum fee config is refreshed every 12 seconds,
  // so we need to consider the initial state condition.
  const initialGuard =
    amountConfig.uiProperties.loadingState === "loading" ||
    feeConfig.uiProperties.loadingState === "loading";

  const buttonDisabled = txConfigsValidate.interactionBlocked || initialGuard;

  const bottomButtons: HeaderProps["bottomButtons"] = [
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
        await signEthereumInteractionStore.rejectWithProceedNext(
          interactionData.id,
          async (proceedNext) => {
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
      text: intl.formatMessage({ id: "button.approve" }),
      color: "primary",
      size: "large",
      left: !isLoading && <ApproveIcon />,
      disabled: buttonDisabled,
      isLoading,
      onClick: async () => {
        try {
          let signature;
          if (interactionData.data.keyType === "ledger") {
            setIsLedgerInteracting(true);
            setLedgerInteractingError(undefined);
            signature = await handleEthereumPreSignByLedger(
              interactionData,
              signingDataBuff,
              {
                useWebHID: uiConfigStore.useWebHIDLedger,
              }
            );
          } else if (interactionData.data.keyType === "keystone") {
            setIsKeystoneInteracting(true);
            setKeystoneInteractingError(undefined);
            signature = await handleEthereumPreSignByKeystone(
              interactionData,
              signingDataBuff,
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
            signingDataBuff,
            signature,
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
          setIsKeystoneInteracting(false);
        }
      },
    },
  ];

  const headerLeft = (
    <BackButton
      hidden={
        interactionInfo.interaction && !interactionInfo.interactionInternal
      }
    />
  );
  const ledgerGuideBox = useMemo(
    () => (
      <LedgerGuideBox
        data={{
          keyInsensitive: interactionData.data.keyInsensitive,
          isEthereum: true,
        }}
        isLedgerInteracting={isLedgerInteracting}
        ledgerInteractingError={ledgerInteractingError}
        isInternal={interactionData.isInternal}
      />
    ),
    [
      interactionData.data.keyInsensitive,
      interactionData.isInternal,
      isLedgerInteracting,
      ledgerInteractingError,
    ]
  );

  const keystoneUSBBox = isKeystonUSB && (
    <KeystoneUSBBox
      isKeystoneInteracting={isKeystoneInteracting}
      KeystoneInteractingError={keystoneInteractingError}
    />
  );

  const keystoneSign = !isKeystonUSB && (
    <KeystoneSign
      ur={keystoneUR}
      isOpen={isKeystoneInteracting}
      close={() => setIsKeystoneInteracting(false)}
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
  );

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: `page.sign.ethereum.${signType}.title`,
      })}
      fixedHeight={true}
      left={headerLeft}
      bottomButtons={bottomButtons}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingBottom="0"
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
          {!isUnknownContractExecution ? (
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

        {(() => {
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
              disableAutomaticFeeSet={preferNoSetFee}
              isForEVMTx
              nonceMethod={needHandleNonceMethod ? nonceMethod : undefined}
              setNonceMethod={
                needHandleNonceMethod ? setNonceMethod : undefined
              }
            />
          );
        })()}

        {ledgerGuideBox}
        {keystoneUSBBox}
      </Box>
      {keystoneSign}
    </HeaderLayout>
  );
});
