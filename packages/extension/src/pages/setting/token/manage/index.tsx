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
import { Modal } from "../../../../components/modal";
import { TokenDeleteModal } from "../delete-modal";

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

  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(true);

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
            onClick={() => navigate("/setting/token/add")}
          />
        </Columns>

        <TokenItem />
        <TokenItem />
        <TokenItem />

        <Modal isOpen={isOpenDeleteModal} yAlign="center">
          <TokenDeleteModal setIsOpen={setIsOpenDeleteModal} />
        </Modal>
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

const TokenItem: FunctionComponent = () => {
  return (
    <ItemStyles.Container>
      <Columns sum={1}>
        <Stack gutter="0.25rem">
          <ItemStyles.Denom>SSCRT</ItemStyles.Denom>
          <ItemStyles.Address>secret1k0jntykt7e..y4c9e8fzek</ItemStyles.Address>
        </Stack>

        <Column weight={1} />

        <Columns sum={1} gutter="0.5rem" alignY="center">
          <ItemStyles.Icon>
            <KeyIcon width="1.25rem" height="1.25rem" />
          </ItemStyles.Icon>

          <ItemStyles.Icon>
            <CopyFillIcon width="1.25rem" height="1.25rem" />
          </ItemStyles.Icon>

          <ItemStyles.Icon>
            <TrashIcon width="1.25rem" height="1.25rem" />
          </ItemStyles.Icon>
        </Columns>
      </Columns>
    </ItemStyles.Container>
  );
};
