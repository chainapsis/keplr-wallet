import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { Body2, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { DropDown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { CopyFillIcon, KeyIcon, TrashIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";
import { Dialog } from "../../../../components/dialog";
import { EmptyView } from "../../../../components/empty-view";
import { CW20Currency, Secret20Currency } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
    text-align: center;
    margin-bottom: 0.75rem;
  `,
};

export const SettingTokenListPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const { chainStore } = useStore();

  const [chainId, setChainId] = useState<string>(
    chainStore.chainInfos[0].chainId
  );

  const chainInfo = chainStore.chainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  );

  const isSecretWasm =
    chainInfo?.features && chainInfo.features.includes("secretwasm");

  const appCurrencies = chainInfo?.currencies.filter((currency) => {
    if (isSecretWasm) {
      return "type" in currency && currency.type === "secret20";
    } else {
      return "type" in currency && currency.type === "cw20";
    }
  });

  const items = chainStore.chainInfosInUI.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  return (
    <HeaderLayout title="Manage Token List" left={<BackButton />}>
      <Styles.Container gutter="0.5rem">
        <Styles.Paragraph>
          Only for the tokens that are added manually via contract addresses
        </Styles.Paragraph>

        <Columns sum={1} alignY="bottom">
          <Box width="13rem">
            <DropDown
              items={items}
              selectedItemKey={chainId}
              onSelect={setChainId}
            />
          </Box>

          <Column weight={1} />

          <Button
            color="secondary"
            size="extraSmall"
            text="Add Token"
            onClick={() => navigate(`/setting/token/add?chainId=${chainId}`)}
          />
        </Columns>

        {appCurrencies?.length === 0 ? (
          <EmptyView subject="token" />
        ) : (
          appCurrencies?.map((currency) => {
            const cosmwasmToken = currency as CW20Currency | Secret20Currency;
            return (
              <TokenItem
                key={cosmwasmToken.contractAddress}
                chainId={chainId}
                cosmwasmToken={cosmwasmToken}
              />
            );
          })
        )}
      </Styles.Container>
    </HeaderLayout>
  );
});

const ItemStyles = {
  Container: styled.div`
    padding: 1rem;
    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.375rem;
  `,
  Denom: styled(H5)`
    color: ${ColorPalette["gray-10"]};
  `,
  Address: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
  Icon: styled.div`
    color: ${ColorPalette["gray-10"]};
    cursor: pointer;
  `,
};

const TokenItem: FunctionComponent<{
  chainId: string;
  cosmwasmToken: CW20Currency | Secret20Currency;
}> = observer(({ chainId, cosmwasmToken }) => {
  const { tokensStore } = useStore();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <ItemStyles.Container>
      <Columns sum={1}>
        <Stack gutter="0.25rem">
          <ItemStyles.Denom>{cosmwasmToken.coinDenom}</ItemStyles.Denom>
          <ItemStyles.Address>
            {Bech32Address.shortenAddress(cosmwasmToken.contractAddress, 30)}
          </ItemStyles.Address>
        </Stack>

        <Column weight={1} />

        <Columns sum={1} gutter="0.5rem" alignY="center">
          {cosmwasmToken.type === "secret20" ? (
            <ItemStyles.Icon
              onClick={async (e) => {
                e.preventDefault();

                await copyText(cosmwasmToken.viewingKey);
              }}
            >
              <KeyIcon width="1.25rem" height="1.25rem" />
            </ItemStyles.Icon>
          ) : null}

          <ItemStyles.Icon
            onClick={async (e) => {
              e.preventDefault();

              await copyText(cosmwasmToken.contractAddress);
            }}
          >
            <CopyFillIcon width="1.25rem" height="1.25rem" />
          </ItemStyles.Icon>

          <ItemStyles.Icon onClick={() => setIsOpenDeleteModal(true)}>
            <TrashIcon width="1.25rem" height="1.25rem" />
          </ItemStyles.Icon>
        </Columns>
      </Columns>

      <Dialog
        isOpen={isOpenDeleteModal}
        setIsOpen={setIsOpenDeleteModal}
        paragraph="Are you sure you’d like to disable this token? You will not be able to
        see your balance or transfer until you add it again."
        onClickYes={async () => {
          await tokensStore.getTokensOf(chainId).removeToken(cosmwasmToken);
        }}
        onClickCancel={() => setIsOpenDeleteModal(false)}
      />
    </ItemStyles.Container>
  );
});
