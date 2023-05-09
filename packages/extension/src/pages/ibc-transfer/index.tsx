import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { useGasSimulator, useIBCTransferConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../stores";
import { IBCTransferSelectChannelView } from "./select-channel";
import { IBCTransferAmountView } from "./amount";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { ArrowLeftIcon } from "../../components/icon";
import { Box } from "../../components/box";
import { useNotification } from "../../hooks/notification";

export const IBCTransferPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, queriesStore, uiConfigStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const chainId = searchParams.get("chainId");
  const coinMinimalDenom = searchParams.get("coinMinimalDenom");

  if (!chainId || !coinMinimalDenom) {
    navigate(-1);
    return null;
  }

  const [phase, setPhase] = useState<"channel" | "amount">("channel");

  const accountInfo = accountStore.getAccount(chainId);

  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    chainStore.getChain(chainId).chainId,
    accountInfo.bech32Address,
    // TODO: 이 값을 config 밑으로 빼자
    300000,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );

  const gasSimulator = useGasSimulator(
    new ExtensionKVStore("gas-simulator.ibc.transfer"),
    chainStore,
    chainId,
    ibcTransferConfigs.gasConfig,
    ibcTransferConfigs.feeConfig,
    "native",
    () => {
      if (!ibcTransferConfigs.channelConfig.channel) {
        throw new Error("Channel not set yet");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        ibcTransferConfigs.amountConfig.uiProperties.error != null ||
        ibcTransferConfigs.recipientConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      return accountInfo.cosmos.makeIBCTransferTx(
        ibcTransferConfigs.channelConfig.channel,
        ibcTransferConfigs.amountConfig.amount[0].toDec().toString(),
        ibcTransferConfigs.amountConfig.amount[0].currency,
        ibcTransferConfigs.recipientConfig.recipient
      );
    }
  );

  const isSelectChannelPhase = phase === "channel";

  const isSelectChannelValid =
    ibcTransferConfigs.channelConfig.error == null &&
    ibcTransferConfigs.recipientConfig.uiProperties.error == null &&
    ibcTransferConfigs.memoConfig.uiProperties.error == null;

  const isAmountValid =
    ibcTransferConfigs.amountConfig.uiProperties.error == null &&
    ibcTransferConfigs.feeConfig.uiProperties.error == null &&
    ibcTransferConfigs.gasConfig.uiProperties.error == null;

  return (
    <HeaderLayout
      title="IBC Transfer"
      left={
        <Box
          paddingLeft="1rem"
          cursor="pointer"
          onClick={() => {
            if (isSelectChannelPhase) {
              navigate("/send/select-asset?isIBCTransfer=true", {
                replace: true,
              });
            } else {
              setPhase("channel");
            }
          }}
        >
          <ArrowLeftIcon />
        </Box>
      }
      bottomButton={{
        text: isSelectChannelPhase ? "Next" : "Go to sign",
        size: "large",
        onClick: async () => {
          if (isSelectChannelPhase) {
            setPhase("amount");
          } else {
            if (ibcTransferConfigs.channelConfig.channel) {
              try {
                const tx = accountInfo.cosmos.makeIBCTransferTx(
                  ibcTransferConfigs.channelConfig.channel,
                  ibcTransferConfigs.amountConfig.amount[0].toDec().toString(),
                  ibcTransferConfigs.amountConfig.amount[0].currency,
                  ibcTransferConfigs.recipientConfig.recipient
                );

                await tx.send(
                  ibcTransferConfigs.feeConfig.toStdFee(),
                  ibcTransferConfigs.memoConfig.memo,
                  {
                    preferNoSetFee: true,
                    preferNoSetMemo: true,
                  },
                  {
                    onBroadcasted: () => {
                      notification.show(
                        "success",
                        "IBC token transfer success",
                        ""
                      );
                    },
                  }
                );
              } catch (e) {
                notification.show(
                  "failed",
                  "Fail to transfer token",
                  e.message
                );
              }

              navigate("/");
            }
          }
        },
        disabled: isSelectChannelPhase ? !isSelectChannelValid : !isAmountValid,
        isLoading: accountInfo.isSendingMsg === "ibcTransfer",
      }}
    >
      {isSelectChannelPhase ? (
        <IBCTransferSelectChannelView
          chainId={chainId}
          coinMinimalDenom={coinMinimalDenom}
          channelConfig={ibcTransferConfigs.channelConfig}
          recipientConfig={ibcTransferConfigs.recipientConfig}
          memoConfig={ibcTransferConfigs.memoConfig}
        />
      ) : (
        <IBCTransferAmountView
          amountConfig={ibcTransferConfigs.amountConfig}
          feeConfig={ibcTransferConfigs.feeConfig}
          senderConfig={ibcTransferConfigs.senderConfig}
          memoConfig={ibcTransferConfigs.memoConfig}
          gasConfig={ibcTransferConfigs.gasConfig}
          gasSimulator={gasSimulator}
        />
      )}
    </HeaderLayout>
  );
});
