import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useLayoutEffect } from "react";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { Dropdown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { AddressItem } from "../../../../components/address-item";
import { useConfirm } from "../../../../hooks/confirm";

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
  const confirm = useConfirm();

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
            <Dropdown
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
                <AddressItem
                  key={i}
                  name={data.name}
                  address={data.address}
                  memo={data.memo}
                  hasDropDown={true}
                  dropdownItems={[
                    {
                      key: "change-contact-label",
                      label: "Change Contact Label",
                      onSelect: () =>
                        navigate(
                          `/setting/contacts/add?chainId=${chainId}&editIndex=${i}`
                        ),
                    },
                    {
                      key: "delete-wallet",
                      label: "Delete Wallet",
                      onSelect: async () => {
                        if (
                          await confirm.confirm(
                            "Delete Address",
                            "Are you sure you want to delete this account?"
                          )
                        ) {
                          uiConfigStore.addressBookConfig.removeAddressBookAt(
                            chainId,
                            i
                          );
                        }
                      },
                    },
                  ]}
                />
              );
            })}
        </Styles.ItemList>
      </Styles.Container>
    </HeaderLayout>
  );
});
