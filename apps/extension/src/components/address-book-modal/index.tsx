import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { BaseTypography, Subtitle1, Subtitle3 } from "../typography";
import { Gutter } from "../gutter";
import { HorizontalRadioGroup } from "../radio-group";
import { YAxis } from "../axis";
import { Stack } from "../stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { AppCurrency, Key } from "@keplr-wallet/types";
import { IMemoConfig, IRecipientConfig } from "@keplr-wallet/hooks";
import { Bleed } from "../bleed";
import { RecentSendHistory } from "@keplr-wallet/background";
import { AddressItem } from "../address-item";
import SimpleBar from "simplebar-react";
import styled, { useTheme } from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";
import { DenomHelper } from "@keplr-wallet/common";
import { SearchTextInput } from "../input";

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
  recipientConfig: IRecipientConfig;
  memoConfig: IMemoConfig;
  currency: AppCurrency;

  permitSelfKeyInfo?: boolean;
}> = observer(
  ({
    isOpen,
    close,
    historyType,
    recipientConfig,
    memoConfig,
    currency,
    permitSelfKeyInfo,
  }) => {
    const { analyticsStore, uiConfigStore, keyRingStore, chainStore } =
      useStore();
    const intl = useIntl();
    const theme = useTheme();

    const [type, setType] = useState<Type>("recent");

    const [searchText, setSearchText] = useState("");
    const [debounceTrimmedSearchText, setDebounceTrimmedSearchText] =
      useState<string>("");
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebounceTrimmedSearchText(searchText.trim());
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }, [searchText]);

    const [recents, setRecents] = useState<RecentSendHistory[]>([]);
    const [accounts, setAccounts] = useState<
      (Key & {
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
      if (type !== "accounts") return;
      (() => {
        if (!debounceTrimmedSearchText) {
          return uiConfigStore.addressBookConfig.getVaultCosmosKeysSettled(
            recipientConfig.chainId,
            permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id
          );
        } else {
          return uiConfigStore.addressBookConfig.getVaultCosmosKeysWithSearchSettled(
            debounceTrimmedSearchText,
            recipientConfig.chainId,
            permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id
          );
        }
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
      type,
      keyRingStore.selectedKeyInfo?.id,
      permitSelfKeyInfo,
      recipientConfig.chainId,
      uiConfigStore.addressBookConfig,
      debounceTrimmedSearchText,
    ]);

    const chainInfo = chainStore.getChain(recipientConfig.chainId);
    const isEVMChain = chainStore.isEvmChain(chainInfo.chainId);
    const isEVMOnlyChain = chainStore.isEvmOnlyChain(chainInfo.chainId);
    const isERC20 = new DenomHelper(currency.coinMinimalDenom).type === "erc20";

    const datas: {
      timestamp?: number;
      name?: string;
      address: string;
      memo?: string;

      isSelf?: boolean;
    }[] = (() => {
      switch (type) {
        case "recent": {
          return recents
            .map((recent) => {
              return {
                timestamp: recent.timestamp,
                address: recent.recipient,
                memo: recent.memo,
              };
            })
            .filter((recent) => {
              if (isERC20 && !recent.address.startsWith("0x")) {
                return false;
              }

              return true;
            });
        }
        case "contacts": {
          const searchRegex = debounceTrimmedSearchText
            ? new RegExp(debounceTrimmedSearchText, "i")
            : null;

          return uiConfigStore.addressBookConfig
            .getAddressBook(recipientConfig.chainId)
            .map((addressData) => {
              return {
                name: addressData.name,
                address: addressData.address,
                memo: addressData.memo,
              };
            })
            .filter((contact) => {
              if (isERC20 && !contact.address.startsWith("0x")) {
                return false;
              }

              if (!searchRegex) {
                return true;
              }

              return (
                searchRegex.test(contact.name) ||
                searchRegex.test(contact.address)
              );
            });
        }
        case "accounts": {
          return accounts.reduce<
            { name: string; address: string; isSelf: boolean }[]
          >((acc, account) => {
            const isSelf = keyRingStore.selectedKeyInfo?.id === account.vaultId;

            if (!isERC20 && !isEVMOnlyChain) {
              acc.push({
                name: account.name,
                address: account.bech32Address,
                isSelf,
              });
            }

            if (isEVMChain) {
              acc.push({
                name: account.name,
                address: account.ethereumHexAddress,
                isSelf,
              });
            }

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

          {type !== "recent" ? (
            <React.Fragment>
              <SearchTextInput
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                placeholder={intl.formatMessage({
                  id: "components.address-book-modal.my-account-tab.input.search.placeholder",
                })}
              />
              <Gutter size="0.75rem" />
            </React.Fragment>
          ) : null}

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
                          memo={data.memo}
                          isShowMemo={type !== "accounts"}
                          onClick={() => {
                            recipientConfig.setValue(data.address);
                            memoConfig.setValue(data.memo ?? "");
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
                            isShowMemo={false}
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
                                isShowMemo={false}
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
