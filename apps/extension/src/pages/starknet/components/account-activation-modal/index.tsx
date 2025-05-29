import { observer, useLocalObservable } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { Body2, Subtitle1 } from "../../../../components/typography";
import { Stack } from "../../../../components/stack";
import { Dropdown } from "../../../../components/dropdown";
import {
  useFeeConfig,
  useGasConfig,
  useGasSimulator,
  useNoopAmountConfig,
  useSenderConfig,
  useTxConfigsValidate,
} from "@keplr-wallet/hooks-starknet";
import { Button } from "../../../../components/button";
import { Column, Columns } from "../../../../components/column";
import {
  SubmitStarknetTxHashMsg,
  GetStarknetKeyParamsSelectedMsg,
  PlainObject,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT, KeplrError } from "@keplr-wallet/router";
import { FeeControl } from "../input/fee-control";
import { ExtensionKVStore, sleep } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { num } from "starknet";
import { useNotification } from "../../../../hooks/notification";
import { connectAndSignDeployAccountTxWithLedger } from "../../../sign/utils/handle-starknet-sign";
import { ErrModuleLedgerSign } from "../../../sign/utils/ledger-types";
import { LedgerGuideBox } from "../../../sign/components/ledger-guide-box";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

export const AccountActivationModal: FunctionComponent<{
  close: () => void;
  goBack: () => void;
  chainId: string;

  onAccountDeployed?: () => void;

  data?: {
    keyInsensitive: PlainObject;
    isEthereum: boolean;
  };
}> = observer(({ close, goBack, chainId, onAccountDeployed, data }) => {
  const {
    chainStore,
    accountStore,
    starknetQueriesStore,
    starknetAccountStore,
    keyRingStore,
  } = useStore();

  const theme = useTheme();

  const intl = useIntl();
  const account = accountStore.getAccount(chainId);
  const starknetQueries = starknetQueriesStore.get(chainId);

  const sender = account.starknetHexAddress;
  const senderConfig = useSenderConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    sender
  );
  const amountConfig = useNoopAmountConfig(chainStore, chainId, senderConfig);
  const gasConfig = useGasConfig(chainStore, chainId);
  const feeConfig = useFeeConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  const modularChainInfo = chainStore.getModularChain(senderConfig.chainId);
  if (!("starknet" in modularChainInfo)) {
    throw new Error("This chain doesn't support starknet");
  }
  const starknet = modularChainInfo.starknet;

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

  useEffect(() => {
    starknetQueries.queryAccountNonce
      .getNonce(account.starknetHexAddress)
      .fetch();
    if (feeConfig.fee != null) {
      starknetQueries.queryStarknetERC20Balance
        .getBalance(
          chainId,
          chainStore,
          account.starknetHexAddress,
          feeConfig.fee.currency.coinMinimalDenom
        )
        ?.fetch();
    }
  }, []);

  const gasSimulatorKey = feeConfig.type;
  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.starknet.account-activation"),
    chainStore,
    chainId,
    gasConfig,
    feeConfig,
    gasSimulatorKey,
    () => {
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

      return {
        simulate: async (): Promise<{
          gasUsed: number;
        }> => {
          noop(gasSimulationRefresher.count);

          const msg = new GetStarknetKeyParamsSelectedMsg(senderConfig.chainId);
          const params = await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );

          const estimateResult = await starknetAccountStore
            .getAccount(chainId)
            .estimateDeployAccount(
              accountStore.getAccount(senderConfig.chainId).starknetHexAddress,
              "0x" + Buffer.from(params.classHash).toString("hex"),
              // If account is with Ledger, must use the Starknet public key, not the secp256k1 public key.
              account.isNanoLedger
                ? [
                    "0x" +
                      Buffer.from(params.pubKey.slice(0, 32)).toString("hex"),
                  ]
                : [
                    "0x" + Buffer.from(params.xLow).toString("hex"),
                    "0x" + Buffer.from(params.xHigh).toString("hex"),
                    "0x" + Buffer.from(params.yLow).toString("hex"),
                    "0x" + Buffer.from(params.yHigh).toString("hex"),
                  ],
              "0x" + Buffer.from(params.salt).toString("hex"),
              type === "ETH" ? feeContractAddress : undefined
            );

          const {
            l1_gas_consumed,
            l1_gas_price,
            l2_gas_consumed,
            l2_gas_price,
            l1_data_gas_consumed,
            l1_data_gas_price,
          } = estimateResult;

          const l1Fee = new Dec(l1_gas_consumed).mul(new Dec(l1_gas_price));
          const l2Fee = new Dec(l2_gas_consumed ?? 0).mul(
            new Dec(l2_gas_price ?? 0)
          );
          const l1DataFee = new Dec(l1_data_gas_consumed).mul(
            new Dec(l1_data_gas_price)
          );

          const calculatedOverallFee = l1Fee.add(l2Fee).add(l1DataFee);

          const gasMargin = new Dec(1.2);
          const gasPriceMargin = new Dec(1.5);

          const totalGasConsumed = new Dec(l1_gas_consumed)
            .add(new Dec(l2_gas_consumed ?? 0))
            .add(new Dec(l1_data_gas_consumed));

          const adjustedGasPrice = calculatedOverallFee.quo(totalGasConsumed);

          const gasPrice = new CoinPretty(feeCurrency, adjustedGasPrice);
          const maxGasPrice = gasPrice.mul(gasPriceMargin);
          const maxGas = totalGasConsumed.mul(gasMargin);

          feeConfig.setGasPrice({
            gasPrice: gasPrice,
            maxGasPrice: maxGasPrice,
          });

          return {
            gasUsed: parseInt(maxGas.truncate().toString()),
          };
        },
      };
    }
  );

  const { interactionBlocked } = useTxConfigsValidate({
    gasConfig,
    feeConfig,
    gasSimulator,
  });

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const notification = useNotification();

  const starknetAccount = starknetAccountStore.getAccount(chainId);

  return (
    <Styles.Container>
      <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
        <Subtitle1>
          <FormattedMessage id="page.starknet.components.account-activation-modal.title" />
        </Subtitle1>
      </Box>

      <Stack gutter="1.25rem">
        <Box marginLeft="0.5rem" marginRight="0.5rem">
          <Body2 style={{ lineHeight: 1.5 }}>
            <FormattedMessage
              id="page.starknet.components.account-activation-modal.description"
              values={{
                br: <br />,
              }}
            />
          </Body2>
        </Box>
        <Dropdown
          label={intl.formatMessage({
            id: "components.input.fee-control.modal.fee-token-dropdown-label",
          })}
          menuContainerMaxHeight="10rem"
          items={["ETH", "STRK"].map((type) => {
            return {
              key: type,
              label: type,
            };
          })}
          selectedItemKey={feeConfig.type}
          onSelect={(key) => {
            feeConfig.setType(key as "ETH" | "STRK");
          }}
          size="large"
        />
        <FeeControl
          senderConfig={senderConfig}
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          gasSimulator={gasSimulator}
          disableClick
        />
        <LedgerGuideBox
          data={
            data || {
              keyInsensitive: keyRingStore.selectedKeyInfo!.insensitive,
              isStarknet: true,
            }
          }
          isLedgerInteracting={isLedgerInteracting}
          ledgerInteractingError={ledgerInteractingError}
          isInternal={true}
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-50"]
              : ColorPalette["gray-650"]
          }
        />
        <Columns sum={1} gutter="0.75rem">
          <Column weight={1}>
            <Button
              type="button"
              text={intl.formatMessage({
                id: "button.back",
              })}
              color="secondary"
              size="large"
              onClick={() => {
                goBack();
              }}
            />
          </Column>

          <Column weight={1}>
            <Button
              type="button"
              text={
                starknetAccount.isDeployingAccount
                  ? `${intl.formatMessage({
                      id: "button.activating",
                    })}...`
                  : intl.formatMessage({
                      id: "button.activate",
                    })
              }
              size="large"
              disabled={
                interactionBlocked ||
                starknetAccount.isDeployingAccount ||
                isLedgerInteracting
              }
              onClick={async () => {
                if (feeConfig.maxFee && feeConfig.maxGasPrice) {
                  starknetAccount.setIsDeployingAccount(true);

                  try {
                    const msg = new GetStarknetKeyParamsSelectedMsg(
                      senderConfig.chainId
                    );
                    const params =
                      await new InExtensionMessageRequester().sendMessage(
                        BACKGROUND_PORT,
                        msg
                      );

                    const type = feeConfig.type;
                    const feeContractAddress =
                      type === "ETH"
                        ? starknet.ethContractAddress
                        : starknet.strkContractAddress;
                    const feeCurrency = chainStore
                      .getModularChainInfoImpl(chainId)
                      .getCurrencies("starknet")
                      .find(
                        (cur) =>
                          cur.coinMinimalDenom === `erc20:${feeContractAddress}`
                      );
                    if (!feeCurrency) {
                      throw new Error("Can't find fee currency");
                    }

                    const addressSalt =
                      "0x" + Buffer.from(params.salt).toString("hex");
                    const classHash =
                      "0x" + Buffer.from(params.classHash).toString("hex");

                    if (account.isNanoLedger) {
                      setIsLedgerInteracting(true);
                      setLedgerInteractingError(undefined);
                    }

                    const constructorCalldata = account.isNanoLedger
                      ? [
                          "0x" +
                            Buffer.from(params.starknetPubKey).toString("hex"),
                        ]
                      : [
                          "0x" + Buffer.from(params.xLow).toString("hex"),
                          "0x" + Buffer.from(params.xHigh).toString("hex"),
                          "0x" + Buffer.from(params.yLow).toString("hex"),
                          "0x" + Buffer.from(params.yHigh).toString("hex"),
                        ];
                    const preSigned = account.isNanoLedger
                      ? await connectAndSignDeployAccountTxWithLedger(
                          chainId,
                          params.pubKey,
                          {
                            addressSalt,
                            classHash,
                            constructorCalldata,
                            contractAddress: account.starknetHexAddress,
                          },
                          (() => {
                            if (type === "ETH") {
                              return {
                                type: "ETH",
                                maxFee: feeConfig.maxFee.toCoin().amount,
                              };
                            } else if (type === "STRK") {
                              return {
                                type: "STRK",
                                gas: gasConfig.gas.toString(),
                                maxGasPrice: num.toHex(
                                  feeConfig.maxGasPrice.toCoin().amount
                                ),
                              };
                            } else {
                              throw new Error("Invalid fee type");
                            }
                          })()
                        )
                      : undefined;

                    const { transaction_hash: txHash } =
                      await starknetAccount.deployAccountWithFee(
                        accountStore.getAccount(senderConfig.chainId)
                          .starknetHexAddress,
                        classHash,
                        constructorCalldata,
                        addressSalt,
                        {
                          l1MaxGas: gasConfig.gas.toString(),
                          l1MaxGasPrice: num.toHex(
                            feeConfig.maxGasPrice.toCoin().amount
                          ),
                          l1MaxDataGas: "0",
                          l1MaxDataGasPrice: "0",
                          paymaster:
                            feeConfig.type === "ETH"
                              ? {
                                  mode: "default",
                                  gasToken: starknet.ethContractAddress,
                                }
                              : undefined,
                        },
                        preSigned
                      );

                    new InExtensionMessageRequester()
                      .sendMessage(
                        BACKGROUND_PORT,
                        new SubmitStarknetTxHashMsg(chainId, txHash)
                      )
                      .then(() => {
                        notification.show(
                          "success",
                          intl.formatMessage({
                            id: "notification.transaction-success",
                          }),
                          ""
                        );
                        const starknetQueries =
                          starknetQueriesStore.get(chainId);

                        (async () => {
                          // tx commit 이후의 state sync 시점이 이싱해서 일단 성공할때까지 2초 쉬면서 refresh 해본다.
                          const maxRetry = 15;
                          let retry = 0;
                          while (retry < maxRetry) {
                            const res = await starknetQueries.queryAccountNonce
                              .getNonce(account.starknetHexAddress)
                              .waitFreshResponse();
                            if (res?.data) {
                              starknetAccount.setIsDeployingAccount(false);

                              const modularChainInfo =
                                chainStore.getModularChain(chainId);
                              if ("starknet" in modularChainInfo) {
                                const starknet = modularChainInfo.starknet;
                                const ethCurrency = starknet.currencies.find(
                                  (cur) =>
                                    cur.coinMinimalDenom ===
                                    `erc20:${starknet.ethContractAddress}`
                                );
                                const strkCurrency = starknet.currencies.find(
                                  (cur) =>
                                    cur.coinMinimalDenom ===
                                    `erc20:${starknet.strkContractAddress}`
                                );
                                if (ethCurrency) {
                                  starknetQueries.queryStarknetERC20Balance
                                    .getBalance(
                                      chainId,
                                      chainStore,
                                      account.starknetHexAddress,
                                      ethCurrency.coinMinimalDenom
                                    )
                                    ?.fetch();
                                }
                                if (strkCurrency) {
                                  starknetQueries.queryStarknetERC20Balance
                                    .getBalance(
                                      chainId,
                                      chainStore,
                                      account.starknetHexAddress,
                                      strkCurrency.coinMinimalDenom
                                    )
                                    ?.fetch();
                                }
                              }

                              if (onAccountDeployed) {
                                onAccountDeployed();
                              }
                              close();
                              break;
                            }

                            retry++;

                            await sleep(2000);
                          }
                        })();
                      })
                      .catch((e) => {
                        starknetAccount.setIsDeployingAccount(false);
                        goBack();
                        console.log(e);
                      });
                  } catch (e) {
                    starknetAccount.setIsDeployingAccount(false);

                    if (
                      e instanceof KeplrError &&
                      e.module === ErrModuleLedgerSign
                    ) {
                      setLedgerInteractingError(e);
                    } else {
                      setLedgerInteractingError(undefined);

                      goBack();
                      console.log(e);
                    }
                  } finally {
                    setIsLedgerInteracting(false);
                  }
                }
              }}
            />
          </Column>
        </Columns>
      </Stack>
    </Styles.Container>
  );
});

const noop = (..._args: any[]) => {
  // noop
};
