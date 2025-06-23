import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Body3, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import SimpleBar from "simplebar-react";
import { ViewDataButton } from "../../components/view-data-button";
import { BatchTransactionInfo } from "./batch-transaction-info";
import { ChainImageFallback } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { Column, Columns } from "../../../../components/column";
import { LedgerGuideBox } from "../../components/ledger-guide-box";
import { KeystoneUSBBox } from "../../components/keystone-usb-box";
import { KeystoneSign } from "../../components/keystone";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { useEthereumSigningCommon } from "../hooks/use-ethereum-signing-common";
import { useEthereumSigningButtons } from "../hooks/use-ethereum-signing-buttons";
import { useBatchTransaction } from "../hooks/use-batch-transaction";
import {
  BatchSigningData,
  InternalSendCallsRequest,
  UnsignedTxLike,
} from "@keplr-wallet/background";
import {
  useAmountConfig,
  useFeeConfig,
  useGasSimulator,
  useSenderConfig,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { MemoryKVStore } from "@keplr-wallet/common";
import { Buffer } from "buffer/";
import { FeeSummary } from "../../components/fee-summary";
import { FeeControl } from "../../../../components/input/fee-control";
import { EthSignType, EthTransactionType } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";

export const EthereumEIP5792SignView: FunctionComponent<{
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
  const {
    signer,
    chainId,
    message,
    // keyType
  } = interactionData.data;

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
  } = useEthereumSigningCommon({
    interactionData,
    emptySigningDataBuff: true,
  });

  const account = accountStore.getAccount(chainId);
  const ethereumAccount = ethereumAccountStore.getAccount(chainId);
  const chainInfo = chainStore.getChain(chainId);

  const request: InternalSendCallsRequest | null = useMemo(() => {
    try {
      const parsed = JSON.parse(Buffer.from(message).toString("utf8"));
      return {
        id: parsed.id,
        apiVersion: parsed.apiVersion,
        calls: parsed.calls,
        nonce: parsed.nonce,
        batchId: parsed.batchId,
        chainCapabilities: parsed.chainCapabilities,
        accountUpgradeInfo: parsed.accountUpgradeInfo,
      } as InternalSendCallsRequest;
    } catch {
      return null;
    }
  }, [message]);

  const {
    analysis,
    transactions,
    isTransactionReady,
    uiInfo,
    signingData,
    setUpgradeChoice,
    upgradeChoice,
  } = useBatchTransaction({
    request,
    isInternalRequest: interactionData.isInternal,
    chainId,
    accountAddress: account.ethereumHexAddress,
  });

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

      if (!isTransactionReady) {
        throw new Error("Invalid EIP-5792 request format");
      }

      // TODO: handle sequential batch strategy with multiple transactions
      const unsignedTx = transactions[0].clone();

      if (unsignedTx.type === EthTransactionType.eip7702) {
        const authorizationList = unsignedTx.authorizationList;
        const authorization = authorizationList?.[0];
        // Override the delegation designator of the account
        if (authorization) {
          // NOTE: Only handle a single authorization
          const { address } = authorization;

          // NOTE: For simulation, remove authorization list and change to EIP-1559 transaction,
          // and override the delegation designator of the account
          unsignedTx.authorizationList = null;
          unsignedTx.type = EthTransactionType.eip1559;

          return {
            simulate: async () => {
              // TODO: check if account is empty
              //   const [balance, nonce, code] = await Promise.all([
              //     rpc.eth_getBalance(address),
              //     rpc.eth_getTransactionCount(address),
              //     rpc.eth_getCode(address),
              //   ]);
              const isAccountEmpty = false;

              // EIP-7702 gas costs:
              // - PER_AUTH_BASE_COST (25,000) always applied as intrinsic cost
              // - If account is not empty: additional cost during execution
              // - For simulation, we use conservative estimate
              const authIntrinsic = isAccountEmpty
                ? 25_000 // cost for empty accounts
                : 12_500; // cost for non-empty accounts

              const { gasUsed: baseGasUsed } =
                await ethereumAccount.simulateGas(
                  account.ethereumHexAddress,
                  unsignedTx,
                  {
                    [account.ethereumHexAddress]: {
                      code: `0xef0100${address.slice(2)}`,
                    },
                  }
                );

              return {
                gasUsed: authIntrinsic + baseGasUsed,
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

  // NOTE: Legacy transaction not allowed
  const { maxFeePerGas, maxPriorityFeePerGas } = (() => {
    const { maxFeePerGas, maxPriorityFeePerGas } = feeConfig.getEIP1559TxFees(
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
        }
      : {
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined,
        };
  })();

  useEffect(() => {
    if (!isTransactionReady) {
      return;
    }

    if (signingData) {
      if (signingData.unsignedTxs.length > 0) {
        const unsignedTx: UnsignedTxLike = signingData.unsignedTxs[0];

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

        signingData.unsignedTxs[0] = unsignedTx;

        setSigningDataBuff(Buffer.from(JSON.stringify(signingData), "utf8"));
      }
    }
  }, [
    gasConfig.gas,
    isTransactionReady,
    maxFeePerGas,
    maxPriorityFeePerGas,
    setSigningDataBuff,
    signingData,
  ]);

  useEffect(() => {
    (async () => {
      if (!isTransactionReady) {
        return;
      }

      if (chainInfo.features.includes("op-stack-l1-data-fee")) {
        const unsignedTx = transactions[0].clone();
        const l1DataFee = await ethereumAccount.simulateOpStackL1Fee(
          unsignedTx
        );
        feeConfig.setL1DataFee(new Dec(BigInt(l1DataFee)));
      }
    })();
  }, [
    chainInfo.features,
    ethereumAccount,
    feeConfig,
    isTransactionReady,
    transactions,
  ]);

  useEffect(() => {
    if (!isTransactionReady) {
      return;
    }

    if (signingData) {
      setSigningDataBuff(Buffer.from(JSON.stringify(signingData), "utf8"));
    }
  }, [isTransactionReady, setSigningDataBuff, signingData]);

  useEffect(() => {
    // Refresh EIP-1559 fee every 12 seconds.
    const intervalId = setInterval(() => {
      feeConfig.refreshEIP1559TxFees();
    }, 12000);

    return () => clearInterval(intervalId);
  }, [feeConfig]);

  const signingDataText = useMemo(() => {
    if (signingDataBuff.length === 0) {
      return "";
    }

    const signingData: BatchSigningData = JSON.parse(
      signingDataBuff.toString("utf8")
    );

    if (signingData.unsignedTxs.length === 1) {
      const unsignedTx = signingData.unsignedTxs[0];
      return JSON.stringify(unsignedTx, null, 2);
    }

    return JSON.stringify(signingData.unsignedTxs, null, 2);
  }, [signingDataBuff]);

  const [isViewData, setIsViewData] = useState(false);

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
        id: `page.sign.ethereum.${EthSignType.TRANSACTION}.title`,
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
          <Box>
            {isViewData ? (
              <Box
                as={"pre"}
                padding="1rem"
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
                <BatchTransactionInfo
                  request={request}
                  analysis={analysis}
                  transactions={transactions}
                  chainId={chainId}
                  upgradeChoice={upgradeChoice}
                  setUpgradeChoice={setUpgradeChoice}
                  upgradeOptions={uiInfo.upgradeOptions}
                  isTransactionReady={isTransactionReady}
                />
              </Box>
            )}
          </Box>
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
