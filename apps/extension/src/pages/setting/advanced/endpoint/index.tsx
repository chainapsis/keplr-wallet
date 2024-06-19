import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { GuideBox } from "../../../../components/guide-box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { Dropdown } from "../../../../components/dropdown";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { TextInput } from "../../../../components/input";
import { useForm } from "react-hook-form";
import {
  checkEvmRpcConnectivity,
  checkRestConnectivity,
  checkRPCConnectivity,
  DifferentChainVersionError,
} from "@keplr-wallet/chain-validator";
import { useNotification } from "../../../../hooks/notification";
import { useConfirm } from "../../../../hooks/confirm";
import { GetChainOriginalEndpointsMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { FormattedMessage, useIntl } from "react-intl";
import { StakeWithKeplrDashboardButton } from "../../../main/components";
import { ColorPalette } from "../../../../styles";
import { ArrowTopRightOnSquareIcon } from "../../../../components/icon";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Gutter } from "../../../../components/gutter";

const Styles = {
  Container: styled(Stack)`
    height: 100%;
    padding: 0 0.75rem;
  `,
  Flex1: styled.div`
    flex: 1;
  `,
};

export const SettingAdvancedEndpointPage: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const notification = useNotification();
  const confirm = useConfirm();
  const intl = useIntl();

  const [chainId, setChainId] = useState<string>(
    chainStore.chainInfos[0].chainId
  );
  const [originalEndpoint, setOriginalEndpoint] = useState<
    | {
        rpc: string;
        rest: string;
        evmRpc?: string;
      }
    | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const chainInfo = chainStore.getChain(chainId);
  const { setValue, watch, register, handleSubmit } = useForm<{
    rpc: string;
    lcd: string;
    evmRpc?: string;
  }>({
    defaultValues: {
      rpc: chainStore.getChain(chainId).rpc,
      lcd: chainStore.getChain(chainId).rest,
      evmRpc: chainStore.getChain(chainId).evm?.rpc,
    },
  });

  const chainList = chainStore.chainInfosInUI.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  useEffect(() => {
    setValue("rpc", chainInfo.rpc);
    setValue("lcd", chainInfo.rest);
    setValue("evmRpc", chainInfo.evm?.rpc);

    const msg = new GetChainOriginalEndpointsMsg(chainId);
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((r) => {
        setOriginalEndpoint(r);
      })
      .catch((e) => {
        console.log(e);

        setOriginalEndpoint(undefined);
      });
  }, [chainId, chainInfo, setValue]);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.setting.advanced.change-endpoints-title",
      })}
      fixedHeight={true}
      left={<BackButton />}
      bottomButton={{
        text: intl.formatMessage({
          id: "button.confirm",
        }),
        color: "primary",
        size: "large",
        isLoading,
        disabled:
          chainInfo.rpc === watch("rpc") &&
          chainInfo.rest === watch("lcd") &&
          chainInfo.evm?.rpc === watch("evmRpc"),
      }}
      onSubmit={handleSubmit(async (data) => {
        setIsLoading(true);

        try {
          if (
            !originalEndpoint ||
            originalEndpoint.rpc !== data.rpc ||
            originalEndpoint.rpc !== data.lcd ||
            originalEndpoint.evmRpc !== data.evmRpc
          ) {
            try {
              if (originalEndpoint?.rpc !== data.rpc) {
                try {
                  await checkRPCConnectivity(chainId, data.rpc);
                } catch (e) {
                  if (
                    // In the case of this error, the chain version is different.
                    // It gives a warning and handles it if the user wants.
                    e instanceof DifferentChainVersionError
                  ) {
                    if (
                      !(await confirm.confirm(
                        "Different chain id",
                        "The RPC endpoint of the node might have different version with the registered chain. Do you want to proceed?"
                      ))
                    ) {
                      throw e;
                    }
                  } else {
                    throw e;
                  }
                }
              }

              if (originalEndpoint?.rest !== data.lcd) {
                try {
                  await checkRestConnectivity(chainId, data.lcd);
                } catch (e) {
                  if (
                    // In the case of this error, the chain version is different.
                    // It gives a warning and handles it if the user wants.
                    e instanceof DifferentChainVersionError
                  ) {
                    if (
                      !(await confirm.confirm(
                        "Different chain id",
                        "The LCD endpoint of the node might have different version with the registered chain. Do you want to proceed?"
                      ))
                    ) {
                      throw e;
                    }
                  } else {
                    throw e;
                  }
                }
              }

              if (
                data.evmRpc != null &&
                chainInfo.evm != null &&
                originalEndpoint?.evmRpc !== data.evmRpc
              ) {
                await checkEvmRpcConnectivity(
                  chainInfo.evm.chainId,
                  data.evmRpc
                );
              }
            } catch (e) {
              console.error(e);

              notification.show(
                "failed",
                intl.formatMessage({ id: "error.failed-to-set-endpoints" }),
                e.message || e.toString()
              );

              return;
            }
          }

          if (
            originalEndpoint &&
            originalEndpoint.rpc == data.rpc &&
            originalEndpoint.rest == data.lcd &&
            originalEndpoint.evmRpc == data.evmRpc
          ) {
            await chainStore.resetChainEndpoints(chainId);
          } else {
            await chainStore.setChainEndpoints(
              chainId,
              data.rpc,
              data.lcd,
              data.evmRpc
            );
          }

          await confirm.confirm(
            intl.formatMessage({
              id: "page.setting.advanced.endpoint.confirm-title",
            }),
            intl.formatMessage({
              id: "page.setting.advanced.endpoint.confirm-paragraph",
            }),
            {
              forceYes: true,
            }
          );

          window.close();
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      })}
    >
      <Styles.Container gutter="1rem">
        <Columns sum={1} alignY="center">
          <Box width="13rem">
            <Dropdown
              items={chainList}
              selectedItemKey={chainId}
              onSelect={setChainId}
              allowSearch={true}
            />
          </Box>

          <Column weight={1} />
          <Button
            size="extraSmall"
            text={intl.formatMessage({
              id: "page.setting.advanced.endpoint.reset-button",
            })}
            color="secondary"
            disabled={(() => {
              if (!originalEndpoint) {
                return true;
              }

              return (
                originalEndpoint.rpc === watch("rpc") &&
                originalEndpoint.rest === watch("lcd") &&
                originalEndpoint.evmRpc === watch("evmRpc")
              );
            })()}
            onClick={() => {
              if (originalEndpoint) {
                setValue("rpc", originalEndpoint.rpc);
                setValue("lcd", originalEndpoint.rest);
                setValue("evmRpc", originalEndpoint.evmRpc);
              }
            }}
          />
        </Columns>

        <TextInput label="RPC" {...register("rpc")} />
        <TextInput label="LCD" {...register("lcd")} />
        {chainInfo.evm && (
          <React.Fragment>
            <TextInput label="EVM RPC" {...register("evmRpc")} />
            <Gutter size="0" />
          </React.Fragment>
        )}

        {ChainIdHelper.parse(chainId).identifier === "axelar-dojo" ? (
          <StakeWithKeplrDashboardButton
            type="button"
            onClick={(e) => {
              e.preventDefault();

              browser.tabs.create({
                url: "https://points.lavanet.xyz/register?code=KEPLR",
              });
            }}
          >
            <FormattedMessage id="page.setting.advanced.endpoint.lava-link-button" />

            <Box color={ColorPalette["gray-300"]} marginLeft="0.5rem">
              <ArrowTopRightOnSquareIcon width="1rem" height="1rem" />
            </Box>
          </StakeWithKeplrDashboardButton>
        ) : null}

        <Styles.Flex1 />

        <GuideBox
          title={intl.formatMessage({
            id: "page.setting.advanced.endpoint.guide-title",
          })}
          paragraph={
            <Box>
              <FormattedMessage
                id="page.setting.advanced.endpoint.guide-paragraph"
                values={{ br: <br /> }}
              />
            </Box>
          }
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
