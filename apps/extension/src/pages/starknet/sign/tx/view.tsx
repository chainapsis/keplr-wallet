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
import SimpleBar from "simplebar-react";
import { useTheme } from "styled-components";
import { Column, Columns } from "../../../../components/column";
import { Gutter } from "../../../../components/gutter";
import { H5 } from "../../../../components/typography";
import { XAxis } from "../../../../components/axis";
import { Button } from "../../../../components/button";

export const SignStarknetTxView: FunctionComponent<{
  interactionData: NonNullable<SignStarknetTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signStarknetTxInteractionStore,
    starknetAccountStore,
    starknetQueriesStore,
  } = useStore();

  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo();
  const theme = useTheme();

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
        padding="0.75rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <SimpleBar
          autoHide={false}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "0 1 auto",
            overflow: "auto",
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
          <DataView interactionData={interactionData} />
        </SimpleBar>

        <div style={{ flex: 1 }} />

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

const DataView: FunctionComponent<{
  interactionData: NonNullable<SignStarknetTxInteractionStore["waitingData"]>;
}> = ({ interactionData }) => {
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  return (
    <Box
      style={{
        width: "fit-content",
        minWidth: "100%",
      }}
    >
      {interactionData.data.transactions.map((tx, i) => {
        return (
          <Box padding="1rem" key={i}>
            <Columns sum={1}>
              <Column weight={1}>
                <Box minHeight="3rem" alignY="center">
                  <H5
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-10"]
                    }
                  >
                    {tx.entrypoint}
                  </H5>
                  <Gutter size="2px" />
                  {isOpen ? (
                    <React.Fragment>
                      <pre
                        style={{
                          width: "15rem",
                          margin: "0",
                          marginBottom: "0.5rem",
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
                      </pre>
                    </React.Fragment>
                  ) : null}
                  <XAxis>
                    <Button
                      size="extraSmall"
                      color="secondary"
                      text={
                        isOpen ? (
                          <FormattedMessage id="page.sign.components.messages.wasm-message-view.close-button" />
                        ) : (
                          <FormattedMessage id="page.sign.components.messages.wasm-message-view.details-button" />
                        )
                      }
                      onClick={() => {
                        toggleOpen();
                      }}
                    />
                  </XAxis>
                </Box>
              </Column>
            </Columns>
          </Box>
        );
      })}
    </Box>
  );
};
