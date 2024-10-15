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
import { EmptyView } from "../../../../components/empty-view";
import { Gutter } from "../../../../components/gutter";
import { useIntl } from "react-intl";

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
  const intl = useIntl();

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

  const items = chainStore.chainInfos
    .map((chainInfo) => {
      return {
        key: chainInfo.chainId,
        label: chainInfo.chainName,
      };
    })
    .concat(
      chainStore.modularChainInfos
        .filter((modularChainInfo) => "starknet" in modularChainInfo)
        .map((modularChainInfo) => {
          return {
            key: modularChainInfo.chainId,
            label: modularChainInfo.chainName,
          };
        })
    );

  const addresses = uiConfigStore.addressBookConfig.getAddressBook(chainId);

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.setting.general.contacts-title" })}
      left={<BackButton />}
    >
      <Styles.Container>
        <Columns sum={1} alignY="center">
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
              allowSearch={true}
            />
          </Box>

          <Column weight={1} />

          <Button
            color="secondary"
            size="extraSmall"
            text={intl.formatMessage({
              id: "page.setting.contacts.list.add-new-button",
            })}
            onClick={() => navigate(`/setting/contacts/add?chainId=${chainId}`)}
          />
        </Columns>

        <Styles.ItemList gutter="0.5rem">
          {addresses.length > 0 ? (
            addresses.map((data, i) => {
              return (
                <AddressItem
                  key={i}
                  name={data.name}
                  address={data.address}
                  memo={data.memo}
                  isShowMemo={true}
                  dropdownItems={[
                    {
                      key: "change-contact-label",
                      label: intl.formatMessage({
                        id: "page.setting.contacts.list.dropdown.edit-contact-label",
                      }),
                      onSelect: () =>
                        navigate(
                          `/setting/contacts/add?chainId=${chainId}&editIndex=${i}`
                        ),
                    },
                    {
                      key: "delete-contact",
                      label: intl.formatMessage({
                        id: "page.setting.contacts.list.dropdown.delete-contact-label",
                      }),
                      onSelect: async () => {
                        if (
                          await confirm.confirm(
                            intl.formatMessage({
                              id: "page.setting.contacts.list.dropdown.delete-contact-confirm-title",
                            }),
                            intl.formatMessage({
                              id: "page.setting.contacts.list.dropdown.delete-contact-confirm-paragraph",
                            })
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
            })
          ) : (
            <React.Fragment>
              <Gutter size="7.5rem" direction="vertical" />
              <EmptyView
                subject={intl.formatMessage({
                  id: "page.setting.contacts.list.empty-view-subject",
                })}
              />
            </React.Fragment>
          )}
        </Styles.ItemList>
      </Styles.Container>
    </HeaderLayout>
  );
});
