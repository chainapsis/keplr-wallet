import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import styled from "styled-components";
import { Subtitle1, Subtitle3 } from "../typography";
import { Gutter } from "../gutter";
import { HorizontalRadioGroup } from "../radio-group";
import { YAxis } from "../axis";
import { Stack } from "../stack";
import Color from "color";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Key } from "@keplr-wallet/types";
import { IMemoConfig, IRecipientConfig } from "@keplr-wallet/hooks";
import { Bleed } from "../bleed";
import { RecentSendHistory } from "@keplr-wallet/background";
import { AddressItem } from "../address-item";
import { useIntl } from "react-intl";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
  `,
  ListContainer: styled.div`
    flex: 1;
    overflow-y: auto;
  `,

  AddressItemContainer: styled(Box)`
    background-color: ${ColorPalette["gray-600"]};
    &:hover {
      background-color: ${Color(ColorPalette["gray-500"]).alpha(0.5).string()};
    }
  `,
};

type Type = "recent" | "contacts" | "accounts";

export const AddressBookModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  historyType: string;
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
}> = observer(({ isOpen, close, historyType, recipientConfig, memoConfig }) => {
  const { analyticsStore, uiConfigStore, keyRingStore } = useStore();
  const intl = useIntl();

  // TODO: Implement "recent"
  const [type, setType] = useState<Type>("recent");

  const [recents, setRecents] = useState<RecentSendHistory[]>([]);
  const [accounts, setAccounts] = useState<Key[]>([]);

  useEffect(() => {
    uiConfigStore.addressBookConfig
      .getRecentSendHistory(recipientConfig.chainId, historyType)
      .then((res) => {
        setRecents(res);
      });
  }, [historyType, recipientConfig.chainId, uiConfigStore.addressBookConfig]);

  useEffect(() => {
    uiConfigStore.addressBookConfig
      .getEnabledVaultCosmosKeysSettled(
        recipientConfig.chainId,
        keyRingStore.selectedKeyInfo?.id
      )
      .then((keys) => {
        setAccounts(
          keys
            .filter((res) => {
              return res.status === "fulfilled";
            })
            .map((res) => {
              if (res.status === "fulfilled") {
                return res.value;
              }
              throw new Error(
                intl.formatMessage({ id: "error.unexpected-status" })
              );
            })
        );
      });
  }, [
    keyRingStore.selectedKeyInfo?.id,
    recipientConfig.chainId,
    uiConfigStore.addressBookConfig,
  ]);

  const datas: {
    timestamp?: number;
    name?: string;
    address: string;
    memo?: string;
  }[] = (() => {
    switch (type) {
      case "recent": {
        return recents.map((recent) => {
          return {
            timestamp: recent.timestamp,
            address: recent.recipient,
            memo: recent.memo,
          };
        });
      }
      case "contacts": {
        return uiConfigStore.addressBookConfig
          .getAddressBook(recipientConfig.chainId)
          .map((addressData) => {
            return {
              name: addressData.name,
              address: addressData.address,
              memo: addressData.memo,
            };
          });
      }
      case "accounts": {
        return accounts.map((account) => {
          return {
            name: account.name,
            address: account.bech32Address,
          };
        });
      }
      default: {
        return [];
      }
    }
  })();

  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <Box
        maxHeight="30.625rem"
        minHeight="21.5rem"
        backgroundColor={ColorPalette["gray-600"]}
        paddingX="0.75rem"
        paddingTop="1rem"
      >
        <Box paddingX="0.5rem" paddingY="0.375rem">
          <Subtitle1
            style={{
              color: ColorPalette["white"],
            }}
          >
            Address Book
          </Subtitle1>
        </Box>

        <Gutter size="0.75rem" />

        <YAxis alignX="left">
          <HorizontalRadioGroup
            items={[
              {
                key: "recent",
                text: intl.formatMessage({
                  id: "components.address-book-modal.recent-tab",
                }),
              },
              {
                key: "contacts",
                text: intl.formatMessage({
                  id: "components.address-book-modal.contacts-tab",
                }),
              },
              {
                key: "accounts",
                text: intl.formatMessage({
                  id: "components.address-book-modal.my-account-tab",
                }),
              },
            ]}
            selectedKey={type}
            onSelect={(key) => {
              analyticsStore.logEvent("click_addressBook_tab", {
                tabName: key,
              });
              setType(key as Type);
            }}
          />
        </YAxis>

        <Gutter size="0.75rem" />

        {datas.length > 0 ? (
          <Styles.ListContainer>
            <Stack gutter="0.75rem">
              {datas.map((data, i) => {
                return (
                  <AddressItem
                    key={i}
                    timestamp={data.timestamp}
                    name={data.name}
                    address={data.address}
                    memo={data.memo}
                    isShowMemo={type !== "accounts"}
                    onClick={() => {
                      recipientConfig.setValue(data.address);
                      memoConfig.setValue(data.memo ?? "");
                      close();
                    }}
                  />
                );
              })}
              <Gutter size="0.75rem" />
            </Stack>
          </Styles.ListContainer>
        ) : (
          <Box
            alignX="center"
            alignY="center"
            style={{
              flex: 1,
              color: ColorPalette["gray-400"],
            }}
          >
            <Bleed top="3rem">
              <YAxis alignX="center">
                <EmptyIcon size="4.5rem" />
                <Gutter size="1.25rem" />
                <Subtitle3>
                  {(() => {
                    switch (type) {
                      case "accounts":
                        return intl.formatMessage({
                          id: "components.address-book-modal.empty-view-accounts",
                        });
                      default:
                        return intl.formatMessage({
                          id: "components.address-book-modal.empty-view-default",
                        });
                    }
                  })()}
                </Subtitle3>
              </YAxis>
            </Bleed>
          </Box>
        )}
      </Box>
    </Modal>
  );
});
const EmptyIcon: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 72 72"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7.5"
        d="M45.5 40.5h-18m12.182-21.568l-6.364-6.364a4.5 4.5 0 00-3.182-1.318H14A6.75 6.75 0 007.25 18v36A6.75 6.75 0 0014 60.75h45A6.75 6.75 0 0065.75 54V27A6.75 6.75 0 0059 20.25H42.864a4.5 4.5 0 01-3.182-1.318z"
      />
    </svg>
  );
};
