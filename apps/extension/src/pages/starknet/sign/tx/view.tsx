import React, { FunctionComponent, useEffect, useState } from "react";
import { SignStarknetTxInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeControl } from "../../components/input/fee-control";
import {
  AccountNotDeployed,
  useFeeConfig,
  useGasConfig,
  useGasSimulator,
  useNoopAmountConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks-starknet";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { num, InvocationsSignerDetails } from "starknet";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { H5 } from "../../../../components/typography";
import { ArrowDropDownIcon } from "../../../../components/icon";
import { Column, Columns } from "../../../../components/column";
import SimpleBar from "simplebar-react";
import { XAxis } from "../../../../components/axis";
import { ViewDataButton } from "../../../sign/components/view-data-button";
import { AccountActivationModal } from "../../components/account-activation-modal";
import { Modal } from "../../../../components/modal";
import { connectAndSignInvokeTxWithLedger } from "../../../sign/utils/handle-starknet-sign";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../../sign/utils/ledger-types";
import { LedgerGuideBox } from "../../../sign/components/ledger-guide-box";
import { useNavigate } from "react-router";
import { ApproveIcon, CancelIcon } from "../../../../components/button";

export const SignStarknetTxView: FunctionComponent<{
  interactionData: NonNullable<SignStarknetTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signStarknetTxInteractionStore,
    starknetAccountStore,
    starknetQueriesStore,
  } = useStore();

  const theme = useTheme();
  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signStarknetTxInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const navigate = useNavigate();

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("starknet" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not starknet chain`);
  }
  const starknet = modularChainInfo.starknet;

  const senderConfig = useSenderConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    interactionData.data.signer
  );
  const amountConfig = useNoopAmountConfig(chainStore, chainId, senderConfig);
  const gasConfig = useGasConfig(
    chainStore,
    chainId,
    (() => {
      if ("resourceBounds" in interactionData.data.details) {
        return parseInt(
          interactionData.data.details.resourceBounds.l1_gas.max_amount
        );
      }
    })()
  );
  const feeConfig = useFeeConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig,
    (feeConfig) => {
      if (interactionData.data.details.version === "0x1") {
        feeConfig.setType("ETH");
      }
      if (interactionData.data.details.version === "0x3") {
        feeConfig.setType("STRK");
      }
    }
  );

  const gasSimulationRefresher = useLocalObservable(() => ({
    count: 0,
    increaseCount() {
      this.count++;
    },
  }));

  useEffect(() => {
    // Refresh gas simulation every 12 seconds.
    const interval = setInterval(
      () => gasSimulationRefresher.increaseCount(),
      12000
    );

    return () => clearInterval(interval);
  }, [gasSimulationRefresher]);

  const gasSimulator = useGasSimulator(
    new MemoryKVStore("starknet.sign"),
    chainStore,
    chainId,
    gasConfig,
    feeConfig,
    // fee type이 바뀔때마다 refresh 시켜야한다...
    feeConfig.type,
    () => {
      if (!amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        amountConfig.uiProperties.loadingState === "loading-block" ||
        amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      // observed되어야 하므로 꼭 여기서 참조 해야함.
      const type = feeConfig.type;
      const feeContractAddress =
        type === "ETH"
          ? starknet.ethContractAddress
          : starknet.strkContractAddress;
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("starknet")
        .find((cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`);
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      const sender = senderConfig.sender;

      return async () => {
        noop(gasSimulationRefresher.count);

        const estimateResult = await starknetAccountStore
          .getAccount(chainId)
          .estimateInvokeFee(
            sender,
            interactionData.data.transactions,
            type === "ETH"
              ? {
                  mode: "default",
                  gasToken: feeContractAddress,
                }
              : undefined
          );

        const {
          l1_gas_consumed,
          l1_gas_price,
          l2_gas_consumed,
          l2_gas_price,
          l1_data_gas_consumed,
          l1_data_gas_price,
        } = estimateResult;

        const extraL2GasForOnchainVerification =
          interactionData.data.keyType === "ledger"
            ? new Dec(90240)
            : new Dec(22039040);

        const adjustedL2GasConsumed = new Dec(l2_gas_consumed ?? 0).add(
          extraL2GasForOnchainVerification
        );

        const l1Fee = new Dec(l1_gas_consumed).mul(new Dec(l1_gas_price));
        const l2Fee = adjustedL2GasConsumed.mul(new Dec(l2_gas_price ?? 0));
        const l1DataFee = new Dec(l1_data_gas_consumed).mul(
          new Dec(l1_data_gas_price)
        );

        const calculatedOverallFee = l1Fee.add(l2Fee).add(l1DataFee);

        const totalGasConsumed = new Dec(l1_gas_consumed)
          .add(adjustedL2GasConsumed)
          .add(new Dec(l1_data_gas_consumed));

        const adjustedGasPrice = calculatedOverallFee.quo(totalGasConsumed);

        const gasPriceMargin = new Dec(1.5);

        const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);
        const maxGasPrice = gasPrice.mul(gasPriceMargin);

        feeConfig.setGasPrice({
          gasPrice: gasPrice,
          maxGasPrice: maxGasPrice,
        });

        return {
          l1Gas: {
            consumed: l1_gas_consumed.toString(),
            price: l1_gas_price.toString(),
          },
          l2Gas: {
            consumed: adjustedL2GasConsumed.toString(),
            price: l2_gas_price?.toString() ?? "0",
          },
          l1DataGas: {
            consumed: l1_data_gas_consumed.toString(),
            price: l1_data_gas_price.toString(),
          },
        };
      };
    }
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

  const [isViewData, setIsViewData] = useState(false);

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isAccountNotDeployed =
    senderConfig.uiProperties.error instanceof AccountNotDeployed;
  const [isAccountActivationModalOpen, setIsAccountActivationModalOpen] =
    useState(false);
  useEffect(() => {
    setIsAccountActivationModalOpen(isAccountNotDeployed);
  }, [isAccountNotDeployed]);

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const txConfigsValidate = useTxConfigsValidate({
    amountConfig,
    senderConfig,
    gasConfig,
    feeConfig,
  });

  const buttonDisabled = txConfigsValidate.interactionBlocked;
  const isLoading =
    signStarknetTxInteractionStore.isObsoleteInteractionApproved(
      interactionData.id
    ) || isLedgerInteracting;

  const approve = async () => {
    try {
      if (isAccountNotDeployed) {
        setIsAccountActivationModalOpen(true);
        return;
      }

      const estimate = gasSimulator.gasEstimate;
      if (!estimate) {
        throw new Error("Gas estimate not found");
      }

      const type = feeConfig.type;
      const feeContractAddress =
        type === "ETH"
          ? starknet.ethContractAddress
          : starknet.strkContractAddress;
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("starknet")
        .find((cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`);
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      // XXX: 요청되었을때 계정이 deploy되어있지 않았다면 nonce는 0이다.
      //      이 경우 keplr UI 쪽에서 계정을 deploy 했었을 것이기 때문에 nonce를 새롭게 받아와야한다.
      let nonce = new Int(num.toBigInt(interactionData.data.details.nonce));
      if (nonce.equals(new Int(0))) {
        nonce = await starknetAccountStore
          .getAccount(chainId)
          .getNonce(senderConfig.sender);
      }

      const { l1Gas, l2Gas, l1DataGas } = gasSimulator.gasEstimate;

      const margin = new Dec(1.5);

      const maxL1DataGas = new Dec(l1DataGas.consumed).mul(margin);
      const maxL1Gas = new Dec(l1Gas.consumed).mul(margin);
      const maxL2Gas = new Dec(l2Gas.consumed).mul(margin);

      const maxL1DataGasPrice = new Dec(l1DataGas.price).mul(margin);
      const maxL1GasPrice = new Dec(l1Gas.price).mul(margin);
      const maxL2GasPrice = new Dec(l2Gas.price).mul(margin);

      const details: InvocationsSignerDetails = {
        version: "0x3",
        walletAddress: interactionData.data.details.walletAddress,
        nonce: num.toBigInt(nonce.toString()),
        chainId: interactionData.data.details.chainId,
        cairoVersion: interactionData.data.details.cairoVersion,
        skipValidate: false,
        resourceBounds: {
          l1_data_gas: {
            max_amount: num.toHex(maxL1DataGas.truncate().toString()),
            max_price_per_unit: num.toHex(
              maxL1DataGasPrice.truncate().toString()
            ),
          },
          l1_gas: {
            max_amount: num.toHex(maxL1Gas.truncate().toString()),
            max_price_per_unit: num.toHex(maxL1GasPrice.truncate().toString()),
          },
          l2_gas: {
            max_amount: num.toHex(maxL2Gas.truncate().toString()),
            max_price_per_unit: num.toHex(maxL2GasPrice.truncate().toString()),
          },
        },
        tip: "0x0",
        paymasterData: [],
        accountDeploymentData: [],
        nonceDataAvailabilityMode: "L1",
        feeDataAvailabilityMode: "L1",
      };

      let signature: string[] | undefined = undefined;
      if (interactionData.data.keyType === "ledger") {
        setIsLedgerInteracting(true);
        setLedgerInteractingError(undefined);
        signature = await connectAndSignInvokeTxWithLedger(
          interactionData.data.pubKey,
          interactionData.data.transactions,
          details
        );
      }

      await signStarknetTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        interactionData.data.transactions,
        details,
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
            await signStarknetTxInteractionStore.rejectWithProceedNext(
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
        <Box marginBottom="0.5rem">
          <Columns sum={1} alignY="center">
            <XAxis>
              <H5
                style={{
                  color: ColorPalette["blue-400"],
                  marginRight: "0.25rem",
                }}
              >
                {interactionData.data.transactions.length > 1
                  ? interactionData.data.transactions.length
                  : ""}
              </H5>
              <H5
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-50"],
                }}
              >
                {interactionData.data.transactions.length > 1 && (
                  <FormattedMessage id="page.sign.starknet.tx.calls" />
                )}
              </H5>
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
              boxShadow:
                theme.mode === "light"
                  ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                  : "none",
              height: "fit-content",
              maxHeight: "23rem",

              borderRadius: "0.375rem",
            }}
          >
            <Box
              as={"pre"}
              // Remove normalized style of pre tag
              margin="0"
              padding="1rem"
              style={{
                borderRadius: "0.375rem",
                backgroundColor:
                  theme.mode === "light"
                    ? ColorPalette.white
                    : ColorPalette["gray-600"],

                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"],
                width: "fit-content",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(
                {
                  calls: interactionData.data.transactions,
                  details: interactionData.data.details,
                },
                (_, v) => (typeof v === "bigint" ? v.toString() : v),
                2
              )}
            </Box>
          </SimpleBar>
        ) : (
          <DataByTransactionView interactionData={interactionData} />
        )}

        <div style={{ marginTop: "0.75rem", flex: 1 }} />

        <FeeControl
          senderConfig={senderConfig}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          gasSimulator={gasSimulator}
        />

        <LedgerGuideBox
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isStarknet: true,
          }}
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={interactionData.isInternal}
        />
      </Box>

      <Modal
        isOpen={isAccountActivationModalOpen}
        align="bottom"
        maxHeight="95vh"
        close={() => {
          // noop
        }}
      >
        <AccountActivationModal
          data={{
            keyInsensitive: interactionData.data.keyInsensitive,
            isEthereum: false,
          }}
          close={() => setIsAccountActivationModalOpen(false)}
          onAccountDeployed={() => {
            // account가 deploy 되었을때 gas simulator를 refresh한다.
            gasSimulationRefresher.increaseCount();
          }}
          goBack={() => {
            signStarknetTxInteractionStore.rejectWithProceedNext(
              interactionData.id,
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
          }}
          chainId={chainId}
        />
      </Modal>
    </HeaderLayout>
  );
});

const DataByTransactionView: FunctionComponent<{
  interactionData: NonNullable<SignStarknetTxInteractionStore["waitingData"]>;
}> = ({ interactionData }) => {
  const theme = useTheme();

  const [openedItemIndex, setOpenedItemIndex] = useState<number | null>(null);
  const toggleOpen = (index: number) =>
    index === openedItemIndex
      ? setOpenedItemIndex(null)
      : setOpenedItemIndex(index);

  return (
    <SimpleBar
      autoHide={false}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "0 1 auto",

        overflowY: "auto",
        overflowX: "hidden",
        boxShadow:
          theme.mode === "light"
            ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
            : "none",
      }}
    >
      {interactionData.data.transactions.map((tx, i) => {
        const isOpen = openedItemIndex === i;
        return (
          <Box
            key={i}
            padding="1rem 0 0"
            marginBottom={
              i !== interactionData.data.transactions.length - 1
                ? "0.5rem"
                : undefined
            }
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
                    {tx.entrypoint.charAt(0).toUpperCase() +
                      tx.entrypoint.slice(1)}
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
                  {isOpen
                    ? JSON.stringify(
                        {
                          contractAddress: tx.contractAddress,
                          calldata: tx.calldata,
                        },
                        null,
                        2
                      )
                    : ""}
                </Box>
              ) : null}
            </SimpleBar>
          </Box>
        );
      })}
    </SimpleBar>
  );
};

const noop = (..._args: any[]) => {
  // noop
};
