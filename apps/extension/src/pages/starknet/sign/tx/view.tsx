import React, { FunctionComponent, useState } from "react";
import { SignStarknetTxInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { FormattedMessage, useIntl } from "react-intl";
import { FeeControl } from "../../components/input/fee-control";
import {
  useFeeConfig,
  useGasConfig,
  useGasSimulator,
  useNoopAmountConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks-starknet";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
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
  const interactionInfo = useInteractionInfo();

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

      return {
        simulate: async (): Promise<{
          gasUsed: number;
        }> => {
          const res = await starknetAccountStore
            .getAccount(chainId)
            .estimateInvokeFee(sender, interactionData.data.transactions, type);

          // gas adjustment = 1.2, signature verification = 700
          const gasConsumed = new Dec(res.gas_consumed);
          const gasMax = gasConsumed.mul(new Dec(1.2)).add(new Dec(700));
          const gasPrice = new CoinPretty(feeCurrency, res.gas_price);
          const maxGasPrice = gasPrice.mul(new Dec(1.2));

          feeConfig.setGasPrice({
            gasPrice: gasPrice,
            maxGasPrice: maxGasPrice,
          });

          return {
            gasUsed: parseInt(gasMax.truncate().toString()),
          };
        },
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

  const approve = async () => {
    try {
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

      const details: InvocationsSignerDetails = (() => {
        if (type === "ETH") {
          return {
            version: "0x1",
            walletAddress: interactionData.data.details.walletAddress,
            nonce: interactionData.data.details.nonce,
            chainId: interactionData.data.details.chainId,
            cairoVersion: interactionData.data.details.cairoVersion,
            skipValidate: false,

            maxFee: feeConfig.maxFee
              ? num.toHex(feeConfig.maxFee.toCoin().amount)
              : "0x0",
          };
        } else {
          return {
            version: "0x3",
            walletAddress: interactionData.data.details.walletAddress,
            nonce: interactionData.data.details.nonce,
            chainId: interactionData.data.details.chainId,
            cairoVersion: interactionData.data.details.cairoVersion,
            skipValidate: false,

            resourceBounds: {
              l1_gas: {
                max_amount: num.toHex(gasConfig.gas.toString()),
                max_price_per_unit: (() => {
                  if (!feeConfig.maxFee) {
                    return "0x0";
                  }

                  return num.toHex(
                    new Dec(feeConfig.maxFee.toCoin().amount)
                      .quo(new Dec(gasConfig.gas))
                      .truncate()
                      .toString()
                  );
                })(),
              },
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
            },
            tip: "0x0",
            paymasterData: [],
            accountDeploymentData: [],
            nonceDataAvailabilityMode: "L1",
            feeDataAvailabilityMode: "L1",
          };
        }
      })();

      await signStarknetTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        interactionData.data.transactions,
        details,
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
      bottomButton={{
        isSpecial: true,
        text: intl.formatMessage({ id: "button.approve" }),
        size: "large",
        disabled: buttonDisabled,
        isLoading: signStarknetTxInteractionStore.isObsoleteInteraction(
          interactionData.id
        ),
        onClick: approve,
      }}
    >
      <Box
        height="100%"
        style={{
          overflow: "auto",
        }}
      >
        <Box padding="0.75rem 0.75rem 0" marginBottom="0.5rem">
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

              margin: "0 0.75rem",

              height: "fit-content",
              maxHeight: "23rem",
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
      </Box>
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
        margin: "0 0.75rem",

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
