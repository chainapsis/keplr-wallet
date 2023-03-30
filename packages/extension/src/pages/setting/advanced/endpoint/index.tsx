import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { GuideBox } from "../../../../components/guide-box";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { DropDown } from "../../../../components/dropdown";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { TextInput } from "../../../../components/input";
import { useForm } from "react-hook-form";
import {
  checkRestConnectivity,
  checkRPCConnectivity,
} from "@keplr-wallet/chain-validator";
import { useNavigate } from "react-router";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
  BottomButton: styled.div`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
  `,
};

export const SettingAdvancedEndpointPage: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const navigate = useNavigate();

  const [chainId, setChainId] = useState<string>(
    chainStore.chainInfos[0].chainId
  );

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
  }, [chainId]);

  const onClickResetButton = async (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event?.preventDefault();
    try {
      await chainStore.resetChainEndpoints(chainId);

      const chainInfo = chainStore.getChain(chainId);

      setValue("rpc", chainInfo.rpc);
      setValue("lcd", chainInfo.rest);

      // To avoid confusion when the user returns to the main page, select the chain if the rpc/lcd endpoints have changed.
      chainStore.selectChain(chainId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <HeaderLayout title="Endpoints" left={<BackButton />}>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            try {
              await checkRPCConnectivity(chainId, data.rpc);
              await checkRestConnectivity(chainId, data.lcd);
            } catch (e) {
              console.error(e);
            }

            chainStore.setChainEndpoints(chainId, data.rpc, data.lcd);

            // To avoid confusion when the user returns to the main page, select the chain if the rpc/lcd endpoints have changed.
            chainStore.selectChain(chainId);

            navigate("/");
          } catch (e) {
            console.error(e);
          }
        })}
      >
        <Styles.Container gutter="1rem">
          <GuideBox
            title="Experimental Feature"
            paragraph="For the brave-hearted cosmonaauts"
          />

          <Columns sum={1} alignY="bottom">
            <Box width="13rem">
              <DropDown
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
              onClick={onClickResetButton}
            />
          </Columns>

          <TextInput label="RPC" {...register("rpc")} />

          <TextInput label="LCD" {...register("lcd")} />

          <Styles.BottomButton>
            <Button
              text="Confirm"
              color="secondary"
              disabled={
                chainStore.getChain(chainId).rpc === watch("rpc") &&
                chainStore.getChain(chainId).rest === watch("lcd")
              }
            />
          </Styles.BottomButton>
        </Styles.Container>
      </form>
    </HeaderLayout>
  );
});
