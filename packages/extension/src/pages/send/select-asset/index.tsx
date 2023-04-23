import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { TextInput } from "../../../components/input";
import { SearchIcon } from "../../../components/icon";
import { useStore } from "../../../stores";
import { ViewToken } from "../../main";
import { TokenItem } from "../../main/components";
import { Column, Columns } from "../../../components/column";
import { Body2 } from "../../../components/typography";
import { Checkbox } from "../../../components/checkbox";
import { ColorPalette } from "../../../styles";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SendSelectAssetPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const [allowIBCToken, setAllowIBCToken] = useState(false);

  const stakableBalances: ViewToken[] = chainStore.chainInfosInUI.flatMap(
    (chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      return {
        token:
          queries.queryBalances.getQueryBech32Address(accountAddress).stakable
            .balance,
        chainInfo,
      };
    }
  );

  return (
    <HeaderLayout title="Select Asset" left={<BackButton />}>
      <Styles.Container gutter="0.5rem">
        <TextInput
          placeholder="Search for a chain"
          left={<SearchIcon width="1.25rem" height="1.25rem" />}
        />

        <Columns sum={1} gutter="0.25rem">
          <Column weight={1} />

          <Body2 style={{ color: ColorPalette["gray-300"] }}>
            Hide IBC token
          </Body2>
          <Checkbox
            size="small"
            checked={allowIBCToken}
            onChange={setAllowIBCToken}
          />
        </Columns>

        {stakableBalances.map((viewToken) => {
          return (
            <TokenItem
              viewToken={viewToken}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            />
          );
        })}
      </Styles.Container>
    </HeaderLayout>
  );
});
