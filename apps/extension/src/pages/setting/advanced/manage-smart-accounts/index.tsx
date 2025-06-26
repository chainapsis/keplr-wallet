import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStore } from "../../../../stores";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Box } from "../../../../components/box";
import { QuestionIcon, LoadingIcon } from "../../../../components/icon";
import { ColorPalette } from "../../../../styles";
import { Stack } from "../../../../components/stack";
import { Body1, Body3, Subtitle3 } from "../../../../components/typography";
import {
  ChainCapabilities,
  ChainInfo,
  DELEGATOR_ADDRESS,
  EthSignType,
  EthTransactionType,
  EthTxReceipt,
  EthTxStatus,
  UnsignedTxLike,
} from "@keplr-wallet/types";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { EmptyView } from "../../../../components/empty-view";
import { Gutter } from "../../../../components/gutter";
import { Tooltip } from "../../../../components/tooltip";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import {
  GetSupportedChainCapabilitiesForEVMMsg,
  RequestJsonRpcToEvmMsg,
  RequestSignEthereumMsg,
  SendTxEthereumMsg,
} from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { Button } from "../../../../components/button";
import { Skeleton } from "../../../../components/skeleton";
import { ZeroAddress } from "ethers";
import { useNotification } from "../../../../hooks/notification";
import { useNavigate } from "react-router";

export const SettingGeneralManageSmartAccountsPage: FunctionComponent =
  observer(() => {
    const intl = useIntl();
    const notification = useNotification();
    const { chainStore, accountStore, ethereumAccountStore } = useStore();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [loadingButtons, setLoadingButtons] = useState<
      Record<string, boolean>
    >({});
    const [supportedChainCapabilities, setSupportedChainCapabilities] =
      useState<
        {
          chainId: string;
          chainCapabilities: ChainCapabilities;
        }[]
      >([]);

    const fetchSupportedChainCapabilities = async () => {
      try {
        const msg = new GetSupportedChainCapabilitiesForEVMMsg();

        const res = await new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          msg
        );
        setSupportedChainCapabilities(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchSupportedChainCapabilities();
    }, []);

    // supportedChainCapabilities에서 chainId로 chainInfo를 찾아서 매핑
    const supportedChainsWithInfo = supportedChainCapabilities
      .map((capability) => {
        const chainInfo = chainStore.getChain(capability.chainId);
        return chainInfo
          ? {
              chainInfo,
              chainCapabilities: capability.chainCapabilities,
            }
          : null;
      })
      .filter((item) => item !== null) as Array<{
      chainInfo: any;
      chainCapabilities: ChainCapabilities;
    }>;

    const setButtonLoading = (chainId: string, loading: boolean) => {
      setLoadingButtons((prev) => ({
        ...prev,
        [chainId]: loading,
      }));
    };

    const handleAction = async (
      chainId: string,
      action: "upgrade" | "revoke"
    ) => {
      const chainInfo = chainStore.getChain(chainId);
      const evmInfo = chainInfo.evm;
      if (!evmInfo) {
        throw new Error("No EVM info provided");
      }

      setButtonLoading(chainId, true);
      try {
        const account = accountStore.getAccount(chainId);
        const ethereumAccount = ethereumAccountStore.getAccount(chainId);
        const sender = account.ethereumHexAddress;

        const transactionCount =
          (await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            new RequestJsonRpcToEvmMsg(
              "eth_getTransactionCount",
              [sender, "pending"],
              undefined,
              chainId
            )
          )) as string;

        const nonce = parseInt(transactionCount, 16);

        const unsignedTx = ethereumAccount.makeTx(sender, "0x0");

        unsignedTx.type = EthTransactionType.eip7702;
        unsignedTx.nonce = nonce;

        let authAddress: string;

        if (action === "upgrade") {
          authAddress = DELEGATOR_ADDRESS;
        } else {
          authAddress = ZeroAddress;
        }

        unsignedTx.authorizationList = [
          {
            address: authAddress,
            chainId: `0x${parseInt(chainId.replace("eip155:", ""), 10).toString(
              16
            )}`,
            nonce: nonce + 1,
            signature: {
              r: "0x0",
              s: "0x0",
              v: 0,
            },
          },
        ];

        const txLike: UnsignedTxLike = unsignedTx.toJSON();

        if (unsignedTx.authorizationList) {
          txLike.authorizationList = unsignedTx.authorizationList.map(
            (auth) => {
              console.log("auth", auth);

              return {
                address: auth.address,
                nonce: `0x${auth.nonce.toString(16)}`,
                chainId: `0x${auth.chainId.toString(16)}`,
              };
            }
          );
        }

        const msg = new RequestSignEthereumMsg(
          chainId,
          sender,
          Buffer.from(JSON.stringify(txLike)),
          EthSignType.TRANSACTION
        );

        const res = await new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          msg
        );

        const sendMsg = new SendTxEthereumMsg(chainId, res);

        const txHash = await new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          sendMsg
        );

        navigate("/", { replace: true });

        const txReceipt = (await new InExtensionMessageRequester().sendMessage(
          BACKGROUND_PORT,
          new RequestJsonRpcToEvmMsg(
            "eth_getTransactionReceipt",
            [txHash],
            undefined,
            chainId
          )
        )) as EthTxReceipt;

        if (txReceipt.status === EthTxStatus.Success) {
          notification.show(
            "success",
            intl.formatMessage({
              id: "notification.transaction-success",
            }),
            ""
          );
        } else {
          notification.show(
            "failed",
            intl.formatMessage({ id: "error.transaction-failed" }),
            ""
          );
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
      } finally {
        setButtonLoading(chainId, false);
      }
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <Stack gutter="0.5rem">
            {[1, 2, 3].map((index) => (
              <Skeleton key={index} type="default" isNotReady={true}>
                <Box
                  backgroundColor={ColorPalette["gray-10"]}
                  borderRadius="0.375rem"
                  paddingX="1rem"
                  paddingY="1rem"
                  height="5rem"
                />
              </Skeleton>
            ))}
          </Stack>
        );
      }

      if (supportedChainsWithInfo.length === 0) {
        return (
          <React.Fragment>
            <Gutter size="9.25rem" direction="vertical" />
            <EmptyView>
              <Subtitle3>
                <FormattedMessage id="page.setting.general.delete-suggest-chain.empty-text" />
              </Subtitle3>
            </EmptyView>
          </React.Fragment>
        );
      }

      return supportedChainsWithInfo.map((item) => (
        <ChainItem
          key={item.chainInfo.chainIdentifier}
          chainInfo={item.chainInfo}
          chainCapabilities={item.chainCapabilities}
          isLoading={loadingButtons[item.chainInfo.chainId] || false}
          onUpgrade={() => handleAction(item.chainInfo.chainId, "upgrade")}
          onRevoke={() => handleAction(item.chainInfo.chainId, "revoke")}
        />
      ));
    };

    return (
      <HeaderLayout
        title={intl.formatMessage({
          id: "page.setting.advanced.manage-smart-accounts-title",
        })}
        left={<BackButton />}
      >
        <Box paddingX="0.75rem">
          <Stack gutter="0.5rem">{renderContent()}</Stack>
        </Box>
      </HeaderLayout>
    );
  });

const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
  chainCapabilities: ChainCapabilities;
  isLoading?: boolean;
  onUpgrade?: () => void;
  onRevoke?: () => void;
}> = ({
  chainInfo,
  chainCapabilities,
  isLoading = false,
  onUpgrade,
  onRevoke,
}) => {
  const intl = useIntl();
  const theme = useTheme();

  const atomicStatus = chainCapabilities.atomic.status;

  const renderActionButton = () => {
    switch (atomicStatus) {
      case "supported":
        return (
          <Button
            size="small"
            color="danger"
            disabled={isLoading}
            onClick={onRevoke}
            text={intl.formatMessage({
              id: "page.setting.advanced.manage-smart-accounts.revoke-button",
            })}
            left={
              isLoading ? (
                <LoadingIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette.white}
                />
              ) : undefined
            }
          />
        );
      case "ready":
        return (
          <Button
            size="small"
            color="primary"
            disabled={isLoading}
            onClick={onUpgrade}
            text={intl.formatMessage({
              id: "page.setting.advanced.manage-smart-accounts.upgrade-button",
            })}
            left={
              isLoading ? (
                <LoadingIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette.white}
                />
              ) : undefined
            }
          />
        );
      case "unsupported":
      default:
        return (
          <Body3 color={ColorPalette["gray-300"]}>
            {intl.formatMessage({
              id: "page.setting.advanced.manage-smart-accounts.unsupported",
            })}
          </Body3>
        );
    }
  };

  const getStatusText = () => {
    switch (atomicStatus) {
      case "supported":
        return intl.formatMessage({
          id: "page.setting.advanced.manage-smart-accounts.status-upgraded",
        });
      case "ready":
        return intl.formatMessage({
          id: "page.setting.advanced.manage-smart-accounts.status-ready",
        });
      case "unsupported":
      default:
        return intl.formatMessage({
          id: "page.setting.advanced.manage-smart-accounts.status-unsupported",
        });
    }
  };

  return (
    <Box
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-600"]
      }
      borderRadius="0.375rem"
      paddingX="1rem"
      paddingY="1rem"
    >
      <Columns sum={1} alignY="center" gutter="0.375rem">
        <Box borderRadius="99999px">
          <ChainImageFallback chainInfo={chainInfo} size="3rem" />
        </Box>
        <Stack gutter="0.375rem">
          <Columns sum={1} alignY="center" gutter="0.25rem">
            <Body1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-50"]
              }
            >
              {chainInfo.chainName}
            </Body1>
            <Tooltip
              content={intl.formatMessage({
                id: "page.setting.advanced.manage-smart-accounts.chain-item.tooltip-text",
              })}
            >
              <QuestionIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              />
            </Tooltip>
          </Columns>
          <Body3 color={ColorPalette["gray-300"]}>{getStatusText()}</Body3>
        </Stack>

        <Column weight={1} />

        {renderActionButton()}
      </Columns>
    </Box>
  );
};
