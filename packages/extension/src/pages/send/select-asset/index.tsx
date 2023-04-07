import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../components/stack";
import { TextInput } from "../../../components/input";
import { SearchIcon } from "../../../components/icon";
import { useStore } from "../../../stores";
import { ViewToken } from "../../main";
import { TokenItem } from "../../main/components";
import { Box } from "../../../components/box";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
};

export const SendSelectAssetPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

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
      <Styles.Container>
        <TextInput
          placeholder="Search for a chain"
          left={<SearchIcon width="1.25rem" height="1.25rem" />}
        />

        <Box marginTop="0.5rem">
          <Stack gutter="0.5rem">
            {stakableBalances.map((viewToken) => {
              return (
                <TokenItem
                  viewToken={viewToken}
                  key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                />
              );
            })}
          </Stack>
        </Box>
      </Styles.Container>
    </HeaderLayout>
  );
});
