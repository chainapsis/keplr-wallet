import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { DropDown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { ColorPalette } from "../../../../styles";
import { Body2, H5 } from "../../../../components/typography";
import { EllipsisIcon } from "../../../../components/icon";
import { Menu, MenuItem } from "../../../../components/menu";
import { useNavigate } from "react-router";
import { Dialog } from "../../../../components/dialog";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSearchParams } from "react-router-dom";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  ItemList: styled(Stack)`
    margin-top: 1rem;
  `,
};

export const SettingContactsList: FunctionComponent = observer(() => {
  const { chainStore, uiConfigStore } = useStore();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  // Handle "chainId" state by search params to persist the state between page changes.
  const paramChainId = searchParams.get("chainId");

  const chainId = paramChainId || chainStore.chainInfos[0].chainId;

  useLayoutEffect(() => {
    if (!paramChainId) {
      setSearchParams(
        { chainId: chainStore.chainInfos[0].chainId },
        {
          replace: true,
        }
      );
    }
  }, [chainStore.chainInfos, paramChainId, setSearchParams]);

  const items = chainStore.chainInfos.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Styles.Container>
        <Columns sum={1} alignY="bottom">
          <Box width="13rem">
            <DropDown
              items={items}
              selectedItemKey={chainId}
              onSelect={(key) => {
                setSearchParams(
                  { chainId: key },
                  {
                    replace: true,
                  }
                );
              }}
            />
          </Box>

          <Column weight={1} />

          <Button
            color="secondary"
            size="extraSmall"
            text="Add New"
            onClick={() => navigate(`/setting/contacts/add?chainId=${chainId}`)}
          />
        </Columns>

        <Styles.ItemList gutter="0.5rem">
          {uiConfigStore.addressBookConfig
            .getAddressBook(chainId)
            .map((data, i) => {
              return (
                <AddressItemView
                  key={i}
                  chainId={chainId}
                  name={data.name}
                  address={data.address}
                  memo={data.memo}
                  index={i}
                />
              );
            })}
        </Styles.ItemList>
      </Styles.Container>
    </HeaderLayout>
  );
});

const ItemStyles = {
  Container: styled.div`
    padding: 0.75rem 1rem;
    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.375rem;
  `,
  IconButton: styled.div`
    cursor: pointer;
  `,
  Menu: styled.ul<{ width: number }>`
    margin: ${(props) => `0 0 0 -${props.width * 0.8}px`};
    padding: 0;
    position: absolute;
    list-style: none;
    background-color: ${ColorPalette["gray-400"]};
    border-radius: 0.5rem;
  `,
  MenuItem: styled.li`
    padding: 0.75rem;
  `,
};

const AddressItemView: FunctionComponent<{
  chainId: string;
  name: string;
  address: string;
  memo: string;
  index: number;
}> = ({ chainId, name, address, memo, index }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <ItemStyles.Container>
      <Columns sum={1} alignY="center">
        <Stack gutter="0.25rem">
          <H5 style={{ color: ColorPalette["gray-10"] }}>{name}</H5>
          <Body2 style={{ color: ColorPalette["gray-200"] }}>
            {Bech32Address.shortenAddress(address, 30)}
          </Body2>

          <Body2 style={{ color: ColorPalette["gray-200"] }}>{memo}</Body2>
        </Stack>

        <Column weight={1} />

        <ItemStyles.IconButton>
          <Box onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <EllipsisIcon width="1.25rem" height="1.25rem" />
          </Box>

          <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} ratio={1.7}>
            <MenuItem
              label="Change Contact Label"
              onClick={() =>
                navigate(
                  `/setting/contacts/add?chainId=${chainId}&editIndex=${index}`
                )
              }
            />
            <MenuItem
              label="Delete Contact"
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </Menu>

          <Dialog
            isOpen={isDeleteModalOpen}
            setIsOpen={setIsDeleteModalOpen}
            title="Delete Address"
            paragraph="Are you sure you want to delete this account?"
            onClickYes={() => {}}
            onClickCancel={() => {}}
          />
        </ItemStyles.IconButton>
      </Columns>
    </ItemStyles.Container>
  );
};
