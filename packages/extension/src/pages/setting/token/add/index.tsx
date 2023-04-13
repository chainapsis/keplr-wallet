import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { TextInput } from "../../../../components/input";
import { useStore } from "../../../../stores";
import { DropDown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";

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

export const SettingTokenAddPage: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const [chainId, setChainId] = useState<string>(
    chainStore.chainInfos[0].chainId
  );

  const items = chainStore.chainInfosInUI.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  return (
    <HeaderLayout title="Add Token" left={<BackButton />}>
      <form>
        <Styles.Container gutter="1rem">
          <Box width="13rem">
            <DropDown
              items={items}
              selectedItemKey={chainId}
              onSelect={setChainId}
            />
          </Box>

          <TextInput label="Contract Address" />
          <TextInput label="Name" value="-" disabled />
          <TextInput label="Symbol" value="-" disabled />
          <TextInput label="Decimals" value="-" disabled />

          <Styles.BottomButton>
            <Button text="Confirm" color="secondary" size="large" />
          </Styles.BottomButton>
        </Styles.Container>
      </form>
    </HeaderLayout>
  );
});
