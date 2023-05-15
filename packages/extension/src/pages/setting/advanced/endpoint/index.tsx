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
  checkRestConnectivity,
  checkRPCConnectivity,
} from "@keplr-wallet/chain-validator";
import { useNotification } from "../../../../hooks/notification";
import { useConfirm } from "../../../../hooks/confirm";
import { GetChainOriginalEndpointsMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

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

  const [chainId, setChainId] = useState<string>(
    chainStore.chainInfos[0].chainId
  );
  const [originalEndpoint, setOriginalEndpoint] = useState<
    | {
        rpc: string;
        rest: string;
      }
    | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const { setValue, watch, register, handleSubmit } = useForm<{
    rpc: string;
    lcd: string;
  }>({
    defaultValues: {
      rpc: chainStore.getChain(chainId).rpc,
      lcd: chainStore.getChain(chainId).rest,
    },
  });

  const chainList = chainStore.chainInfosInUI.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  useEffect(() => {
    const chainInfo = chainStore.getChain(chainId);
    setValue("rpc", chainInfo.rpc);
    setValue("lcd", chainInfo.rest);

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
  }, [chainId, chainStore, setValue]);

  return (
    <HeaderLayout
      title="Change Endpoints"
      fixedHeight={true}
      left={<BackButton />}
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        isLoading,
        disabled:
          chainStore.getChain(chainId).rpc === watch("rpc") &&
          chainStore.getChain(chainId).rest === watch("lcd"),
      }}
      onSubmit={handleSubmit(async (data) => {
        setIsLoading(true);

        try {
          if (
            !originalEndpoint ||
            originalEndpoint.rpc !== data.rpc ||
            originalEndpoint.rpc !== data.lcd
          ) {
            try {
              if (originalEndpoint?.rpc !== data.rpc) {
                await checkRPCConnectivity(chainId, data.rpc);
              }
              if (originalEndpoint?.rest !== data.lcd) {
                await checkRestConnectivity(chainId, data.lcd);
              }
            } catch (e) {
              console.error(e);

              notification.show(
                "failed",
                "Failed to set endpoints",
                e.message || e.toString()
              );

              return;
            }
          }

          if (
            originalEndpoint &&
            originalEndpoint.rpc == data.rpc &&
            originalEndpoint.rest == data.lcd
          ) {
            await chainStore.resetChainEndpoints(chainId);
          } else {
            await chainStore.setChainEndpoints(chainId, data.rpc, data.lcd);
          }

          await confirm.confirm(
            "Set endpoints",
            "You need to restart Keplr to apply changes",
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
        <Columns sum={1} alignY="bottom">
          <Box width="13rem">
            <Dropdown
              items={chainList}
              selectedItemKey={chainId}
              onSelect={setChainId}
            />
          </Box>

          <Column weight={1} />
          <Button
            size="extraSmall"
            text="Reset"
            color="secondary"
            disabled={(() => {
              if (!originalEndpoint) {
                return true;
              }

              return (
                originalEndpoint.rpc === watch("rpc") &&
                originalEndpoint.rest === watch("lcd")
              );
            })()}
            onClick={() => {
              if (originalEndpoint) {
                setValue("rpc", originalEndpoint.rpc);
                setValue("lcd", originalEndpoint.rest);
              }
            }}
          />
        </Columns>

        <TextInput label="RPC" {...register("rpc")} />
        <TextInput label="LCD" {...register("lcd")} />

        <Styles.Flex1 />

        <GuideBox
          title="Experimental Feature"
          paragraph={
            <Box>
              Please get in touch with the endpoint providers to address any
              issues that may arise from changes to the endpoint(s).
              <br />
              <br />
              Restart Keplr to apply changes.
            </Box>
          }
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
