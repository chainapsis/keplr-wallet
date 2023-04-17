import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { ColorPalette } from "../../../styles";
import { Box } from "../../../components/box";
import { CloseIcon, PlusIcon } from "../../../components/icon";
import { useStore } from "../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { Body1, Body3 } from "../../../components/typography";
import { Stack } from "../../../components/stack";
import { Checkbox } from "../../../components/checkbox";
import { Columns } from "../../../components/column";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SettingChainListPage: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  return (
    <HeaderLayout
      title="Manage Chain List"
      left={<BackButton />}
      right={
        <Box paddingRight="1rem" cursor="pointer">
          <PlusIcon color={ColorPalette["gray-50"]} />
        </Box>
      }
    >
      <Styles.Container gutter="0.5rem">
        {chainStore.chainInfosInUI.map((chainInfo) => {
          return (
            <ChainItem
              key={chainInfo.chainIdentifier}
              chainInfo={chainInfo}
              isChecked={false}
            />
          );
        })}
      </Styles.Container>
    </HeaderLayout>
  );
});

const ItemStyles = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    height: 4.625rem;
    padding: 0 1rem;
    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.375rem;
  `,
  Content: styled(Stack)`
    flex: 1;
  `,
  ChainName: styled(Body1)`
    color: ${ColorPalette["gray-50"]};
  `,
  TokenDenom: styled(Body3)`
    color: ${ColorPalette["gray-300"]};
  `,
};

const ChainItem: FunctionComponent<{
  chainInfo: ChainInfo;
  isChecked: boolean;
}> = ({ chainInfo, isChecked }) => {
  const [checked, setChecked] = React.useState(isChecked);

  return (
    <ItemStyles.Container>
      {chainInfo.chainSymbolImageUrl && (
        <img width="48px" height="48px" src={chainInfo.chainSymbolImageUrl} />
      )}
      <ItemStyles.Content gutter="0.375rem">
        <ItemStyles.ChainName>{chainInfo.chainName}</ItemStyles.ChainName>
        <ItemStyles.TokenDenom>
          {chainInfo.currencies[0].coinDenom}
        </ItemStyles.TokenDenom>
      </ItemStyles.Content>

      <Columns sum={1} gutter="0.5rem">
        <Box cursor="pointer">
          <CloseIcon />
        </Box>

        <Checkbox
          checked={checked}
          onClick={() => {
            setChecked(!checked);
          }}
        />
      </Columns>
    </ItemStyles.Container>
  );
};
