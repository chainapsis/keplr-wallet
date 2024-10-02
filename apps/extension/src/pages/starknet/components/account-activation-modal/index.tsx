import { observer, useLocalObservable } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { useStore } from "../../../../stores";
import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";
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
import { GetStarknetKeyParamsMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { FeeControl } from "../input/fee-control";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { num } from "starknet";
import { useNotification } from "../../../../hooks/notification";

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
}> = observer(({ close, goBack, chainId }) => {
  const {
    chainStore,
    accountStore,
    starknetQueriesStore,
    starknetAccountStore,
  } = useStore();

  const intl = useIntl();
  const account = accountStore.getAccount(chainId);

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

          const msg = new GetStarknetKeyParamsMsg(senderConfig.chainId);
          const params = await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );

          const res = await starknetAccountStore
            .getAccount(chainId)
            .estimateDeployAccount(
              accountStore.getAccount(senderConfig.chainId).starknetHexAddress,
              "0x" + Buffer.from(params.classHash).toString("hex"),
              [
                "0x" + Buffer.from(params.xLow).toString("hex"),
                "0x" + Buffer.from(params.xHigh).toString("hex"),
                "0x" + Buffer.from(params.yLow).toString("hex"),
                "0x" + Buffer.from(params.yHigh).toString("hex"),
              ],
              "0x" + Buffer.from(params.salt).toString("hex"),
              feeConfig.type
            );

          if (type === "ETH") {
            // ETH 타입에서 gas는 필요없기 때문에 대충 고정값으로 처리한다.
            const gas = 100000;
            const fee = new CoinPretty(feeCurrency, res.suggestedMaxFee);
            const maxFee = new CoinPretty(
              feeCurrency,
              new Dec(res.suggestedMaxFee).mul(new Dec(1.1))
            );
            feeConfig.setGasPrice({
              gasPrice: fee.quo(new Dec(gas)),
              maxGasPrice: maxFee.quo(new Dec(gas)),
            });

            return {
              gasUsed: gas,
            };
          } else {
            const gas = new Dec(
              num.toBigInt(res.resourceBounds.l1_gas.max_amount)
            ).mul(new Dec("1.1"));
            const gasPrice = new Dec(
              num.toBigInt(res.resourceBounds.l1_gas.max_price_per_unit)
            );
            const maxGasPrice = gasPrice.mul(new Dec("1.1"));
            feeConfig.setGasPrice({
              gasPrice: new CoinPretty(feeCurrency, gasPrice),
              maxGasPrice: new CoinPretty(feeCurrency, maxGasPrice),
            });
            return {
              gasUsed: Math.ceil(parseFloat(gas.toString())),
            };
          }
        },
      };
    }
  );

  const { interactionBlocked } = useTxConfigsValidate({
    gasConfig,
    feeConfig,
    gasSimulator,
  });

  const notification = useNotification();

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
              text={intl.formatMessage({
                id: "button.activate",
              })}
              size="large"
              disabled={interactionBlocked}
              onClick={async () => {
                try {
                  const msg = new GetStarknetKeyParamsMsg(senderConfig.chainId);
                  const params =
                    await new InExtensionMessageRequester().sendMessage(
                      BACKGROUND_PORT,
                      msg
                    );

                  starknetAccountStore
                    .getAccount(senderConfig.chainId)
                    .deployAccount(
                      accountStore.getAccount(senderConfig.chainId)
                        .starknetHexAddress,
                      "0x" + Buffer.from(params.classHash).toString("hex"),
                      [
                        "0x" + Buffer.from(params.xLow).toString("hex"),
                        "0x" + Buffer.from(params.xHigh).toString("hex"),
                        "0x" + Buffer.from(params.yLow).toString("hex"),
                        "0x" + Buffer.from(params.yHigh).toString("hex"),
                      ],
                      "0x" + Buffer.from(params.salt).toString("hex"),
                      feeConfig.type,
                      {
                        onFulfilled: (res) => {
                          console.log("res", res);
                          notification.show(
                            "success",
                            intl.formatMessage({
                              id: "notification.transaction-success",
                            }),
                            ""
                          );
                        },
                        onBroadcastFailed: () => {
                          notification.show(
                            "failed",
                            intl.formatMessage({
                              id: "error.transaction-failed",
                            }),
                            ""
                          );
                        },
                      }
                    );

                  close();
                } catch (e) {
                  console.log(e);
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
