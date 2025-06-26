import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Body2, Body3, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../../components/view-data-button";
import { defaultRegistry } from "../../components/eth-tx/registry";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
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
import { EthTxBase } from "../../components/eth-tx/render/tx-base";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Column, Columns } from "../../../../components/column";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import { KeystoneSign } from "../../components/keystone";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { Transaction, TransactionLike, ZeroAddress } from "ethers";
import { Buffer } from "buffer/";
import { useEthereumSigningCommon } from "../hooks/use-ethereum-signing-common";
import { useEthereumSigningButtons } from "../hooks/use-ethereum-signing-buttons";
import { EthTransactionType, UnsignedTxLike } from "@keplr-wallet/types";

export const EthereumTransactionSignView: FunctionComponent<{
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    chainStore,
    uiConfigStore,
    accountStore,
    ethereumAccountStore,
    queriesStore,
  } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const { signType, signer, chainId, message } = interactionData.data;

  const {
    interactionInfo,
    signingDataBuff,
    setSigningDataBuff,
    isLedgerInteracting,
    setIsLedgerInteracting,
    ledgerInteractingError,
    setLedgerInteractingError,
    isKeystoneUSB,
    isKeystoneInteracting,
    setIsKeystoneInteracting,
    keystoneUR,
    setKeystoneUR,
    keystoneScanResolve,
    keystoneInteractingError,
    setKeystoneInteractingError,
    unmountPromise,
    isLoading,
  } = useEthereumSigningCommon({ interactionData });

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

      const txLike: UnsignedTxLike = JSON.parse(
        Buffer.from(message).toString("utf8")
      );
      if (txLike.from) {
        delete txLike.from;
      }

      const unsignedTx = Transaction.from(txLike as TransactionLike);

      if (unsignedTx.type === EthTransactionType.eip7702) {
        const authorizationList = unsignedTx.authorizationList;
        const authorization = authorizationList?.[0];
        // Override the delegation designator of the account
        if (authorization) {
          // NOTE: Only handle a single authorization
          const { address } = authorization;

          const isZeroAddress = address === ZeroAddress;

          // NOTE: For simulation, remove authorization list and change to EIP-1559 transaction,
          // and override the delegation designator of the account
          unsignedTx.authorizationList = null;
          unsignedTx.type = EthTransactionType.eip1559;

          return {
            simulate: async () => {
              const authIntrinsic = 25_000;

              const { gasUsed: baseGasUsed } =
                await ethereumAccount.simulateGas(
                  account.ethereumHexAddress,
                  unsignedTx,
                  {
                    [account.ethereumHexAddress]: {
                      code: isZeroAddress
                        ? "0x"
                        : `0xef0100${address.slice(2)}`,
                    },
                  }
                );

              // CHECK: intrinsic gas should be 46_000 for 7702 revoke tx
              // 21_000 for default call tx + 25_000 for authorization
              return {
                gasUsed:
                  baseGasUsed < 21_000
                    ? authIntrinsic + 21_000
                    : authIntrinsic + baseGasUsed,
              };
            },
          };
        }
      }

      return {
        simulate: () =>
          ethereumAccount.simulateGas(account.ethereumHexAddress, unsignedTx),
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
    } else {
      // upgrade/revoke 요청 처리 필요
      feeConfig.setFee({
        type: "average",
        currency: feeConfig.selectableFeeCurrencies[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
    setSigningDataBuff,
  ]);

  useEffect(() => {
    (async () => {
      if (chainInfo.features.includes("op-stack-l1-data-fee")) {
        const { to, gasLimit, value, data, chainId }: TransactionLike =
          JSON.parse(Buffer.from(message).toString("utf8"));

        const tx = new Transaction();
        tx.to = to ?? null;
        tx.gasLimit = gasLimit ?? 0;
        tx.value = value ?? BigInt(0);
        tx.data = data ?? "0x";
        tx.chainId = chainId ?? 0;

        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee(tx);
        feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [chainInfo.features, ethereumAccount, feeConfig, message]);

  useEffect(() => {
    // Refresh EIP-1559 fee every 12 seconds.
    const intervalId = setInterval(() => {
      feeConfig.refreshEIP1559TxFees();
    }, 12000);

    return () => clearInterval(intervalId);
  }, [feeConfig]);

  const signingDataText = useMemo(() => {
    return JSON.stringify(
      JSON.parse(signingDataBuff.toString("utf8")),
      null,
      2
    );
  }, [signingDataBuff]);

  const [isViewData, setIsViewData] = useState(false);
  const [isUnknownContractExecution, setIsUnknownContractExecution] =
    useState(false);

  const txConfigsValidate = useTxConfigsValidate({
    senderConfig,
    gasConfig,
    feeConfig,
  });

  const buttonDisabled = txConfigsValidate.interactionBlocked;

  const { bottomButtons } = useEthereumSigningButtons({
    interactionData,
    interactionInfo,
    signingDataBuff,
    isLoading,
    buttonDisabled,
    setIsLedgerInteracting,
    setLedgerInteractingError,
    setIsKeystoneInteracting,
    setKeystoneInteractingError,
    keystoneScanResolve,
    unmountPromise,
    setKeystoneUR,
  });

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

  const keystoneUSBBox = isKeystoneUSB && (
    <KeystoneUSBBox
      isKeystoneInteracting={isKeystoneInteracting}
      KeystoneInteractingError={keystoneInteractingError}
    />
  );

  const keystoneSign = !isKeystoneUSB && (
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
                        Transaction.from(
                          JSON.parse(
                            Buffer.from(interactionData.data.message).toString()
                          ) as TransactionLike
                        )
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
