import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "../../../../components/modal";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import {
  BaseTypography,
  Subtitle1,
  Subtitle3,
} from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { HorizontalRadioGroup } from "../../../../components/radio-group";
import { YAxis } from "../../../../components/axis";
import { Stack } from "../../../../components/stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { IRecipientConfig } from "@keplr-wallet/hooks";
import { Bleed } from "../../../../components/bleed";
import { RecentSendHistory } from "@keplr-wallet/background";
import { AddressItem } from "../address-item";
import SimpleBar from "simplebar-react";
import styled, { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";

type Type = "recent" | "contacts" | "accounts";

const AltTypography = styled(BaseTypography)`
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.25;

  margin-left: 0.25rem;
`;

export const AddressBookModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;

  historyType: string;
  recipientConfig: Pick<IRecipientConfig, "chainId" | "setValue">;

  permitSelfKeyInfo?: boolean;
}> = observer(
  ({ isOpen, close, historyType, recipientConfig, permitSelfKeyInfo }) => {
    const { analyticsStore, uiConfigStore, keyRingStore, chainStore } =
      useStore();
    const intl = useIntl();
    const theme = useTheme();

    const [type, setType] = useState<Type>("recent");

    const [recents, setRecents] = useState<RecentSendHistory[]>([]);
    const [accounts, setAccounts] = useState<
      ({
        name: string;
        hexAddress: string;
        pubKey: Uint8Array;
        address: Uint8Array;
        isNanoLedger: boolean;
      } & {
        vaultId: string;
      })[]
    >([]);

    useEffect(() => {
      uiConfigStore.addressBookConfig
        .getRecentSendHistory(recipientConfig.chainId, historyType)
        .then((res) => {
          setRecents(res);
        });
    }, [historyType, recipientConfig.chainId, uiConfigStore.addressBookConfig]);

    useEffect(() => {
      (() => {
        return uiConfigStore.addressBookConfig.getVaultStarknetKeysSettled(
          recipientConfig.chainId,
          permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id
        );
      })().then((keys) => {
        setAccounts(
          keys
            .filter((res) => {
              return res.status === "fulfilled";
            })
            .map((res) => {
              if (res.status === "fulfilled") {
                return res.value;
              }
              throw new Error("Unexpected status");
            })
        );
      });
    }, [
      keyRingStore.selectedKeyInfo?.id,
      permitSelfKeyInfo,
      recipientConfig.chainId,
      uiConfigStore.addressBookConfig,
    ]);

    const modularChainInfo = chainStore.getModularChain(
      recipientConfig.chainId
    );
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`${recipientConfig.chainId} is not starknet chain`);
    }

    const datas: {
      timestamp?: number;
      name?: string;
      address: string;

      isSelf?: boolean;
    }[] = (() => {
      switch (type) {
        case "recent": {
          return recents
            .map((recent) => {
              return {
                timestamp: recent.timestamp,
                address: recent.recipient,
              };
            })
            .filter((recent) => {
              // 이 체크 필요없어보이지만 그냥 원래 있었기 때문에 남김
              if (!recent.address.startsWith("0x")) {
                return false;
              }

              return true;
            });
        }
        case "contacts": {
          return uiConfigStore.addressBookConfig
            .getAddressBook(recipientConfig.chainId)
            .map((addressData) => {
              return {
                name: addressData.name,
                address: addressData.address,
              };
            })
            .filter((contact) => {
              // 이 체크 필요없어보이지만 그냥 원래 있었기 때문에 남김
              if (
                !contact.address.startsWith("0x") &&
                !contact.address.endsWith(".stark")
              ) {
                return false;
              }

              return true;
            });
        }
        case "accounts": {
          return accounts.reduce<
            { name: string; address: string; isSelf: boolean }[]
          >((acc, account) => {
            const isSelf = keyRingStore.selectedKeyInfo?.id === account.vaultId;

            acc.push({
              name: account.name,
              address: account.hexAddress,
              isSelf,
            });

            return acc;
          }, []);
        }
        default: {
          return [];
        }
      }
    })();

    return (
      <Modal isOpen={isOpen} close={close} align="bottom" maxHeight="95vh">
        <Box
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          paddingX="0.75rem"
          paddingTop="1rem"
        >
          <Box paddingX="0.5rem" paddingY="0.375rem">
            <Subtitle1>
              <FormattedMessage id="components.address-book-modal.title" />
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
            <SimpleBar
              style={{
                maxHeight: "23.625rem",
                minHeight: "14.875rem",
                overflowY: "auto",
              }}
            >
              <Stack gutter="0.75rem">
                {(() => {
                  if (type !== "accounts" || !permitSelfKeyInfo) {
                    return datas.map((data, i) => {
                      return (
                        <AddressItem
                          key={i}
                          timestamp={data.timestamp}
                          name={data.name}
                          address={data.address}
                          onClick={() => {
                            recipientConfig.setValue(data.address);
                            close();
                          }}
                        />
                      );
                    });
                  }

                  const selfAccount = datas.find((data) => data.isSelf);
                  const otherAccounts = datas.filter((data) => !data.isSelf);

                  return (
                    <React.Fragment>
                      {selfAccount ? (
                        <React.Fragment>
                          <AltTypography>
                            <FormattedMessage id="components.address-book-modal.current-wallet" />
                          </AltTypography>
                          <AddressItem
                            name={selfAccount.name}
                            address={selfAccount.address}
                            onClick={() => {
                              recipientConfig.setValue(selfAccount.address);
                              close();
                            }}
                            highlight={true}
                          />
                          <Gutter size="1.375rem" />
                        </React.Fragment>
                      ) : null}

                      {otherAccounts.length > 0 ? (
                        <React.Fragment>
                          <AltTypography>
                            <FormattedMessage id="components.address-book-modal.other-wallet" />
                          </AltTypography>
                          {otherAccounts.map((data, i) => {
                            return (
                              <AddressItem
                                key={i}
                                name={data.name}
                                address={data.address}
                                onClick={() => {
                                  recipientConfig.setValue(data.address);
                                  close();
                                }}
                              />
                            );
                          })}
                        </React.Fragment>
                      ) : null}
                    </React.Fragment>
                  );
                })()}
                <Gutter size="0.75rem" />
              </Stack>
            </SimpleBar>
          ) : (
            <Box
              alignX="center"
              alignY="center"
              style={{
                height: "14.875rem",
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-400"],
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
  }
);
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
